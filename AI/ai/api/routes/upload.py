import shutil
import tempfile
import uuid
import os
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from loguru import logger
from ai.config.settings import settings
from ai.document_processing.pipeline import DocumentProcessingPipeline
from ai.document_processing.exceptions import UnsupportedDocumentError, EmptyDocumentError, ExtractionError
from ai.knowledge_engine.embeddings.embedding_service import EmbeddingService
from ai.knowledge_engine.knowledge_base.knowledge_service import KnowledgeService
from ai.knowledge_engine.vector_store.vector_service import QdrantVectorService
from ai.api.dependencies import get_embedding_service, get_knowledge_service, get_vector_service
from ai.api.schemas.response_models import UploadResponse

router = APIRouter(tags=["Document uploads"])


@router.post(
    "/upload",
    response_model=UploadResponse,
    status_code=201,
    summary="Upload and index an engineering specification document (PDF, DOCX, XLSX)"
)
async def upload_document(
    file: UploadFile = File(...),
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    knowledge_service: KnowledgeService = Depends(get_knowledge_service),
    vector_service: QdrantVectorService = Depends(get_vector_service)
) -> UploadResponse:
    """Uploads, cleans, chunks, embeds, and indexes an engineering specification document.

    Supports PDF, DOCX, and XLSX extensions.

    Args:
        file: Multipart file upload payload.
        embedding_service: Injected text embedding model service.
        knowledge_service: Injected document registries metadata facade.
        vector_service: Injected Qdrant database CRUD service.

    Returns:
        UploadResponse: Metadata and processing statuses containing unique document ID.
    """
    logger.info("Received file upload request: '{}'", file.filename)

    # Validate file extension
    suffix = Path(file.filename).suffix.lower()
    if suffix not in [".pdf", ".docx", ".xlsx", ".xls"]:
        logger.error("Upload rejected: Unsupported file extension '{}'", suffix)
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{suffix}'. Supported formats: PDF, DOCX, XLSX, XLS."
        )

    # Save UploadFile stream to a secure temporary local path
    temp_dir = tempfile.gettempdir()
    temp_file_path = Path(temp_dir) / f"{uuid.uuid4().hex}{suffix}"

    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Parse document through extraction pipeline
        pipeline = DocumentProcessingPipeline()
        processed_doc = pipeline.process(temp_file_path)

        # Assign document_id deterministically or generate UUID
        document_id = f"doc_{uuid.uuid4().hex[:12]}"
        
        # Override file name in metadata to match uploaded file
        processed_doc.metadata.file_name = file.filename

        # 1. Register the document metadata and chunk index in the registry
        logger.debug("Registering document metadata in local knowledge service.")
        knowledge_service.register_processed_document(
            document_id=document_id,
            metadata=processed_doc.metadata,
            chunks=processed_doc.chunks
        )

        # 2. Generate embeddings vectors for the text chunks
        logger.debug("Generating dense vector embeddings for {} text chunks.", len(processed_doc.chunks))
        vector_embeddings = embedding_service.embed_chunks(processed_doc.chunks)

        # Inject document_id into metadata references so retrievers can filter by it
        for emb in vector_embeddings:
            emb.metadata_reference["document_id"] = document_id
            emb.metadata_reference["file_name"] = file.filename
            logger.info("[TRACE: upload.py] Modified metadata_reference keys: {}", list(emb.metadata_reference.keys()))
            logger.info("[TRACE: upload.py] Modified metadata_reference['text']: {}", repr(emb.metadata_reference.get("text")))

        # 3. Upsert coordinates vectors into Qdrant index collection
        logger.debug("Upserting vectors into Qdrant collection '{}'.", settings.COLLECTION_NAME)
        vector_service.insert_vectors(
            collection_name=settings.COLLECTION_NAME,
            embeddings=vector_embeddings
        )

        logger.info("Successfully uploaded and indexed document '{}' under ID '{}'", file.filename, document_id)
        
        return UploadResponse(
            document_id=document_id,
            file_name=file.filename,
            status="indexed",
            message="Document parsed, chunked, embedded, and indexed successfully.",
            metadata=processed_doc.metadata.model_dump()
        )

    except UnsupportedDocumentError as e:
        logger.error("Processing failed due to unsupported document structure: {}", str(e))
        raise HTTPException(status_code=400, detail=f"Invalid document contents: {str(e)}")
    except EmptyDocumentError as e:
        logger.error("Processing failed: File contains zero text context: {}", str(e))
        raise HTTPException(status_code=400, detail=f"Empty document: {str(e)}")
    except ExtractionError as e:
        logger.error("Pipeline extraction step failed: {}", str(e))
        raise HTTPException(status_code=500, detail=f"Extraction failure: {str(e)}")
    except Exception as e:
        logger.error("Unexpected failure during document upload processing: {}", str(e))
        raise HTTPException(status_code=500, detail=f"Upload processing failed: {str(e)}")
    finally:
        # Securely delete temporary file
        if temp_file_path.exists():
            os.remove(temp_file_path)
