import time
import uuid
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from loguru import logger

from ai.knowledge_engine.vector_store.interfaces import VectorServiceInterface
from ai.knowledge_engine.vector_store.exceptions import VectorInsertError, VectorDeleteError
from ai.knowledge_engine.vector_store.qdrant_client import QdrantConnectionManager
from ai.knowledge_engine.embeddings.embedding_service import VectorEmbedding


def get_valid_uuid(id_str: str) -> str:
    """Deterministically formats any string identifier into a standard UUID format string.

    Ensures full compatibility with Qdrant ID validations.

    Args:
        id_str: Plain string identifier.

    Returns:
        str: Standard formatted UUID string.
    """
    try:
        # Check if it is already formatted as a standard UUID
        return str(uuid.UUID(id_str))
    except ValueError:
        # Generate a deterministic UUID v5 namespace ID based on input value
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, id_str))


class QdrantVectorService(VectorServiceInterface):
    """Vector service implementing VectorServiceInterface operations for Qdrant database."""

    def __init__(self, connection_manager: Optional[QdrantConnectionManager] = None):
        """Initializes the service.

        Args:
            connection_manager: Optional custom connection manager.
        """
        self.connection_manager = connection_manager or QdrantConnectionManager()

    def _get_client(self) -> QdrantClient:
        """Retrieves the database connection singleton wrapper."""
        return self.connection_manager.connect()

    def insert_vectors(self, collection_name: str, embeddings: List[VectorEmbedding]) -> bool:
        """Upserts vectors and metadata payloads into the collection.

        Args:
            collection_name: Name of target collection.
            embeddings: List of VectorEmbedding objects.

        Returns:
            bool: True if completed.

        Raises:
            VectorInsertError: If database insert operations fail.
        """
        if not embeddings:
            return True

        start_time = time.time()
        logger.info("Upserting {} vectors into Qdrant collection '{}'", len(embeddings), collection_name)

        points = []
        for emb in embeddings:
            q_id = get_valid_uuid(emb.chunk_id)
            points.append(qmodels.PointStruct(
                id=q_id,
                vector=emb.embedding,
                payload=emb.metadata_reference
            ))

        try:
            client = self._get_client()
            
            # Determine expected vector dimension size dynamically from input embeddings (e.g. support custom dimensions during tests)
            expected_size = len(embeddings[0].embedding) if (embeddings and len(embeddings) > 0) else 384

            # Ensure collection exists and is configured for unnamed vectors
            try:
                col_info = client.get_collection(collection_name=collection_name)
                vectors_config = col_info.config.params.vectors
                
                is_named = isinstance(vectors_config, dict)
                size_mismatch = False
                
                if is_named:
                    found_info = "named vector: " + ", ".join(vectors_config.keys())
                else:
                    size = getattr(vectors_config, "size", None)
                    distance = getattr(vectors_config, "distance", None)
                    found_info = f"unnamed vector, size: {size}, distance: {distance}"
                    if size != expected_size:
                        size_mismatch = True
                        
                if is_named or size_mismatch:
                    err_msg = (
                        f"Qdrant collection schema mismatch.\n\n"
                        f"Expected:\n"
                        f"- unnamed vector\n"
                        f"- size: {expected_size}\n"
                        f"- distance: Cosine\n\n"
                        f"Found:\n"
                        f"- {found_info}\n\n"
                        f"Please recreate the collection with the correct schema."
                    )
                    logger.error(err_msg)
                    raise ValueError(err_msg)
            except ValueError as val_err:
                raise val_err
            except Exception:
                logger.info("Qdrant collection '{}' does not exist. Creating it...", collection_name)
                client.create_collection(
                    collection_name=collection_name,
                    vectors_config=qmodels.VectorParams(
                        size=expected_size,
                        distance=qmodels.Distance.COSINE
                    )
                )
            
            # Instrumentation Logging
            for emb in embeddings:
                logger.info("[INSTRUMENTATION] emb.metadata_reference: {}", emb.metadata_reference)
                logger.info("[INSTRUMENTATION] emb.metadata_reference.keys(): {}", list(emb.metadata_reference.keys()))
                logger.info("[INSTRUMENTATION] emb.metadata_reference.get('text'): {}", repr(emb.metadata_reference.get("text")))

            client.upsert(
                collection_name=collection_name,
                points=points
            )
            duration = time.time() - start_time
            logger.info("Successfully inserted {} vectors. Latency: {:.4f}s", len(embeddings), duration)
            return True
        except Exception as e:
            logger.error("Failed to insert vectors into '{}': {}", collection_name, str(e))
            raise VectorInsertError(f"Failed to upsert vectors in collection '{collection_name}': {str(e)}") from e

    def delete_vectors(self, collection_name: str, vector_ids: List[str]) -> bool:
        """Deletes vectors from Qdrant by ID.

        Args:
            collection_name: Target collection name.
            vector_ids: List of chunk IDs.

        Returns:
            bool: True if deleted.

        Raises:
            VectorDeleteError: If delete operations fail.
        """
        if not vector_ids:
            return True

        start_time = time.time()
        logger.info("Deleting {} vectors from collection '{}'", len(vector_ids), collection_name)

        uuids = [get_valid_uuid(v_id) for v_id in vector_ids]

        try:
            client = self._get_client()
            client.delete(
                collection_name=collection_name,
                points_selector=qmodels.PointIdsList(points=uuids)
            )
            duration = time.time() - start_time
            logger.info("Successfully deleted {} vectors. Latency: {:.4f}s", len(vector_ids), duration)
            return True
        except Exception as e:
            logger.error("Failed to delete vectors from '{}': {}", collection_name, str(e))
            raise VectorDeleteError(f"Failed to delete vectors in collection '{collection_name}': {str(e)}") from e

    def fetch_vector_by_id(self, collection_name: str, vector_id: str) -> Optional[Dict[str, Any]]:
        """Fetches specific vector including payload metadata by ID.

        Args:
            collection_name: Target collection name.
            vector_id: Chunk ID.

        Returns:
            Optional[Dict[str, Any]]: Vector record dictionary.
        """
        logger.info("Retrieving vector records for '{}' from '{}'", vector_id, collection_name)
        q_id = get_valid_uuid(vector_id)

        try:
            client = self._get_client()
            res = client.retrieve(
                collection_name=collection_name,
                ids=[q_id],
                with_vectors=True,
                with_payload=True
            )
            if not res:
                logger.debug("Vector '{}' not found in '{}'", vector_id, collection_name)
                return None
            record = res[0]
            return {
                "id": vector_id,
                "vector": record.vector,
                "payload": record.payload
            }
        except Exception as e:
            logger.warning("Failed to fetch vector '{}' from '{}': {}", vector_id, collection_name, str(e))
            return None
