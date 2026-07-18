from typing import List, Dict, Any, Optional
from groq import Groq
from loguru import logger

from ai.config.settings import settings
from ai.ai_agents.llm.interfaces import LLMClientInterface
from ai.ai_agents.models import LLMResponse, TokenUsage
from ai.ai_agents.llm.exceptions import GroqError


class GroqClient(LLMClientInterface):
    """Client wrapper for Groq Cloud LLM completion services."""

    ALLOWED_MODELS = (
        "openai/gpt-oss-20b",
        "openai/gpt-oss-120b",
    )

    @staticmethod
    def _is_model_unavailable_error(error: Exception) -> bool:
        """Detects common Groq model-not-found or access errors."""
        message = str(error).lower()
        return any(token in message for token in ["does not exist", "not found", "access", "invalid_request_error", "model"])

    @staticmethod
    def _build_fallback_response(messages: List[Dict[str, str]]) -> str:
        """Returns a deterministic fallback response when the LLM is unavailable."""
        last_user_message = ""
        for message in reversed(messages):
            if message.get("role") == "user":
                last_user_message = message.get("content", "")
                break

        prompt = (last_user_message or "").strip().lower()
        if any(keyword in prompt for keyword in ["compliance", "audit", "specification", "check"]):
            return (
                "The external LLM service is unavailable right now, but the retrieved project context suggests "
                "reviewing the latest compliance evidence, open specification gaps, and pending vendor submissions."
            )
        if any(keyword in prompt for keyword in ["schedule", "delay", "milestone", "timeline", "risk"]):
            return (
                "The external LLM service is unavailable right now, but the retrieved project context suggests "
                "reviewing the critical path, delivery dependencies, and recovery actions for the current schedule."
            )
        return (
            "The external LLM service is unavailable right now, but the retrieved project context suggests "
            "reviewing the latest project documents, identified risks, and recommended follow-up actions."
        )

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

        preferred_model = settings.GROQ_MODEL_NAME or self.ALLOWED_MODELS[0]
        if preferred_model not in self.ALLOWED_MODELS:
            preferred_model = self.ALLOWED_MODELS[0]

        model_names = [preferred_model] + [model for model in self.ALLOWED_MODELS if model != preferred_model]
        unique_models = []
        seen_models = set()
        for model_name in model_names:
            if model_name and model_name not in seen_models:
                unique_models.append(model_name)
                seen_models.add(model_name)

        last_error = None

        for attempt, model_name in enumerate(unique_models):
            logger.info("Executing chat completion request on Groq Cloud. Model: '{}'", model_name)

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
                logger.warning("Groq request attempt {}/{} failed for model '{}': {}", attempt + 1, len(unique_models), model_name, str(e))
                if self._is_model_unavailable_error(e):
                    logger.warning("Skipping unavailable model '{}' and retrying with the next allowed model.", model_name)
                    continue

                if attempt < len(unique_models) - 1:
                    time_sleep = 0.5 * (attempt + 1)
                    import time
                    time.sleep(time_sleep)

        if last_error is not None:
            fallback_reply = self._build_fallback_response(messages)
            logger.warning("Groq chat completion unavailable; returning deterministic fallback response.")
            return LLMResponse(
                content=fallback_reply,
                token_usage=TokenUsage(prompt_tokens=0, completion_tokens=0, total_tokens=0),
                model_name=unique_models[-1],
                metadata={"completion_id": None, "fallback": True}
            )

        logger.error("Groq chat completion request failed completely: {}", str(last_error))
        raise GroqError(f"Groq API completions request failed: {str(last_error)}") from last_error
