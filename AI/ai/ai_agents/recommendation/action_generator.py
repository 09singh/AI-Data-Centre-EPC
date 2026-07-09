from typing import Optional
from loguru import logger

from ai.ai_agents.intelligence_models import Recommendation, ComplianceIssue
from ai.ai_agents.recommendation.interfaces import ActionGeneratorInterface, PriorityEngineInterface
from ai.ai_agents.recommendation.priority_engine import PriorityEngine


class ActionGenerator(ActionGeneratorInterface):
    """Translates compliance issues and defects into structured actionable recommendations."""

    def __init__(self, priority_engine: Optional[PriorityEngineInterface] = None):
        """Initializes the action generator.

        Args:
            priority_engine: Optional custom priority engine.
        """
        self.priority_engine = priority_engine or PriorityEngine()

    def generate_action(self, issue: ComplianceIssue) -> Recommendation:
        """Constructs an actionable Recommendation object corresponding to a detected issue.

        Args:
            issue: The source compliance discrepancy.

        Returns:
            Recommendation: Action item package.
        """
        logger.debug("Generating recommendation action for issue: '{}'", issue.issue_id)

        # Categorize issue types
        category = "Engineering"
        name_lower = issue.requirement_name.lower()
        desc_lower = issue.description.lower()

        if any(w in name_lower or w in desc_lower for w in ["fire", "safety", "ventilation", "exhaust"]):
            category = "Safety"
        elif any(w in name_lower or w in desc_lower for w in ["procure", "equipment", "purchase", "supplier", "vendor"]):
            category = "Procurement"
        elif "missing" in issue.status or "quality" in name_lower:
            category = "Quality"

        priority = self.priority_engine.determine_priority(category, issue.severity)
        action_step = issue.suggested_fix or f"Review design guidelines to conform with '{issue.requirement_name}' criteria."

        return Recommendation(
            recommendation_id=f"REC_{issue.issue_id.split('_')[-1]}",
            category=category,
            priority=priority,
            severity=issue.severity,
            reason=issue.description,
            suggested_action=action_step,
            custom_metadata={"source_issue_id": issue.issue_id, "issue_status": issue.status}
        )
