from fastapi import APIRouter, Depends, HTTPException
from loguru import logger
from datetime import datetime
from typing import List, Optional
from ai.knowledge_engine.knowledge_base.knowledge_service import KnowledgeService
from ai.knowledge_engine.embeddings.embedding_service import EmbeddingService
from ai.knowledge_engine.retriever.search_service import SearchService
from ai.ai_agents.insights.insight_engine import InsightEngine
from ai.ai_agents.compliance.risk_engine import RiskEngine
from ai.ai_agents.intelligence_models import ProjectHealth
from ai.api.dependencies import get_knowledge_service, get_embedding_service, get_search_service, get_insight_engine, get_risk_engine
from ai.api.schemas.response_models import ProjectSummaryResponse, DocumentRegistryItem, RiskResponse

router = APIRouter(tags=["Project Dashboard"])


@router.get(
    "/project/dashboard",
    response_model=ProjectSummaryResponse,
    summary="Get overall project stats and document registry index details"
)
async def get_dashboard_summary(
    knowledge_service: KnowledgeService = Depends(get_knowledge_service),
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    search_service: SearchService = Depends(get_search_service),
    insight_engine: InsightEngine = Depends(get_insight_engine)
) -> ProjectSummaryResponse:
    """Collects dashboard summaries, document registries, and total index statistics.

    Args:
        knowledge_service: Injected document registry store facade.
        embedding_service: Injected embedding model service.
        search_service: Injected similarity search service.
        insight_engine: Injected reports and health calculations engine.

    Returns:
        ProjectSummaryResponse: Dashboard metrics summaries.
    """
    logger.info("Accessing project dashboard summary metrics.")

    try:
        # Retrieve all registered document identifiers
        doc_ids = knowledge_service.list_documents()
        registered_items = []
        total_chunks = 0

        # Retrieve profiles for each document
        for doc_id in doc_ids:
            profile = knowledge_service.get_document_profile(doc_id)
            if not profile:
                continue

            metadata_obj = profile.get("metadata")
            metadata_dict = {}
            file_name = "Unknown File"

            if metadata_obj:
                # Handle both dict and Pydantic object forms
                if hasattr(metadata_obj, "model_dump"):
                    metadata_dict = metadata_obj.model_dump()
                elif isinstance(metadata_obj, dict):
                    metadata_dict = metadata_obj
                else:
                    metadata_dict = dict(metadata_obj)
                
                file_name = metadata_dict.get("file_name", file_name)

            chunk_count = profile.get("total_chunks", 0)
            total_chunks += chunk_count

            registered_items.append(
                DocumentRegistryItem(
                    document_id=doc_id,
                    file_name=file_name,
                    status=profile.get("status", "completed"),
                    chunk_count=chunk_count,
                    registered_at=profile.get("registered_at") or datetime.utcnow().isoformat(),
                    metadata=metadata_dict
                )
            )

        # Compute aggregate project health based on the first document or default parameters
        agg_health = None
        if registered_items:
            try:
                first_doc_id = registered_items[0].document_id
                first_metadata = registered_items[0].metadata

                # Retrieve chunks for first document to build health indicators
                chunks = search_service.get_document_chunks(first_doc_id)
                if chunks:
                    logger.debug("Compiling project health metrics using: '{}'", first_doc_id)
                    report = insight_engine.generate_report(first_doc_id, first_metadata, chunks)
                    agg_health = report.project_health
            except Exception as health_err:
                logger.warning("Failed to evaluate aggregate health metrics: {}", str(health_err))

        return ProjectSummaryResponse(
            document_count=len(registered_items),
            registered_documents=registered_items,
            total_chunks=total_chunks,
            health_metrics=agg_health
        )

    except Exception as e:
        logger.error("Failed to construct dashboard summary: {}", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to gather project summary stats: {str(e)}"
        )


@router.get(
    "/project/{document_id}/risk",
    response_model=RiskResponse,
    summary="Assess safety and cost/schedule risk levels for a document"
)
async def get_document_risk(
    document_id: str,
    knowledge_service: KnowledgeService = Depends(get_knowledge_service),
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    search_service: SearchService = Depends(get_search_service),
    risk_engine: RiskEngine = Depends(get_risk_engine)
) -> RiskResponse:
    """Retrieves document data and runs the safety compliance risk pipeline.

    Args:
        document_id: Target document unique identifier.
        knowledge_service: Injected document registry store facade.
        embedding_service: Injected embedding model service.
        search_service: Injected similarity search service.
        risk_engine: Injected safety and schedule risk engine.

    Returns:
        RiskResponse: Structured risk levels, narrative reviews, and action items.
    """
    logger.info("Executing risk pipeline assessment for: '{}'", document_id)

    profile = knowledge_service.get_document_profile(document_id)
    if not profile:
        logger.warning("Failed to evaluate risk: document profile '{}' not found", document_id)
        raise HTTPException(
            status_code=404,
            detail=f"Document profile '{document_id}' not found in registry."
        )

    try:
        # Retrieve chunks associated with document ID to evaluate risk severity
        chunks = search_service.get_document_chunks(document_id)
        risk_data = risk_engine.analyze_risk(chunks)

        return RiskResponse(
            document_id=document_id,
            risk_level=risk_data["risk_level"],
            risk_summary=risk_data["risk_summary"],
            suggested_actions=risk_data["suggested_actions"]
        )

    except Exception as e:
        logger.error("Risk pipeline assessment failed: {}", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to execute risk analysis: {str(e)}"
        )
