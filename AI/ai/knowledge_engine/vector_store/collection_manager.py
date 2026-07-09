from typing import List, Optional
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from loguru import logger

from ai.knowledge_engine.vector_store.interfaces import CollectionManagerInterface
from ai.knowledge_engine.vector_store.exceptions import CollectionError
from ai.knowledge_engine.vector_store.qdrant_client import QdrantConnectionManager


class QdrantCollectionManager(CollectionManagerInterface):
    """Manages collections within the Qdrant database."""

    def __init__(self, connection_manager: Optional[QdrantConnectionManager] = None):
        """Initializes collection manager.

        Args:
            connection_manager: Optional custom connection manager.
        """
        self.connection_manager = connection_manager or QdrantConnectionManager()

    def _get_client(self) -> QdrantClient:
        """Helper to retrieve the active client connection."""
        return self.connection_manager.connect()

    def create_collection(
        self,
        collection_name: str,
        vector_size: int,
        distance_metric: str
    ) -> bool:
        """Creates a collection with designated configurations.

        Args:
            collection_name: Target collection name.
            vector_size: Dimension size of vector vectors.
            distance_metric: Metric calculations type (Cosine, Dot, Euclid).

        Returns:
            bool: True if created successfully.

        Raises:
            CollectionError: If creation fails.
        """
        logger.info(
            "Creating Qdrant collection '{}' (Vector size: {}, Metric: {})",
            collection_name,
            vector_size,
            distance_metric
        )

        metric = distance_metric.upper()
        if metric == "COSINE":
            distance = qmodels.Distance.COSINE
        elif metric == "DOT":
            distance = qmodels.Distance.DOT
        elif metric in ["EUCLID", "EUCLIDEAN"]:
            distance = qmodels.Distance.EUCLID
        else:
            logger.warning("Unrecognized distance metric: '{}'. Defaulting to COSINE.", distance_metric)
            distance = qmodels.Distance.COSINE

        try:
            client = self._get_client()
            client.create_collection(
                collection_name=collection_name,
                vectors_config=qmodels.VectorParams(
                    size=vector_size,
                    distance=distance
                )
            )
            logger.info("Collection '{}' created successfully. Setting up payload indexes...", collection_name)
            self.create_payload_indexes(collection_name)
            return True
        except Exception as e:
            logger.error("Failed to create collection '{}': {}", collection_name, str(e))
            raise CollectionError(f"Failed to create collection '{collection_name}': {str(e)}") from e

    def create_payload_indexes(self, collection_name: str) -> bool:
        """Safely creates payload keyword indexes for document_id and file_name if not present.

        Args:
            collection_name: Target collection name.

        Returns:
            bool: True if completed.
        """
        try:
            client = self._get_client()
            col_info = client.get_collection(collection_name=collection_name)
            existing_indexes = col_info.payload_schema or {}

            # Create document_id keyword index if missing
            if "document_id" not in existing_indexes:
                logger.info("Creating payload index for 'document_id' in collection '{}'...", collection_name)
                client.create_payload_index(
                    collection_name=collection_name,
                    field_name="document_id",
                    field_schema=qmodels.PayloadSchemaType.KEYWORD
                )

            # Create file_name keyword index if missing
            if "file_name" not in existing_indexes:
                logger.info("Creating payload index for 'file_name' in collection '{}'...", collection_name)
                client.create_payload_index(
                    collection_name=collection_name,
                    field_name="file_name",
                    field_schema=qmodels.PayloadSchemaType.KEYWORD
                )
            return True
        except Exception as e:
            logger.warning("Failed to verify/create payload indexes for '{}': {}", collection_name, str(e))
            return False

    def delete_collection(self, collection_name: str) -> bool:
        """Deletes collection from the Qdrant database.

        Args:
            collection_name: Target collection name.

        Returns:
            bool: True if deletion completes successfully.

        Raises:
            CollectionError: If deletion fails.
        """
        logger.info("Deleting Qdrant collection '{}'", collection_name)
        try:
            client = self._get_client()
            client.delete_collection(collection_name=collection_name)
            logger.info("Collection '{}' deleted successfully.", collection_name)
            return True
        except Exception as e:
            logger.error("Failed to delete collection '{}': {}", collection_name, str(e))
            raise CollectionError(f"Failed to delete collection '{collection_name}': {str(e)}") from e

    def collection_exists(self, collection_name: str) -> bool:
        """Checks if a collection exists.

        Args:
            collection_name: Target collection name.

        Returns:
            bool: True if collection exists.
        """
        try:
            client = self._get_client()
            client.get_collection(collection_name=collection_name)
            return True
        except Exception:
            return False

    def recreate_collection(
        self,
        collection_name: str,
        vector_size: int,
        distance_metric: str
    ) -> bool:
        """Recreates a collection, deleting it first if it exists.

        Args:
            collection_name: Target collection name.
            vector_size: Dimension size.
            distance_metric: Metric calculations type.

        Returns:
            bool: True if recreation completes successfully.
        """
        if self.collection_exists(collection_name):
            self.delete_collection(collection_name)
        return self.create_collection(collection_name, vector_size, distance_metric)

    def list_collections(self) -> List[str]:
        """Lists active collections.

        Returns:
            List[str]: List of names.
        """
        try:
            client = self._get_client()
            res = client.get_collections()
            return [c.name for c in res.collections]
        except Exception as e:
            logger.error("Failed to list active collections: {}", str(e))
            raise CollectionError(f"Failed to query collections: {str(e)}") from e
