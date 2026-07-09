from typing import List
from loguru import logger

from ai.ai_agents.intelligence_models import ComplianceResult, QualityMetrics, Recommendation
from ai.ai_agents.insights.interfaces import SummaryBuilderInterface


class SummaryBuilder(SummaryBuilderInterface):
    """Compiles findings and compliance scoring cards into text-based executive summaries."""

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
        logger.debug("Building executive summary text from intelligence scorecards.")

        status_text = "compliant" if compliance.is_compliant else "non-compliant"
        critical_count = sum(1 for r in recommendations if r.priority == "Critical")

        summary_lines = [
            f"EPC Project Intelligence Report for: '{compliance.specification_name}'",
            "",
            f"1. Compliance Audit: The specification was evaluated as {status_text} with an overall compliance score of {compliance.compliance_score * 100:.1f}%. A total of {len(compliance.issues_detected)} compliance issues or deviations were identified.",
            "",
            f"2. Document Quality: Overall document completeness is rated at {quality.completeness_score * 100:.1f}%. Document quality has been marked as {'valid' if quality.is_quality_valid else 'invalid'} based on safety guidelines.",
            "",
            f"3. Priority Recommendations: A total of {len(recommendations)} actionable recommendations were generated, including {critical_count} critical priority action item(s)."
        ]

        if critical_count > 0:
            summary_lines.append("")
            summary_lines.append("CRITICAL ACTIONS REQUIRED:")
            for rec in recommendations:
                if rec.priority == "Critical":
                    summary_lines.append(f" - [{rec.category}] {rec.suggested_action} (Reason: {rec.reason})")

        return "\n".join(summary_lines)
