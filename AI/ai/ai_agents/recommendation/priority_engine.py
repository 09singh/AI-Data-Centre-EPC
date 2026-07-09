from loguru import logger
from ai.ai_agents.recommendation.interfaces import PriorityEngineInterface


class PriorityEngine(PriorityEngineInterface):
    """Classifies recommendations into priority tiers based on category and severity indicators."""

    def determine_priority(self, category: str, severity: str) -> str:
        """Returns the priority classification tier ('Critical', 'High', 'Medium', 'Low').

        Args:
            category: Recommendation category ('Engineering', 'Procurement', etc.).
            severity: Source issue severity ('Critical', 'High', 'Medium', 'Low').

        Returns:
            str: Evaluated priority level.
        """
        logger.debug("Determining priority for category: '{}' | Severity: '{}'", category, severity)
        sev = severity.strip().lower()
        cat = category.strip().lower()

        # Rule evaluation flow
        if sev == "critical":
            return "Critical"
        if sev == "high":
            # Safety related issues escalate to Critical
            if "safety" in cat or "compliance" in cat:
                return "Critical"
            return "High"
        if sev == "medium":
            return "Medium"
        return "Low"
