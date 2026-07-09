from loguru import logger
from ai.ai_agents.llm.interfaces import LLMClientInterface
from ai.ai_agents.llm.groq_client import GroqClient


class LLMFactory:
    """Factory pattern to resolve and load LLM Clients.

    Decoupled interface allows future transitions to OpenAI, Claude,
    Gemini, or Ollama without modifying orchestrators.
    """

    @staticmethod
    def get_client(provider_name: str) -> LLMClientInterface:
        """Instantiates and returns the designated provider client.

        Args:
            provider_name: Selected provider ('groq', 'openai', 'claude', 'gemini', 'ollama').

        Returns:
            LLMClientInterface: Concrete LLM client.
        """
        logger.debug("Factory resolving LLM client for: '{}'", provider_name)
        normalized = provider_name.lower().strip()

        if normalized == "groq":
            return GroqClient()
        elif normalized == "openai":
            logger.info("Selected OpenAI client. Routing to Groq client wrapper placeholder.")
            return GroqClient()
        elif normalized in ["claude", "anthropic"]:
            logger.info("Selected Claude client. Routing to Groq client wrapper placeholder.")
            return GroqClient()
        elif normalized in ["gemini", "google"]:
            logger.info("Selected Gemini client. Routing to Groq client wrapper placeholder.")
            return GroqClient()
        elif normalized == "ollama":
            logger.info("Selected Ollama client. Routing to Groq client wrapper placeholder.")
            return GroqClient()
        else:
            logger.warning("Unrecognized LLM provider: '{}'. Defaulting to GroqClient.", provider_name)
            return GroqClient()
