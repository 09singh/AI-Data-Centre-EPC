import time
from typing import List, Dict, Any, Optional
from loguru import logger

from ai.config.settings import settings
from ai.knowledge_engine.models import SearchResult, SearchMetadata, RetrievedChunk, Citation
from ai.knowledge_engine.retriever.interfaces import SearchServiceInterface, RetrieverInterface
from ai.knowledge_engine.retriever.exceptions import SearchError
from ai.knowledge_engine.retriever.retriever import QdrantRetriever
from ai.knowledge_engine.reranker.factory import RerankerFactory
from ai.knowledge_engine.reranker.interfaces import RerankerInterface
from ai.knowledge_engine.citation_engine.citation_builder import CitationBuilder
from ai.knowledge_engine.citation_engine.interfaces import CitationBuilderInterface


class SearchService(SearchServiceInterface):
    """Orchestrates similarity retrieval, reranking calculations, and citation mapping."""

    def __init__(
        self,
        retriever: Optional[RetrieverInterface] = None,
        reranker: Optional[RerankerInterface] = None,
        citation_builder: Optional[CitationBuilderInterface] = None
    ):
        """Initializes the SearchService facade with injected or default handlers.

        Args:
            retriever: similarity retriever interface.
            reranker: reranking interface.
            citation_builder: citation builder interface.
        """
        self.retriever = retriever or QdrantRetriever()
        self.reranker = reranker or RerankerFactory.get_reranker(settings.RERANKER_TYPE)
        self.citation_builder = citation_builder or CitationBuilder()

    def search(
        self,
        query_text: str,
        query_vector: List[float],
        top_k: Optional[int] = None,
        score_threshold: Optional[float] = None,
        filters: Optional[Dict[str, Any]] = None
    ) -> SearchResult:
        """Runs vector search query pipelines.

        Query Embedding -> Similarity retrieval -> Reranking -> Citations mapping.

        Args:
            query_text: Plain text search query.
            query_vector: Vector embedding of query text.
            top_k: Optional limit override.
            score_threshold: Optional similarity threshold override.
            filters: Optional dictionary criteria.

        Returns:
            SearchResult: Strongly typed search result container.

        Raises:
            SearchError: If search query processes crash.
        """
        logger.info("Initializing search query orchestration for: '{}'", query_text)

        # 1. Parameter Resolution
        k = top_k if top_k is not None else settings.DEFAULT_TOP_K
        threshold = score_threshold if score_threshold is not None else settings.DEFAULT_SCORE_THRESHOLD

        total_start = time.time()

        # 2. Similarity Retrieval Stage
        try:
            retrieve_start = time.time()
            logger.debug("Executing similarity retrieval query over the vector store...")
            raw_chunks = self.retriever.retrieve(
                query_vector=query_vector,
                top_k=k,
                score_threshold=threshold,
                filters=filters
            )
            retrieve_latency = time.time() - retrieve_start
            logger.info("Similarity retrieval stage completed in {:.4f}s.", retrieve_latency)
        except Exception as e:
            logger.error("Similarity retrieval failed during search orchestration: {}", str(e))
            raise SearchError(f"Search retrieval stage failed: {str(e)}") from e

        # 3. Reranker Re-ordering Stage
        try:
            rerank_start = time.time()
            logger.debug("Executing rerank candidate sorting...")
            reranked_chunks = self.reranker.rerank(query_text, raw_chunks)
            rerank_latency = time.time() - rerank_start
            logger.info("Reranking stage completed in {:.4f}s.", rerank_latency)
        except Exception as e:
            logger.error("Reranking process failed during search orchestration: {}", str(e))
            raise SearchError(f"Reranking stage failed: {str(e)}") from e

        # 4. Citation Generation Stage
        try:
            citation_start = time.time()
            logger.debug("Generating citation references mapping...")
            citations = [
                self.citation_builder.build_citation(chunk)
                for chunk in reranked_chunks
            ]
            citation_latency = time.time() - citation_start
            logger.info("Citation mapping generation completed in {:.4f}s.", citation_latency)
        except Exception as e:
            logger.error("Citation mapping failed during search orchestration: {}", str(e))
            raise SearchError(f"Citation generation stage failed: {str(e)}") from e

        # 5. Metadata Mapping & Final Outputs
        duration = time.time() - total_start

        search_metadata = SearchMetadata(
            query_latency_seconds=round(duration, 4),
            top_k=k,
            score_threshold=threshold,
            filters_applied=filters or {},
            reranker_applied=settings.RERANKER_TYPE
        )

        logger.info(
            "Search service query '{}' completed successfully in {:.4f}s. Mapped {} citations.",
            query_text,
            duration,
            len(citations)
        )

        return SearchResult(
            query_text=query_text,
            results=reranked_chunks,
            citations=citations,
            metadata=search_metadata
        )

    def get_document_chunks(self, document_id: str, limit: int = 1000) -> List[RetrievedChunk]:
        """Retrieves all chunks matching a document ID filter from Qdrant without vector search.

        Args:
            document_id: Target document ID.
            limit: Maximum count of retrieved blocks.

        Returns:
            List[RetrievedChunk]: Chunks associated with the document.
        """
        logger.info("Initializing search-free document chunks retrieval for ID: '{}'", document_id)
        return self.retriever.retrieve_by_document(document_id, limit)
