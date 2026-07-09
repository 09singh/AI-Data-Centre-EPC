from abc import ABC, abstractmethod
from typing import List
from ai.ai_agents.models import ConversationMessage
from ai.knowledge_engine.models import RetrievedChunk


class ContextFormatterInterface(ABC):
    """Interface to format retrieved vector chunks into prompt-ready context blocks."""

    @abstractmethod
    def format_chunks(self, chunks: List[RetrievedChunk]) -> str:
        """Formats lists of chunk objects into structured reference texts.

        Args:
            chunks: Matching retrieved blocks.

        Returns:
            str: Converted text reference blocks.
        """
        pass


class ContextBuilderInterface(ABC):
    """Interface to aggregate search results, queries, and history logs into unified text."""

    @abstractmethod
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
        pass
