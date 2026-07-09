from typing import List, Optional
from loguru import logger

from ai.ai_agents.models import ConversationMessage
from ai.knowledge_engine.models import RetrievedChunk
from ai.ai_agents.context_builder.interfaces import ContextBuilderInterface, ContextFormatterInterface
from ai.ai_agents.context_builder.context_formatter import ContextFormatter


class ContextBuilder(ContextBuilderInterface):
    """Aggregates formatted vector context references, applying size limits."""

    def __init__(
        self,
        formatter: Optional[ContextFormatterInterface] = None,
        max_context_chars: int = 40000
    ):
        """Initializes the context builder.

        Args:
            formatter: Formatter strategy for converting chunks.
            max_context_chars: Maximum character limit constraint to prevent token overflow.
        """
        self.formatter = formatter or ContextFormatter()
        self.max_context_chars = max_context_chars

    def build_context(
        self,
        chunks: List[RetrievedChunk],
        query: str,
        history: List[ConversationMessage]
    ) -> str:
        """Aggregates contexts, queries, and histories, resolving maximum token limits.

        Args:
            chunks: Matching retrieved blocks.
            query: Current user search string.
            history: Recent conversation history logs.

        Returns:
            str: Final prompt context block.
        """
        logger.debug("Building aggregated context for user query: '{}'", query)

        # 1. Format raw vector chunks
        formatted_context = self.formatter.format_chunks(chunks)

        # 2. Text Compression / Truncation check
        if len(formatted_context) > self.max_context_chars:
            logger.warning(
                "Aggregated context size ({}) exceeds limit ({}). Compressing/Trimming.",
                len(formatted_context),
                self.max_context_chars
            )
            formatted_context = (
                formatted_context[:self.max_context_chars]
                + "\n\n... [Context truncated for length limitations] ..."
            )

        return formatted_context
