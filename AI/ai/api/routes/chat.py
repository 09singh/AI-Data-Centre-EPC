from fastapi import APIRouter, Depends, HTTPException
from loguru import logger
from ai.ai_agents.orchestrator.ai_orchestrator import AIOrchestrator
from ai.ai_agents.models import AIRequest
from ai.knowledge_engine.embeddings.embedding_service import EmbeddingService
from ai.knowledge_engine.retriever.search_service import SearchService
from ai.api.dependencies import get_ai_orchestrator, get_embedding_service, get_search_service
from ai.api.schemas.request_models import ChatRequest
from ai.api.schemas.response_models import ChatResponse

router = APIRouter(tags=["Conversational chat agent"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Process conversational chat queries with document retrieval"
)
async def process_chat(
    request: ChatRequest,
    orchestrator: AIOrchestrator = Depends(get_ai_orchestrator),
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    search_service: SearchService = Depends(get_search_service)
) -> ChatResponse:
    """Processes conversational chat query with context retrieval.

    1. Classifies the query domain.
    2. Performs vector similarity search.
    3. Truncates and builds conversation history context.
    4. Generates a natural language response using the Groq Llama3 client.

    Args:
        request: Chat query and session ID parameters packet.
        orchestrator: Injected agents pipeline orchestrator.
        embedding_service: Injected embedding model service.
        search_service: Injected similarity search service.

    Returns:
        ChatResponse: Structured response text, query category, token usage, and citations.
    """
    logger.info("Executing conversational chat endpoint for Session: {}", request.session_id)

    try:
        # Run similarity search query to get citations for the API response
        logger.debug("Retrieving search citations backing chat query.")
        query_vector = embedding_service.embed_text(request.query)
        search_res = search_service.search(
            query_text=request.query,
            query_vector=query_vector,
            filters=request.filters
        )

        # Build AIRequest packet to execute the main reasoning orchestrator pipeline
        ai_request = AIRequest(
            query=request.query,
            session_id=request.session_id,
            filters=request.filters
        )

        logger.debug("Executing AI project brain orchestrator.")
        ai_response = orchestrator.process_query(ai_request)

        return ChatResponse(
            query=ai_response.query,
            response=ai_response.response,
            query_type=ai_response.query_type,
            citations=search_res.citations,
            metadata=ai_response.metadata
        )

    except Exception as e:
        logger.error("Chat agent process failed: {}", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Conversational chat pipeline execution failed: {str(e)}"
        )
