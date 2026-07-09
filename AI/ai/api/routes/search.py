from fastapi import APIRouter, Depends, HTTPException
from loguru import logger
from ai.knowledge_engine.embeddings.embedding_service import EmbeddingService
from ai.knowledge_engine.retriever.search_service import SearchService
from ai.api.dependencies import get_embedding_service, get_search_service
from ai.api.schemas.request_models import SearchRequest
from ai.api.schemas.response_models import SearchResponse

router = APIRouter(tags=["Knowledge Retrieval & Search"])


@router.post(
    "/search",
    response_model=SearchResponse,
    summary="Perform a semantic search over indexed engineering documents"
)
async def perform_search(
    request: SearchRequest,
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    search_service: SearchService = Depends(get_search_service)
) -> SearchResponse:
    """Executes a semantic vector search query.

    Matches query embedding against indexed chunks, applies optional metadata
    key-value filters, and formats citation references.

    Args:
        request: Search parameters query request model.
        embedding_service: Injected embedding model service.
        search_service: Injected search orchestration service.

    Returns:
        SearchResponse: Ranked matching chunks, citations list, and timing metadata.
    """
    logger.info("Executing semantic search endpoint for: '{}'", request.query)

    try:
        # 1. Convert plain text query into a 384-dimensional dense vector
        logger.debug("Generating vector coordinates query representation.")
        query_vector = embedding_service.embed_text(request.query)

        # 2. Query Qdrant vector database similarity match pipeline
        logger.debug(
            "Executing similarity search (Top-K: {}, Threshold: {})",
            request.top_k,
            request.score_threshold
        )
        search_result = search_service.search(
            query_text=request.query,
            query_vector=query_vector,
            top_k=request.top_k,
            score_threshold=request.score_threshold,
            filters=request.filters
        )

        return SearchResponse(
            query=search_result.query_text,
            results=search_result.results,
            citations=search_result.citations,
            metadata=search_result.metadata
        )

    except Exception as e:
        logger.error("Search pipeline execution failed: {}", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Semantic search query execution failed: {str(e)}"
        )
