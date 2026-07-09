import hashlib
import time
from pathlib import Path
from loguru import logger

from ai.document_processing.exceptions import UnsupportedDocumentError, EmptyDocumentError, ExtractionError
from ai.document_processing.models import ProcessedDocument, DocumentMetadata
from ai.document_processing.pdf_reader.reader import PDFReader
from ai.document_processing.docx_reader.reader import DOCXReader
from ai.document_processing.excel_reader.reader import ExcelReader
from ai.document_processing.text_cleaner.cleaner import TextCleaner
from ai.document_processing.metadata_extractor.extractor import MetadataExtractor
from ai.document_processing.chunking.chunker import Chunker


class DocumentProcessingPipeline:
    """Orchestrates the conversion of documents into structured chunks and metadata.

    Supports ingestion of PDF, DOCX, and Excel files.
    """

    def __init__(self):
        """Initializes the pipeline with required readers, cleaners, and extractors."""
        self.pdf_reader = PDFReader()
        self.docx_reader = DOCXReader()
        self.excel_reader = ExcelReader()
        self.text_cleaner = TextCleaner()
        self.metadata_extractor = MetadataExtractor()

    def process(self, file_path: Path, chunk_size: int = 1000, chunk_overlap: int = 200) -> ProcessedDocument:
        """Processes a document completely.

        Ingests, extracts text/tabular datasets in order, normalizes spacing,
        generates structured metadata, and partitions text into searchable chunks.

        Args:
            file_path: Absolute Path to the document file.
            chunk_size: Maximum character length per text chunk.
            chunk_overlap: Overlapping character padding between adjacent chunks.

        Returns:
            ProcessedDocument: Strongly typed representation of the processed output.

        Raises:
            FileNotFoundError: If the target file is missing.
            UnsupportedDocumentError: If the document format is unrecognized.
            CorruptedDocumentError: If parsing fails due to bad structure.
            EmptyDocumentError: If the document contains zero text content.
            ExtractionError: If metadata or chunk extraction step fails.
        """
        start_time = time.time()
        logger.info("Initializing document processing pipeline for: {}", file_path.name)

        if not file_path.exists():
            logger.error("File does not exist: {}", file_path)
            raise FileNotFoundError(f"Target file not found at: {file_path}")

        suffix = file_path.suffix.lower()
        supported = [".pdf", ".docx", ".xlsx", ".xls"]
        if suffix not in supported:
            logger.error("Unsupported file extension: {} for file {}", suffix, file_path.name)
            raise UnsupportedDocumentError(f"File extension '{suffix}' is not supported. Supported: {supported}")

        blocks = []

        # 1. Extraction (Reader) & Clean Stage
        try:
            if suffix == ".pdf":
                pages = self.pdf_reader.extract_text_by_page(file_path)
                for page in pages:
                    cleaned_txt = self.text_cleaner.clean(page["text"])
                    blocks.append({
                        "text": cleaned_txt,
                        "page_number": page["page_number"],
                        "section_heading": None
                    })

            elif suffix == ".docx":
                elements = self.docx_reader.extract_content(file_path)
                for idx, elem in enumerate(elements):
                    cleaned_txt = self.text_cleaner.clean(elem["text"])
                    heading = None
                    # Basic heading detection for paragraph elements
                    if elem["type"] == "paragraph":
                        txt_strip = cleaned_txt.strip()
                        if 3 < len(txt_strip) < 80 and (
                            txt_strip.isupper() or
                            any(txt_strip.startswith(str(i) + ".") for i in range(1, 20))
                        ):
                            heading = txt_strip

                    blocks.append({
                        "text": cleaned_txt,
                        "page_number": 1,  # DOCX defaults to page 1
                        "section_heading": heading
                    })

            elif suffix in [".xlsx", ".xls"]:
                sheets = self.excel_reader.extract_sheets_content(file_path)
                for idx, sheet in enumerate(sheets):
                    cleaned_txt = self.text_cleaner.clean(sheet["text"])
                    blocks.append({
                        "text": cleaned_txt,
                        "page_number": idx + 1,  # Sheets map to distinct page indexes
                        "section_heading": f"Sheet: {sheet['sheet_name']}"
                    })
        except (UnsupportedDocumentError, EmptyDocumentError) as e:
            raise
        except Exception as e:
            logger.error("Extraction stage failed for {}: {}", file_path.name, str(e))
            raise

        # Check total text volume
        full_text = "\n".join(b["text"] for b in blocks if b["text"]).strip()
        if not full_text:
            logger.error("Document processed without generating any text output: {}", file_path.name)
            raise EmptyDocumentError(f"No extractable text was found inside the document: {file_path.name}")

        # 2. Metadata Extraction Stage
        try:
            logger.debug("Extracting document container metadata fields for: {}", file_path.name)
            meta_dict = self.metadata_extractor.extract(file_path)
        except Exception as e:
            logger.error("Metadata parsing crashed for {}: {}", file_path.name, str(e))
            raise ExtractionError(f"Metadata extraction failed: {str(e)}")

        # 3. Text Chunking Stage
        try:
            logger.debug("Running document text chunk partitioning for: {}", file_path.name)
            # Create a localized deterministic hash signature for chunk generation references
            hasher = hashlib.sha256()
            hasher.update(file_path.name.encode("utf-8"))
            file_hash = hasher.hexdigest()[:16]

            chunker = Chunker(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
            chunks = chunker.chunk_document(file_hash, blocks)
        except Exception as e:
            logger.error("Chunking stage failed for {}: {}", file_path.name, str(e))
            raise ExtractionError(f"Text partitioning failed: {str(e)}")

        # 4. Pipeline Finalization Metrics
        duration = time.time() - start_time
        meta_dict["processing_duration_seconds"] = round(duration, 4)

        # Map dictionary values to Pydantic metadata model
        metadata_obj = DocumentMetadata(**meta_dict)

        logger.info(
            "Document processing pipeline completed successfully for {} in {:.4f}s. Generated {} chunks.",
            file_path.name,
            duration,
            len(chunks)
        )

        return ProcessedDocument(
            metadata=metadata_obj,
            full_extracted_text=full_text,
            chunks=chunks
        )
