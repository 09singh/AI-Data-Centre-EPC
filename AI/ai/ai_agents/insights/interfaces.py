from abc import ABC, abstractmethod
from typing import List, Dict, Any
from ai.ai_agents.intelligence_models import (
    InsightReport,
    ComplianceResult,
    QualityMetrics,
    Recommendation,
)
from ai.knowledge_engine.models import RetrievedChunk


class SummaryBuilderInterface(ABC):
    """Interface to compile text executive summaries detailing compliance audits and quality status."""

    @abstractmethod
    def build_summary(
        self,
        compliance: ComplianceResult,
        quality: QualityMetrics,
        recommendations: List[Recommendation]
    ) -> str:
        """Assembles natural language text representing findings, safety issues, and actions.

        Args:
            compliance: Document compliance audit result.
            quality: Document quality validation scorecard.
            recommendations: Generated prioritised action items.

        Returns:
            str: Natural text overview summarizing project findings.
        """
        pass


class InsightEngineInterface(ABC):
    """Interface to orchestrate and compile overall project health Insight Reports."""

    @abstractmethod
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
        pass
