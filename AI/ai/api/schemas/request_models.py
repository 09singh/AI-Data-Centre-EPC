from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    """Request model for vector similarity search."""

    query: str = Field(
        ...,
        description="The plain text query string to search for"
    )
    top_k: Optional[int] = Field(
        default=None,
        description="Optional limit on the number of retrieved chunks (defaults to global settings)"
    )
    score_threshold: Optional[float] = Field(
        default=None,
        description="Optional minimum similarity score threshold override"
    )
    filters: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional metadata key-value filters to restrict search space"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "query": "redundant chiller cooling loops",
                "top_k": 3,
                "score_threshold": 0.6,
                "filters": {
                    "document_id": "doc_001"
                }
            }
        }
    }


class ChatRequest(BaseModel):
    """Request model for conversational chat queries."""

    query: str = Field(
        ...,
        description="The message query from the user"
    )
    session_id: str = Field(
        ...,
        description="Unique identifier for tracking the conversation session history"
    )
    filters: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional metadata filters to apply during context retrieval"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "query": "What are the redundancy specifications for the chiller bays?",
                "session_id": "session_test_99",
                "filters": {
                    "document_id": "doc_001"
                }
            }
        }
    }


class ComplianceRequest(BaseModel):
    """Request model for triggering document compliance auditing."""

    document_id: str = Field(
        ...,
        description="The document ID to evaluate for compliance"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "document_id": "doc_001"
            }
        }
    }


class RecommendationRequest(BaseModel):
    """Request model for generating corrective action recommendations."""

    document_id: str = Field(
        ...,
        description="The document ID to generate recommendations for"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "document_id": "doc_001"
            }
        }
    }
