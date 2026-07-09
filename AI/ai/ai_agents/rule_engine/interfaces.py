from abc import ABC, abstractmethod
from typing import List, Optional
from ai.ai_agents.intelligence_models import RuleEvaluation
from ai.knowledge_engine.models import RetrievedChunk


class RuleEvaluatorInterface(ABC):
    """Interface to evaluate document chunks against configured project engineering rules."""

    @abstractmethod
    def evaluate_rules(
        self,
        chunks: List[RetrievedChunk],
        category: Optional[str] = None
    ) -> List[RuleEvaluation]:
        """Audits document chunks against loaded rule constraints.

        Args:
            chunks: Search reference document chunks.
            category: Optional rule category filter (e.g. 'Client', 'Project').

        Returns:
            List[RuleEvaluation]: Rule checkpoints list detailing pass/fail status.
        """
        pass
