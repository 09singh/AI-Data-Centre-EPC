from typing import List, Dict, Any, Optional
from loguru import logger
from ai.knowledge_engine.models import RetrievedChunk
from ai.ai_agents.compliance.compliance_engine import ComplianceEngine

class RiskEngine:
    """Integrated risk pipeline calculating project safety levels based on compliance check audits."""

    def __init__(self, compliance_engine: Optional[ComplianceEngine] = None):
        """Initializes the risk engine with a compliance evaluator.

        Args:
            compliance_engine: compliance checker engine.
        """
        self.compliance_engine = compliance_engine or ComplianceEngine()

    def analyze_risk(self, chunks: List[RetrievedChunk]) -> Dict[str, Any]:
        """Analyzes text chunks to compute risk ratings, summaries, and corrective action items.

        Args:
            chunks: Search retrieved document chunks.

        Returns:
            Dict[str, Any]: Calculated risk level, summary text, and actions list.
        """
        logger.info("Risk engine analyzing safety levels for {} document chunks.", len(chunks))

        # Evaluate compliance checklist issues
        comp_res = self.compliance_engine.evaluate(chunks)

        critical_issues = [issue for issue in comp_res.issues_detected if issue.severity == "Critical"]
        high_issues = [issue for issue in comp_res.issues_detected if issue.severity == "High"]

        # Calculate risk levels and compile summaries based on compliance scorecards
        if len(critical_issues) > 0:
            risk_level = "Critical"
            risk_summary = f"Detected {len(critical_issues)} Critical safety issues, indicating potential safety standard violations."
        elif len(high_issues) > 0 or comp_res.compliance_score < 0.6:
            risk_level = "High"
            risk_summary = f"Detected {len(high_issues)} High compliance issues or compliance score is low ({comp_res.compliance_score * 100}%)."
        elif len(comp_res.issues_detected) > 0:
            risk_level = "Medium"
            risk_summary = f"Detected minor specifications gaps ({len(comp_res.issues_detected)} issues found)."
        else:
            risk_level = "Low"
            risk_summary = "All requirements checked passed successfully. No safety standard deviations detected."

        # Compile suggested actions
        suggested_actions = []
        for issue in comp_res.issues_detected:
            if hasattr(issue, "suggested_fix") and issue.suggested_fix:
                suggested_actions.append(issue.suggested_fix)
            else:
                suggested_actions.append(f"Remediate requirement issue: {issue.description}")

        if not suggested_actions:
            suggested_actions = ["Continue regular routine mechanical maintenance inspections."]

        logger.info("Risk analysis completed. Calculated Risk Level: {}", risk_level)

        return {
            "risk_level": risk_level,
            "risk_summary": risk_summary,
            "suggested_actions": list(set(suggested_actions))[:5]
        }
