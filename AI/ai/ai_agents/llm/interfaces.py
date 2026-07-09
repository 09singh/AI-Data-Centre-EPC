from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from ai.ai_agents.models import LLMResponse


class LLMClientInterface(ABC):
    """Abstract interface defining the contract for LLM Clients."""

    @abstractmethod
    def generate(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        top_p: Optional[float] = None
    ) -> LLMResponse:
        """Sends chat messages to the LLM and returns the completion response.

        Args:
            messages: List of message dictionaries containing 'role' and 'content'.
            temperature: Sampling temperature parameters override.
            max_tokens: Completion token count limit override.
            top_p: Nucleus sampling parameters override.

        Returns:
            LLMResponse: Unified response wrapper containing contents and token usages.

        Raises:
            LLMError: If model query fails or encounters connection timeouts.
        """
        pass
