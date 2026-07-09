from abc import ABC, abstractmethod
from typing import List
from ai.knowledge_engine.models import RetrievedChunk


class RerankerInterface(ABC):
    """Interface to reorder similarity results to maximize query relevancy."""

    @abstractmethod
    def rerank(self, query: str, chunks: List[RetrievedChunk]) -> List[RetrievedChunk]:
        """Reorders candidate chunks based on similarity algorithms or cross encoders.

        Args:
            query: Original user search query string.
            chunks: Initial list of retrieved document chunks.

        Returns:
            List[RetrievedChunk]: Re-indexed and re-sorted candidate chunk results.

        Raises:
            RerankerError: If reranking computations fail.
        """
        pass
