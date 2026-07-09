from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from loguru import logger

from ai.config.settings import settings
from ai.knowledge_engine.models import RetrievedChunk
from ai.knowledge_engine.retriever.interfaces import RetrieverInterface
from ai.knowledge_engine.retriever.exceptions import RetrieverError
from ai.knowledge_engine.vector_store.qdrant_client import QdrantConnectionManager


class QdrantRetriever(RetrieverInterface):
    """Retrieves document chunks matching vector similarity parameters from Qdrant."""

    def __init__(self, connection_manager: Optional[QdrantConnectionManager] = None):
        """Initializes the retriever.

        Args:
            connection_manager: Optional custom connection manager.
        """
        self.connection_manager = connection_manager or QdrantConnectionManager()

    def _get_client(self) -> QdrantClient:
        """Retrieves the active client connection."""
        return self.connection_manager.connect()

    def retrieve(
        self,
        query_vector: List[float],
        top_k: int,
        score_threshold: float,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[RetrievedChunk]:
        """Queries the vector database for nearest vector neighbors.

        Args:
            query_vector: High-dimensional float vector coordinates.
            top_k: Match count limit constraint.
            score_threshold: Minimum cosine similarity.
            filters: Dict containing metadata attributes.

        Returns:
            List[RetrievedChunk]: Ordered matching chunks.

        Raises:
            RetrieverError: If database search query crashes.
        """
        logger.info("Executing Qdrant similarity search query (Top K: {}, Threshold: {})", top_k, score_threshold)
        collection_name = settings.COLLECTION_NAME

        # 1. Build Qdrant Search Filters Dynamically
        query_filter = None
        if filters:
            logger.debug("Building Qdrant query filter conditions: {}", filters)
            must_conditions = []
            for key, val in filters.items():
                if isinstance(val, list):
                    must_conditions.append(
                        qmodels.FieldCondition(key=key, match=qmodels.MatchAny(any=val))
                    )
                else:
                    must_conditions.append(
                        qmodels.FieldCondition(key=key, match=qmodels.MatchValue(value=val))
                    )
            if must_conditions:
                query_filter = qmodels.Filter(must=must_conditions)

        # 2. Execute DB Query
        try:
            client = self._get_client()
            search_results = client.query_points(
                collection_name=collection_name,
                query=query_vector,
                limit=top_k,
                score_threshold=score_threshold,
                query_filter=query_filter
            )

            # 3. Format ScoredPoints into RetrievedChunk model records
            retrieved_chunks = []
            for hit in search_results.points:
                payload = hit.payload or {}
                # Instrumentation Logging
                logger.info("[INSTRUMENTATION] payload: {}", payload)
                logger.info("[INSTRUMENTATION] payload.keys(): {}", list(payload.keys()))
                logger.info("[INSTRUMENTATION] payload.get('text'): {}", repr(payload.get("text")))
                
                chunk = RetrievedChunk(
                    chunk_id=payload.get("chunk_id") or str(hit.id),
                    text=payload.get("text") or "",
                    score=hit.score,
                    page_numbers=payload.get("page_numbers") or [1],
                    section_heading=payload.get("section_heading"),
                    document_id=payload.get("document_id"),
                    file_name=payload.get("file_name"),
                    custom_metadata={
                        k: v for k, v in payload.items()
                        if k not in ["chunk_id", "text", "page_numbers", "section_heading", "document_id", "file_name"]
                    }
                )
                retrieved_chunks.append(chunk)

            logger.info("Retrieved {} matching vector chunks from vector store.", len(retrieved_chunks))
            return retrieved_chunks

        except Exception as e:
            logger.error("Qdrant similarity search failed in collection '{}': {}", collection_name, str(e))
            raise RetrieverError(f"Similarity search query failed: {str(e)}") from e

    def retrieve_by_document(self, document_id: str, limit: int = 1000) -> List[RetrievedChunk]:
        """Queries the vector database to retrieve all chunks matching a document ID filter using Scroll.

        Args:
            document_id: Target document ID.
            limit: Maximum count of retrieved blocks.

        Returns:
            List[RetrievedChunk]: Chunks associated with the document.
        """
        logger.info("Executing Qdrant scroll query for document: '{}' (Limit: {})", document_id, limit)
        collection_name = settings.COLLECTION_NAME

        query_filter = qmodels.Filter(
            must=[
                qmodels.FieldCondition(
                    key="document_id",
                    match=qmodels.MatchValue(value=document_id)
                )
            ]
        )

        try:
            client = self._get_client()
            scroll_results = client.scroll(
                collection_name=collection_name,
                scroll_filter=query_filter,
                limit=limit,
                with_payload=True,
                with_vectors=False
            )

            points, _ = scroll_results
            retrieved_chunks = []
            for record in points:
                payload = record.payload or {}
                chunk = RetrievedChunk(
                    chunk_id=payload.get("chunk_id") or str(record.id),
                    text=payload.get("text") or "",
                    score=1.0,
                    page_numbers=payload.get("page_numbers") or [1],
                    section_heading=payload.get("section_heading"),
                    document_id=payload.get("document_id"),
                    file_name=payload.get("file_name"),
                    custom_metadata={
                        k: v for k, v in payload.items()
                        if k not in ["chunk_id", "text", "page_numbers", "section_heading", "document_id", "file_name"]
                    }
                )
                retrieved_chunks.append(chunk)

            logger.info("Scrolled {} chunks matching document ID '{}'.", len(retrieved_chunks), document_id)
            return retrieved_chunks

        except Exception as e:
            logger.error("Qdrant scroll retrieval failed in collection '{}': {}", collection_name, str(e))
            raise RetrieverError(f"Scroll retrieval query failed: {str(e)}") from e
