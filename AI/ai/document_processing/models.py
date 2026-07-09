from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DocumentMetadata(BaseModel):
    """Strongly typed metadata extracted from the document."""

    file_name: str = Field(
        ...,
        description="Name of the file including extension"
    )
    file_extension: str = Field(
        ...,
        description="Extension of the file (e.g., '.pdf', '.docx', '.xlsx')"
    )
    file_size_bytes: int = Field(
        ...,
        description="Size of the file in bytes"
    )
    total_pages: int = Field(
        ...,
        description="Total page count of the document. For Excel, this is sheet count or 1."
    )
    author: Optional[str] = Field(
        default=None,
        description="Author metadata, if available"
    )
    creation_timestamp: Optional[str] = Field(
        default=None,
        description="Timestamp of document creation, if available"
    )
    processing_duration_seconds: float = Field(
        ...,
        description="Duration of document extraction pipeline in seconds"
    )
    processing_timestamp: str = Field(
        ...,
        description="ISO 8601 timestamp of when processing occurred"
    )
    sheet_names: Optional[List[str]] = Field(
        default=None,
        description="Names of sheets if the document is an Excel workbook"
    )
    custom_metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional key-value metadata pairs extracted"
    )


class DocumentChunk(BaseModel):
    """A single granular block of text extracted from the document, ready for indexing."""

    chunk_id: str = Field(
        ...,
        description="Unique identifier for the chunk (e.g., file-hash + index)"
    )
    text: str = Field(
        ...,
        description="The cleaned text content of this chunk"
    )
    page_numbers: List[int] = Field(
        default_factory=list,
        description="The source page number(s) containing the chunk text"
    )
    section_heading: Optional[str] = Field(
        default=None,
        description="The closest detected section heading above this chunk"
    )
    chunk_metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Chunk-specific metadata details (such as relative position, overlap details)"
    )


class ProcessedDocument(BaseModel):
    """The final strongly typed object returned by the document processing pipeline."""

    metadata: DocumentMetadata = Field(
        ...,
        description="Comprehensive document metadata"
    )
    full_extracted_text: str = Field(
        ...,
        description="Raw full extracted text combining all pages/paragraphs/sheets"
    )
    chunks: List[DocumentChunk] = Field(
        ...,
        description="A list of generated text chunks"
    )
