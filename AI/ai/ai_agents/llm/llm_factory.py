from loguru import logger
from ai.ai_agents.llm.interfaces import LLMClientInterface
from ai.ai_agents.llm.groq_client import GroqClient


class LLMFactory:
    """Factory pattern to resolve the active Groq LLM client."""

    @staticmethod
    def get_client(provider_name: str) -> LLMClientInterface:
        """Instantiates and returns the designated provider client.

        Args:
            provider_name: Selected provider. Only 'groq' is active.

        Returns:
            LLMClientInterface: Concrete LLM client.
        """
        logger.debug("Factory resolving LLM client for: '{}'", provider_name)
        normalized = provider_name.lower().strip()

        if normalized == "groq":
            return GroqClient()

        logger.warning("Unsupported LLM provider: '{}'. Using GroqClient with approved OSS models.", provider_name)
        return GroqClient()
