from fastapi import APIRouter, Depends, HTTPException, Query
from loguru import logger
from datetime import datetime
from typing import List
from ai.knowledge_engine.embeddings.embedding_service import EmbeddingService
from ai.knowledge_engine.retriever.search_service import SearchService
from ai.knowledge_engine.knowledge_base.knowledge_service import KnowledgeService
from ai.ai_agents.insights.insight_engine import InsightEngine
from ai.ai_agents.intelligence_models import ProjectHealth, ComplianceResult, QualityMetrics, Recommendation
from ai.api.dependencies import get_embedding_service, get_search_service, get_knowledge_service, get_insight_engine
from ai.api.schemas.response_models import ReportResponse

router = APIRouter(tags=["Reports generation"])


@router.post(
    "/reports/generate",
    response_model=ReportResponse,
    summary="Compile a unified Project Insight Report containing health, compliance, quality, and recommendations"
)
async def generate_unified_report(
    document_id: str = Query(..., description="The unique document ID to compile the report for"),
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    search_service: SearchService = Depends(get_search_service),
    knowledge_service: KnowledgeService = Depends(get_knowledge_service),
    insight_engine: InsightEngine = Depends(get_insight_engine)
) -> ReportResponse:
    """Compiles and generates a unified insight report for an indexed document.

    Combines compliance scorecards, quality validation metrics, prioritized
    corrective recommendations, and a natural language executive summary.

    Args:
        document_id: Target document ID query parameter.
        embedding_service: Injected embedding model service.
        search_service: Injected similarity search service.
        knowledge_service: Injected document metadata store database facade.
        insight_engine: Injected reports compiler insight engine.

    Returns:
        ReportResponse: Consolidated project report.
    """
    logger.info("Generating unified insight report for document: '{}'", document_id)

    try:
        # Retrieve document profile containing metadata
        profile = knowledge_service.get_document_profile(document_id)
        if not profile:
            logger.error("Document profile not found in registry: '{}'", document_id)
            raise HTTPException(
                status_code=404,
                detail=f"Document profile not found in registry for ID '{document_id}'."
            )

        metadata = profile.get("metadata") or {}

        # Retrieve document text chunks from Qdrant using the search-free Scroll API
        logger.debug("Retrieving indexed text chunks for document '{}' from Qdrant.", document_id)
        import time
        start_retrieval = time.time()
        chunks = search_service.get_document_chunks(document_id)
        retrieval_latency = time.time() - start_retrieval
        
        logger.info(
            "Report retrieval metrics: document_id='{}', retrieved_chunks={}, latency={:.4f}s",
            document_id,
            len(chunks),
            retrieval_latency
        )

        if not chunks:
            logger.error("No chunks indexed for document ID: '{}'", document_id)
            raise HTTPException(
                status_code=404,
                detail=f"No chunks found for document ID '{document_id}'. Ensure it was indexed properly."
            )

        # Generate report from insights engine
        logger.debug("Executing insight engine to build unified report.")
        report = insight_engine.generate_report(document_id, metadata, chunks)

        return ReportResponse(
            report_id=report.report_id,
            project_health=report.project_health,
            compliance_summaries=report.compliance_summaries,
            quality_summaries=report.quality_summaries,
            recommendations=report.recommendations,
            executive_summary=report.executive_summary,
            generated_at=report.generated_at
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Insight report generation pipeline failed: {}", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Insight report compilation failed: {str(e)}"
        )


@router.get(
    "/reports/{document_id}/health",
    response_model=ProjectHealth,
    summary="Get project health metrics section of the report"
)
async def get_report_health(
    document_id: str,
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    search_service: SearchService = Depends(get_search_service),
    knowledge_service: KnowledgeService = Depends(get_knowledge_service),
    insight_engine: InsightEngine = Depends(get_insight_engine)
) -> ProjectHealth:
    """Retrieves only the health rating section of the document report."""
    report = await generate_unified_report(
        document_id=document_id,
        embedding_service=embedding_service,
        search_service=search_service,
        knowledge_service=knowledge_service,
        insight_engine=insight_engine
    )
    return report.project_health


@router.get(
    "/reports/{document_id}/compliance",
    response_model=List[ComplianceResult],
    summary="Get compliance results scorecard section of the report"
)
async def get_report_compliance(
    document_id: str,
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    search_service: SearchService = Depends(get_search_service),
    knowledge_service: KnowledgeService = Depends(get_knowledge_service),
    insight_engine: InsightEngine = Depends(get_insight_engine)
) -> List[ComplianceResult]:
    """Retrieves only the specification compliance section of the document report."""
    report = await generate_unified_report(
        document_id=document_id,
        embedding_service=embedding_service,
        search_service=search_service,
        knowledge_service=knowledge_service,
        insight_engine=insight_engine
    )
    return report.compliance_summaries


@router.get(
    "/reports/{document_id}/recommendations",
    response_model=List[Recommendation],
    summary="Get corrective recommendations section of the report"
)
async def get_report_recommendations(
    document_id: str,
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    search_service: SearchService = Depends(get_search_service),
    knowledge_service: KnowledgeService = Depends(get_knowledge_service),
    insight_engine: InsightEngine = Depends(get_insight_engine)
) -> List[Recommendation]:
    """Retrieves only the prioritized recommendations section of the document report."""
    report = await generate_unified_report(
        document_id=document_id,
        embedding_service=embedding_service,
        search_service=search_service,
        knowledge_service=knowledge_service,
        insight_engine=insight_engine
    )
    return report.recommendations


@router.get(
    "/reports/{document_id}/summary",
    summary="Get executive summary text section of the report"
)
async def get_report_executive_summary(
    document_id: str,
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    search_service: SearchService = Depends(get_search_service),
    knowledge_service: KnowledgeService = Depends(get_knowledge_service),
    insight_engine: InsightEngine = Depends(get_insight_engine)
) -> dict:
    """Retrieves only the executive summary narrative text segment."""
    report = await generate_unified_report(
        document_id=document_id,
        embedding_service=embedding_service,
        search_service=search_service,
        knowledge_service=knowledge_service,
        insight_engine=insight_engine
    )
    return {"executive_summary": report.executive_summary}
