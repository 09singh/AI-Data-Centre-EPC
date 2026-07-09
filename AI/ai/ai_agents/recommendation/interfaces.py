from abc import ABC, abstractmethod
from typing import List
from ai.ai_agents.intelligence_models import Recommendation, ComplianceIssue


class ActionGeneratorInterface(ABC):
    """Interface to generate structured corrective/preventative actions from issues."""

    @abstractmethod
    def generate_action(self, issue: ComplianceIssue) -> Recommendation:
        """Constructs an actionable Recommendation object corresponding to a detected issue.

        Args:
            issue: The source compliance discrepancy.

        Returns:
            Recommendation: Action item package.
        """
        pass


class PriorityEngineInterface(ABC):
    """Interface to evaluate and assign priorities to recommendations."""

    @abstractmethod
    def determine_priority(self, category: str, severity: str) -> str:
        """Returns the priority classification tier ('Critical', 'High', 'Medium', 'Low').

        Args:
            category: Action category name.
            severity: Source issue severity rating.

        Returns:
            str: Evaluated priority string.
        """
        pass


class RecommendationEngineInterface(ABC):
    """Interface to orchestrate and cap compiled action items."""

    @abstractmethod
    def generate_recommendations(
        self,
        issues: List[ComplianceIssue]
    ) -> List[Recommendation]:
        """Runs overall recommendation cycles over identified compliance issues.

        Args:
            issues: Detected engineering defects/omissions.

        Returns:
            List[Recommendation]: List of prioritised actions.
        """
        pass
