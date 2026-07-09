from fastapi import APIRouter, Depends, HTTPException
from loguru import logger
from ai.knowledge_engine.embeddings.embedding_service import EmbeddingService
from ai.knowledge_engine.retriever.search_service import SearchService
from ai.ai_agents.compliance.compliance_engine import ComplianceEngine
from ai.api.dependencies import get_embedding_service, get_search_service, get_compliance_engine
from ai.api.schemas.request_models import ComplianceRequest
from ai.api.schemas.response_models import ComplianceResponse

router = APIRouter(tags=["Compliance auditing"])


@router.post(
    "/compliance",
    response_model=ComplianceResponse,
    summary="Audits a document against standard specifications and check deviations"
)
async def evaluate_compliance(
    request: ComplianceRequest,
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    search_service: SearchService = Depends(get_search_service),
    compliance_engine: ComplianceEngine = Depends(get_compliance_engine)
) -> ComplianceResponse:
    """Evaluates specification compliance and scans safety standard deviations.

    Loads indexed document chunks from the vector database and runs checkers
    locally, applying keyword requirements checks and deviation flags.

    Args:
        request: Compliance auditing request model.
        embedding_service: Injected embedding model service.
        search_service: Injected similarity search service.
        compliance_engine: Injected compliance auditing orchestrator.

    Returns:
        ComplianceResponse: Compliance score, issues detected, and status.
    """
    logger.info("Evaluating compliance for document: '{}'", request.document_id)

    try:
        # Retrieve all chunks for the document from Qdrant using the search-free Scroll API
        logger.debug("Retrieving indexed text chunks for document '{}' from Qdrant.", request.document_id)
        import time
        start_retrieval = time.time()
        chunks = search_service.get_document_chunks(request.document_id)
        retrieval_latency = time.time() - start_retrieval
        
        logger.info(
            "Compliance retrieval metrics: document_id='{}', retrieved_chunks={}, latency={:.4f}s",
            request.document_id,
            len(chunks),
            retrieval_latency
        )

        if not chunks:
            logger.error("No chunks indexed for document ID: '{}'", request.document_id)
            raise HTTPException(
                status_code=404,
                detail=f"No chunks found for document ID '{request.document_id}'. Ensure it was uploaded successfully."
            )

        # Run compliance engine audits
        logger.debug("Executing local compliance checks over {} chunks.", len(chunks))
        comp_result = compliance_engine.evaluate(chunks)

        return ComplianceResponse(
            specification_name=comp_result.specification_name or "Project Specification",
            compliance_score=comp_result.compliance_score,
            is_compliant=comp_result.is_compliant,
            issues_detected=comp_result.issues_detected,
            evaluated_count=comp_result.evaluated_count
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Compliance evaluation pipeline failed: {}", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Compliance evaluation failed: {str(e)}"
        )
