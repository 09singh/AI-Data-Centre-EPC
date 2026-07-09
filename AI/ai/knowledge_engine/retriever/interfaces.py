from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from ai.knowledge_engine.models import SearchResult, RetrievedChunk


class RetrieverInterface(ABC):
    """Interface defining similarity search operations over the Vector Store."""

    @abstractmethod
    def retrieve(
        self,
        query_vector: List[float],
        top_k: int,
        score_threshold: float,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[RetrievedChunk]:
        """Queries the vector database for nearest vector neighbors with thresholds and filters.

        Args:
            query_vector: Embedding coordinates representing the query text.
            top_k: Maximum count of retrieved blocks.
            score_threshold: Minimum cosine similarity required.
            filters: Dynamic metadata filters dictionary.

        Returns:
            List[RetrievedChunk]: Ranked retrieved chunks mapping database vectors.

        Raises:
            RetrieverError: If vector query execution fails.
        """
        pass

    @abstractmethod
    def retrieve_by_document(self, document_id: str, limit: int = 1000) -> List[RetrievedChunk]:
        """Queries the vector database to retrieve all chunks matching a document ID filter using Scroll.

        Args:
            document_id: Target document ID.
            limit: Maximum count of retrieved blocks.

        Returns:
            List[RetrievedChunk]: Chunks associated with the document.
        """
        pass


class SearchServiceInterface(ABC):
    """Interface orchestrating vector queries, reranking, and citation generation."""

    @abstractmethod
    def search(
        self,
        query_text: str,
        query_vector: List[float],
        top_k: Optional[int] = None,
        score_threshold: Optional[float] = None,
        filters: Optional[Dict[str, Any]] = None
    ) -> SearchResult:
        """Executes similarity searches, reranks candidate hits, and maps citations.

        Args:
            query_text: The user text search string.
            query_vector: Output embedding coordinates matching the query string.
            top_k: Optional search limit override.
            score_threshold: Optional filter threshold override.
            filters: Optional metadata filters.

        Returns:
            SearchResult: Combined query container containing hits, citations, and metrics.

        Raises:
            SearchError: If search process orchestrations crash.
        """
        pass

    @abstractmethod
    def get_document_chunks(self, document_id: str, limit: int = 1000) -> List[RetrievedChunk]:
        """Retrieves all chunks matching a document ID filter from Qdrant without vector search.

        Args:
            document_id: Target document ID.
            limit: Maximum count of retrieved blocks.

        Returns:
            List[RetrievedChunk]: Chunks associated with the document.
        """
        pass
