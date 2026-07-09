from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class RetrievedChunk(BaseModel):
    """Represents a text chunk retrieved from the vector store with matching metrics."""

    chunk_id: str = Field(
        ...,
        description="Unique identifier of the matching document chunk"
    )
    text: str = Field(
        ...,
        description="Extracted cleaned text content of the chunk"
    )
    score: float = Field(
        ...,
        description="Calculated vector similarity search score"
    )
    page_numbers: List[int] = Field(
        default_factory=list,
        description="Page reference numbers containing the source text"
    )
    section_heading: Optional[str] = Field(
        default=None,
        description="Section heading header corresponding to the chunk"
    )
    document_id: Optional[str] = Field(
        default=None,
        description="Associated unique identifier of the parent document"
    )
    file_name: Optional[str] = Field(
        default=None,
        description="Source document name where this chunk resides"
    )
    custom_metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional chunk metadata properties retrieved"
    )


class Citation(BaseModel):
    """Structured citation reference linking retrieved knowledge to its source document."""

    document_name: str = Field(
        ...,
        description="Source file name (e.g. 'design_guidelines.pdf')"
    )
    document_id: str = Field(
        ...,
        description="Unique identifier of the source document"
    )
    chunk_id: str = Field(
        ...,
        description="Target text chunk identifier"
    )
    page_numbers: List[int] = Field(
        ...,
        description="Page number location within the source document"
    )
    section_heading: Optional[str] = Field(
        default=None,
        description="Document section hierarchy containing the cited text"
    )
    similarity_score: float = Field(
        ...,
        description="Similarity confidence rating"
    )


class SearchMetadata(BaseModel):
    """Metadata detailing parameters used during retrieval query execution."""

    query_latency_seconds: float = Field(
        ...,
        description="Time taken to execute similarity searches and filters"
    )
    top_k: int = Field(
        ...,
        description="Maximum count of matches requested"
    )
    score_threshold: float = Field(
        ...,
        description="Minimum score filter constraint applied"
    )
    filters_applied: Dict[str, Any] = Field(
        default_factory=dict,
        description="Dictionary of filters applied to the query"
    )
    reranker_applied: Optional[str] = Field(
        default=None,
        description="Active reranker engine description tag"
    )


class SearchResult(BaseModel):
    """Unified container object containing sorted hits, citations, and query parameters."""

    query_text: str = Field(
        ...,
        description="Original query text input (or query string)"
    )
    results: List[RetrievedChunk] = Field(
        ...,
        description="Ordered list of matching retrieved chunks"
    )
    citations: List[Citation] = Field(
        ...,
        description="Extracted citation references mapped 1-to-1 with results"
    )
    metadata: SearchMetadata = Field(
        ...,
        description="Execution and parameter metadata"
    )
