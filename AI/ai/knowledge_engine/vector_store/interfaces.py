from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from ai.knowledge_engine.embeddings.embedding_service import VectorEmbedding


class VectorStoreClient(ABC):
    """Interface for managing connections and health metrics of the Vector Database."""

    @abstractmethod
    def connect(self) -> Any:
        """Establishes or returns the database connection instance.

        Raises:
            ConnectionError: If connectivity fails.
        """
        pass

    @abstractmethod
    def health_check(self) -> bool:
        """Checks the connection status to ensure database is online."""
        pass


class CollectionManagerInterface(ABC):
    """Interface for managing vector database collections/tables."""

    @abstractmethod
    def create_collection(
        self,
        collection_name: str,
        vector_size: int,
        distance_metric: str
    ) -> bool:
        """Creates a new collection matching vector space and search configurations.

        Args:
            collection_name: Name of the collection.
            vector_size: Dimension size of stored vectors.
            distance_metric: Target metric type (e.g. Cosine, Euclid, Dot).

        Returns:
            bool: True if created successfully, False otherwise.

        Raises:
            CollectionError: If collection creation fails.
        """
        pass

    @abstractmethod
    def delete_collection(self, collection_name: str) -> bool:
        """Deletes a collection.

        Args:
            collection_name: Target collection name.

        Returns:
            bool: True if deleted, False otherwise.

        Raises:
            CollectionError: If deletion fails.
        """
        pass

    @abstractmethod
    def collection_exists(self, collection_name: str) -> bool:
        """Checks if a collection exists.

        Args:
            collection_name: Target collection name.

        Returns:
            bool: True if collection is found, False otherwise.
        """
        pass

    @abstractmethod
    def recreate_collection(
        self,
        collection_name: str,
        vector_size: int,
        distance_metric: str
    ) -> bool:
        """Recreates a collection, deleting it first if it exists.

        Args:
            collection_name: Name of the collection.
            vector_size: Dimension size.
            distance_metric: Target metric type.

        Returns:
            bool: True if recreated.
        """
        pass

    @abstractmethod
    def list_collections(self) -> List[str]:
        """Lists names of all active collections."""
        pass


class VectorServiceInterface(ABC):
    """Interface for vector CRUD operations."""

    @abstractmethod
    def insert_vectors(self, collection_name: str, embeddings: List[VectorEmbedding]) -> bool:
        """Inserts one or more vectors and associated payloads into the collection.

        Args:
            collection_name: Name of the target collection.
            embeddings: List of VectorEmbedding objects.

        Returns:
            bool: True if insertion completed successfully.

        Raises:
            VectorInsertError: If vector storage fails.
        """
        pass

    @abstractmethod
    def delete_vectors(self, collection_name: str, vector_ids: List[str]) -> bool:
        """Deletes a list of vectors by their unique IDs.

        Args:
            collection_name: Name of the collection.
            vector_ids: List of unique string identifiers to purge.

        Returns:
            bool: True if deletion completes.

        Raises:
            VectorDeleteError: If deletion fails.
        """
        pass

    @abstractmethod
    def fetch_vector_by_id(self, collection_name: str, vector_id: str) -> Optional[Dict[str, Any]]:
        """Fetches vector records including payload by ID.

        Args:
            collection_name: Name of the collection.
            vector_id: Target unique vector ID.

        Returns:
            Optional[Dict[str, Any]]: Dict representation of vector record if found.
        """
        pass
