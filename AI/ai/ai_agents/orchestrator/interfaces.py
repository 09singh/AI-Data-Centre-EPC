from abc import ABC, abstractmethod
from ai.ai_agents.models import AIRequest, AIResponse


class AIOrchestratorInterface(ABC):
    """Abstract interface for the main AI Project Brain orchestrator pipeline."""

    @abstractmethod
    def process_query(self, request: AIRequest) -> AIResponse:
        """Processes incoming user query from start to finish.

        Orchestrates classification, memory loading, knowledge search, prompt building,
        LLM querying, memory updates, and compiles the final AIResponse payload.

        Args:
            request: Structured request parameter packet.

        Returns:
            AIResponse: Unified response packet.

        Raises:
            OrchestratorError: If any pipeline stages crash.
        """
        pass
