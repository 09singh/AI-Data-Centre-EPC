from fastapi import APIRouter, Depends, HTTPException
from loguru import logger
from ai.knowledge_engine.embeddings.embedding_service import EmbeddingService
from ai.knowledge_engine.retriever.search_service import SearchService
from ai.ai_agents.compliance.compliance_engine import ComplianceEngine
from ai.ai_agents.recommendation.recommendation_engine import RecommendationEngine
from ai.api.dependencies import get_embedding_service, get_search_service, get_compliance_engine, get_recommendation_engine
from ai.api.schemas.request_models import RecommendationRequest
from ai.api.schemas.response_models import RecommendationResponse

router = APIRouter(tags=["Recommendations"])


@router.post(
    "/recommendations",
    response_model=RecommendationResponse,
    summary="Generate prioritized corrective actions for specification deviations"
)
async def generate_recommendations(
    request: RecommendationRequest,
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    search_service: SearchService = Depends(get_search_service),
    compliance_engine: ComplianceEngine = Depends(get_compliance_engine),
    recommendation_engine: RecommendationEngine = Depends(get_recommendation_engine)
) -> RecommendationResponse:
    """Generates a prioritized list of corrective actions for specification compliance issues.

    Args:
        request: Recommendation request parameters model.
        embedding_service: Injected embedding model service.
        search_service: Injected similarity search service.
        compliance_engine: Injected compliance checks coordinator.
        recommendation_engine: Injected recommendation prioritization engine.

    Returns:
        RecommendationResponse: prioritized recommendations.
    """
    logger.info("Generating corrective recommendations for document: '{}'", request.document_id)

    try:
        # Retrieve all chunks for the document from Qdrant using the search-free Scroll API
        logger.debug("Retrieving indexed text chunks for document '{}' from Qdrant.", request.document_id)
        import time
        start_retrieval = time.time()
        chunks = search_service.get_document_chunks(request.document_id)
        retrieval_latency = time.time() - start_retrieval
        
        logger.info(
            "Recommendation retrieval metrics: document_id='{}', retrieved_chunks={}, latency={:.4f}s",
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

        # 1. Run compliance evaluations to detect issues list
        logger.debug("Running compliance evaluations to fetch issue lists.")
        comp_result = compliance_engine.evaluate(chunks)

        # 2. Translate compliance issues list to prioritized recommendations
        logger.debug("Generating recommendations from {} detected compliance issues.", len(comp_result.issues_detected))
        recommendations = recommendation_engine.generate_recommendations(comp_result.issues_detected)

        return RecommendationResponse(
            document_id=request.document_id,
            recommendations=recommendations
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Recommendation generation pipeline failed: {}", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Recommendation generation failed: {str(e)}"
        )
