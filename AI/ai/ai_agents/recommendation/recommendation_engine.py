from typing import List, Optional
from loguru import logger

from ai.config.settings import settings
from ai.ai_agents.intelligence_models import Recommendation, ComplianceIssue
from ai.ai_agents.recommendation.interfaces import (
    RecommendationEngineInterface,
    ActionGeneratorInterface,
)
from ai.ai_agents.recommendation.action_generator import ActionGenerator


class RecommendationEngine(RecommendationEngineInterface):
    """Orchestrates actionable recommendation processing pipeline, capping counts by config."""

    def __init__(self, action_generator: Optional[ActionGeneratorInterface] = None):
        """Initializes the recommendation engine.

        Args:
            action_generator: Custom action item generator.
        """
        self.action_generator = action_generator or ActionGenerator()

    def generate_recommendations(
        self,
        issues: List[ComplianceIssue]
    ) -> List[Recommendation]:
        """Runs overall recommendation cycles over identified compliance issues.

        Args:
            issues: Detected engineering defects/omissions.

        Returns:
            List[Recommendation]: List of prioritized actions.
        """
        logger.info("Generating action recommendations for {} compliance issues.", len(issues))

        recommendations = []
        for issue in issues:
            rec = self.action_generator.generate_action(issue)
            recommendations.append(rec)

        # Sort recommendations by priority (Critical -> High -> Medium -> Low)
        priority_weights = {
            "Critical": 4,
            "High": 3,
            "Medium": 2,
            "Low": 1
        }
        recommendations.sort(key=lambda r: priority_weights.get(r.priority, 0), reverse=True)

        # Apply configuration limits
        limit = settings.RECOMMENDATION_LIMIT
        if len(recommendations) > limit:
            logger.info("Capping recommendations count from {} to configuration limit of {}.", len(recommendations), limit)
            recommendations = recommendations[:limit]

        return recommendations
