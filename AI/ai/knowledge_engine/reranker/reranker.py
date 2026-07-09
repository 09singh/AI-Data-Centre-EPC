from typing import List
from loguru import logger

from ai.knowledge_engine.models import RetrievedChunk
from ai.knowledge_engine.reranker.interfaces import RerankerInterface


class IdentityReranker(RerankerInterface):
    """Default pass-through reranker returning candidate elements in their original order."""

    def rerank(self, query: str, chunks: List[RetrievedChunk]) -> List[RetrievedChunk]:
        """Returns the list of chunks without modifying their relative order.

        Args:
            query: The user search query.
            chunks: Matching retrieved chunks.

        Returns:
            List[RetrievedChunk]: The unmodified list of chunks.
        """
        logger.info("Executing Identity Reranker (no-op reordering). Chunks count: {}", len(chunks))
        return chunks
