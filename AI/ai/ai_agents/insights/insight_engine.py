from datetime import datetime
from typing import List, Dict, Any, Optional
from loguru import logger

from ai.ai_agents.intelligence_models import (
    InsightReport,
    ProjectHealth,
    ComplianceResult,
    QualityMetrics,
    Recommendation,
)
from ai.ai_agents.insights.interfaces import InsightEngineInterface, SummaryBuilderInterface
from ai.ai_agents.insights.summary_builder import SummaryBuilder
from ai.ai_agents.compliance.compliance_engine import ComplianceEngine
from ai.ai_agents.compliance.quality_validator import QualityValidator
from ai.ai_agents.recommendation.recommendation_engine import RecommendationEngine
from ai.knowledge_engine.models import RetrievedChunk


class InsightEngine(InsightEngineInterface):
    """Orchestrator compiling overall project health logs, compliance, and recommendations."""

    def __init__(
        self,
        compliance_engine: Optional[ComplianceEngine] = None,
        quality_validator: Optional[QualityValidator] = None,
        recommendation_engine: Optional[RecommendationEngine] = None,
        summary_builder: Optional[SummaryBuilderInterface] = None
    ):
        """Initializes the insight engine.

        Args:
            compliance_engine: Compliance checker manager.
            quality_validator: Completeness checker manager.
            recommendation_engine: Action priority items coordinator.
            summary_builder: Narrative text template compiler.
        """
        self.compliance_engine = compliance_engine or ComplianceEngine()
        self.quality_validator = quality_validator or QualityValidator()
        self.recommendation_engine = recommendation_engine or RecommendationEngine()
        self.summary_builder = summary_builder or SummaryBuilder()

    def generate_report(
        self,
        document_id: str,
        metadata: Dict[str, Any],
        chunks: List[RetrievedChunk]
    ) -> InsightReport:
        """Executes full reporting loops, compiling compliance, quality, and recommendations.

        Args:
            document_id: Unique document code index.
            metadata: Document properties registry.
            chunks: Search reference document chunks.

        Returns:
            InsightReport: Aggregate project health and checklist report.
        """
        logger.info("Generating overall Project Insight Report for document ID: '{}'", document_id)

        # 1. Execute Compliance Auditing
        compliance_res = self.compliance_engine.evaluate(chunks)

        # 2. Execute Document Completeness Validation
        quality_res = self.quality_validator.validate_quality(document_id, metadata, chunks)

        # 3. Generate Actions and Recommendations
        recommendations = self.recommendation_engine.generate_recommendations(compliance_res.issues_detected)

        # 4. Calculate Aggregate Project Health Scores
        # Overall health = average of compliance score and quality score, adjusted by critical issue deductions
        critical_issues = sum(1 for r in recommendations if r.priority == "Critical")
        comp_health = compliance_res.compliance_score
        qual_health = quality_res.completeness_score

        raw_health = (comp_health + qual_health) / 2.0
        # Deduct 0.1 for every critical issue detected, capped at minimum 0.0
        deduction = critical_issues * 0.1
        overall_health = max(0.0, raw_health - deduction)

        project_health = ProjectHealth(
            overall_health_score=round(overall_health, 4),
            compliance_health_score=round(comp_health, 4),
            quality_health_score=round(qual_health, 4),
            total_active_critical_issues=critical_issues
        )

        # 5. Build executive summary narrative text
        executive_summary = self.summary_builder.build_summary(
            compliance=compliance_res,
            quality=quality_res,
            recommendations=recommendations
        )

        logger.info("Project Insight Report compiled successfully. Overall Health Score: {:.4f}", overall_health)

        return InsightReport(
            report_id=f"RPT_{document_id}_{int(datetime.utcnow().timestamp())}",
            project_health=project_health,
            compliance_summaries=[compliance_res],
            quality_summaries=[quality_res],
            recommendations=recommendations,
            executive_summary=executive_summary,
            generated_at=datetime.utcnow().isoformat() + "Z"
        )
