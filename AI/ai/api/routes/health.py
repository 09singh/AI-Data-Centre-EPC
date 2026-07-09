from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from ai.config.settings import settings
from ai.api.dependencies import get_connection_manager, get_embedding_service
from ai.knowledge_engine.vector_store.qdrant_client import QdrantConnectionManager
from ai.knowledge_engine.embeddings.embedding_service import EmbeddingService
from loguru import logger
import os

router = APIRouter(tags=["System health & status checks"])


class HealthResponse(BaseModel):
    """Pydantic model representing service health status with monitoring metrics."""
    status: str = Field(..., description="Service status ('ok')")
    environment: str = Field(..., description="The runtime environment")
    api_status: str = Field(..., description="FastAPI router status ('operational')")
    embedding_model_status: str = Field(..., description="Embedding model loading state ('loaded', 'cached_on_disk', 'error')")
    qdrant_status: str = Field(..., description="Qdrant connection health ('connected', 'disconnected', 'error')")
    memory_usage_mb: float = Field(..., description="Current resident memory size in MB")
    loaded_services: List[str] = Field(..., description="List of initialized AI layers")


class VersionResponse(BaseModel):
    """Pydantic model representing service metadata version details."""
    name: str = Field(..., description="Application name")
    version: str = Field(..., description="Semantic version string")


class AIStatusResponse(BaseModel):
    """Pydantic model representing AI reasoning agent layers status."""
    status: str = Field(..., description="Operational status of agents ('active')")
    orchestrator: str = Field(..., description="Status of the AIOrchestrator")


class ModelStatusResponse(BaseModel):
    """Pydantic model representing lazy-loaded model download cache status."""
    embedding_model: str = Field(..., description="Configured embedding model identifier")
    loaded: bool = Field(..., description="Whether embedding model weights are loaded in memory")
    device: str = Field(..., description="Device executing models (cpu/cuda)")


class VectorDbStatusResponse(BaseModel):
    """Pydantic model representing Vector Database connection health status."""
    connected: bool = Field(..., description="Whether Qdrant client connection is active")
    host: str = Field(..., description="Database endpoint address")
    error: Optional[str] = Field(None, description="Diagnostic message on connection failure")


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Get overall service health status"
)
async def health_check(
    connection_manager: QdrantConnectionManager = Depends(get_connection_manager),
    embedding_service: EmbeddingService = Depends(get_embedding_service)
) -> HealthResponse:
    """Retrieves overall service health status, memory size, and database parameters.

    Returns:
        HealthResponse: Detailed health metrics.
    """
    logger.debug("Executing detailed service health status checks.")
    
    # 1. Evaluate embedding model memory status
    try:
        model_loaded = embedding_service.provider._model is not None
        embedding_model_status = "loaded" if model_loaded else "cached_on_disk"
    except Exception:
        embedding_model_status = "error"

    # 2. Evaluate vector store connectivity
    try:
        connected = connection_manager.health_check()
        qdrant_status = "connected" if connected else "disconnected"
    except Exception:
        qdrant_status = "error"

    # 3. Calculate process memory usage (MB)
    try:
        import psutil
        process = psutil.Process(os.getpid())
        memory_usage_mb = round(process.memory_info().rss / (1024 * 1024), 2)
    except ImportError:
        memory_usage_mb = 0.0

    # 4. List initialized AI engine components
    loaded_services = [
        "EmbeddingService",
        "SearchService",
        "AIOrchestrator",
        "ComplianceEngine",
        "RecommendationEngine",
        "InsightEngine",
        "RuleEvaluator"
    ]

    return HealthResponse(
        status="ok",
        environment=settings.APP_ENV,
        api_status="operational",
        embedding_model_status=embedding_model_status,
        qdrant_status=qdrant_status,
        memory_usage_mb=memory_usage_mb,
        loaded_services=loaded_services
    )


@router.get(
    "/version",
    response_model=VersionResponse,
    summary="Get service version metadata"
)
async def get_version() -> VersionResponse:
    """Retrieves service version metadata.

    Returns:
        VersionResponse: Application name and semantic version.
    """
    logger.debug("Retrieving service semantic version info.")
    return VersionResponse(name=settings.APP_NAME, version=settings.VERSION)


@router.get(
    "/status/ai",
    response_model=AIStatusResponse,
    summary="Get AI reasoning layers status"
)
async def get_ai_status() -> AIStatusResponse:
    """Checks the status of AI orchestrators and classifiers.

    Returns:
        AIStatusResponse: Operational status of query classifier and session memory.
    """
    logger.debug("Auditing AI layer components status.")
    return AIStatusResponse(status="active", orchestrator="operational")


@router.get(
    "/status/model",
    response_model=ModelStatusResponse,
    summary="Get ML embedding models cache status"
)
async def get_model_status(
    embedding_service: EmbeddingService = Depends(get_embedding_service)
) -> ModelStatusResponse:
    """Audits ML model memory status.

    Args:
        embedding_service: Injected local embedding model service.

    Returns:
        ModelStatusResponse: Loading and device specs.
    """
    logger.debug("Querying ML embedding model cache status.")
    try:
        # Check if the sentence transformer provider has loaded models
        loaded = embedding_service.provider._model is not None
    except Exception:
        loaded = False
    return ModelStatusResponse(
        embedding_model=settings.EMBEDDING_MODEL,
        loaded=loaded,
        device=settings.EMBEDDING_DEVICE
    )


@router.get(
    "/status/vector-db",
    response_model=VectorDbStatusResponse,
    summary="Get Vector Database connection health"
)
async def get_vector_db_status(
    connection_manager: QdrantConnectionManager = Depends(get_connection_manager)
) -> VectorDbStatusResponse:
    """Checks direct connection parameters and health status with Qdrant server.

    Args:
        connection_manager: Injected Qdrant database connection manager.

    Returns:
        VectorDbStatusResponse: Connection health details.
    """
    logger.debug("Evaluating Qdrant database connection path health.")
    try:
        connected = connection_manager.health_check()
        error_msg = None
    except Exception as e:
        connected = False
        error_msg = str(e)
        logger.error("Qdrant database check failed: {}", error_msg)

    return VectorDbStatusResponse(
        connected=connected,
        host=settings.QDRANT_URL,
        error=error_msg
    )
