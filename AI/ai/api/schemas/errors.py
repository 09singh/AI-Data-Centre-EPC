from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    """Unified error response model returned on system failures or validation issues."""

    detail: str = Field(
        ...,
        description="User-friendly error message description"
    )
    error_type: str = Field(
        ...,
        description="Specific error category classification classification"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "detail": "Document with ID doc_123 not found in registry.",
                "error_type": "NotFoundError"
            }
        }
    }
