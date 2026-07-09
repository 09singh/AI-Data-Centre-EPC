from typing import List, Dict, Any, Optional
from groq import Groq
from loguru import logger

from ai.config.settings import settings
from ai.ai_agents.llm.interfaces import LLMClientInterface
from ai.ai_agents.models import LLMResponse, TokenUsage
from ai.ai_agents.llm.exceptions import GroqError


class GroqClient(LLMClientInterface):
    """Client wrapper for Groq Cloud LLM completion services."""

    def __init__(self, api_key: Optional[str] = None):
        """Initializes the Groq client.

        Args:
            api_key: Optional override for Groq API key. If None, loaded from global settings.

        Raises:
            GroqError: If client instantiation crashes.
        """
        key = api_key or settings.GROQ_API_KEY
        if not key or key == "mock_groq_api_key_for_testing" or "mock" in key:
            logger.warning("Using placeholder Groq API key configuration.")

        try:
            self.client = Groq(api_key=key, timeout=settings.SEARCH_TIMEOUT_SECONDS)
        except Exception as e:
            logger.error("Failed to initialize Groq client: {}", str(e))
            raise GroqError(f"Failed to instantiate Groq client: {str(e)}") from e

    def generate(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        top_p: Optional[float] = None
    ) -> LLMResponse:
        """Sends chat messages to the LLM and returns the completion response.

        Args:
            messages: List of message dictionaries.
            temperature: Sampling temperature override.
            max_tokens: Completion token count limit override.
            top_p: Nucleus sampling parameters override.

        Returns:
            LLMResponse: Unified response wrapper.

        Raises:
            GroqError: If API call fails.
        """
        # Resolve config defaults if parameters are not explicitly set
        temp = temperature if temperature is not None else settings.TEMPERATURE
        max_t = max_tokens if max_tokens is not None else settings.MAX_TOKENS
        p = top_p if top_p is not None else settings.TOP_P
        model_name = settings.GROQ_MODEL_NAME

        logger.info("Executing chat completion request on Groq Cloud. Model: '{}'", model_name)

        # Retry loop to support connection drops
        max_retries = 3
        last_error = None

        for attempt in range(max_retries):
            try:
                chat_completion = self.client.chat.completions.create(
                    messages=messages,
                    model=model_name,
                    temperature=temp,
                    max_tokens=max_t,
                    top_p=p
                )

                content = chat_completion.choices[0].message.content or ""
                usage = chat_completion.usage

                token_usage = TokenUsage(
                    prompt_tokens=usage.prompt_tokens if usage else 0,
                    completion_tokens=usage.completion_tokens if usage else 0,
                    total_tokens=usage.total_tokens if usage else 0
                )

                logger.info(
                    "Groq query completed. Token usage - Prompt: {}, Completion: {}, Total: {}",
                    token_usage.prompt_tokens,
                    token_usage.completion_tokens,
                    token_usage.total_tokens
                )

                return LLMResponse(
                    content=content,
                    token_usage=token_usage,
                    model_name=model_name,
                    metadata={"completion_id": chat_completion.id}
                )

            except Exception as e:
                last_error = e
                logger.warning("Groq request attempt {}/{} failed: {}", attempt + 1, max_retries, str(e))
                if attempt < max_retries - 1:
                    time_sleep = 0.5 * (attempt + 1)
                    import time
                    time.sleep(time_sleep)

        logger.error("Groq chat completion request failed completely: {}", str(last_error))
        raise GroqError(f"Groq API completions request failed: {str(last_error)}") from last_error
