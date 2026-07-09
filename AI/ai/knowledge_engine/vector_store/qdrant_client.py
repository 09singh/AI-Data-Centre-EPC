from typing import Optional, Any
from qdrant_client import QdrantClient
from loguru import logger

from ai.config.settings import settings
from ai.knowledge_engine.vector_store.interfaces import VectorStoreClient
from ai.knowledge_engine.vector_store.exceptions import ConnectionError


class QdrantConnectionManager(VectorStoreClient):
    """Manages the connection lifecycle to the Qdrant database as a connection singleton."""

    _client_instance: Optional[QdrantClient] = None

    def connect(self) -> QdrantClient:
        """Retrieves or creates the QdrantClient connection singleton.

        Returns:
            QdrantClient: The active database connection wrapper.

        Raises:
            ConnectionError: If connection fails.
        """
        if self._client_instance is not None:
            return self._client_instance

        logger.info("Establishing Qdrant client connection to: {}", settings.QDRANT_URL)
        try:
            # support local mock database or in-memory settings for testing
            if settings.QDRANT_URL == ":memory:":
                self._client_instance = QdrantClient(":memory:")
            else:
                self._client_instance = QdrantClient(
                    url=settings.QDRANT_URL,
                    api_key=settings.QDRANT_API_KEY,
                    timeout=10.0
                )
            logger.info("Qdrant connection initialized successfully.")
        except Exception as e:
            logger.error("Failed to connect to Qdrant at {}: {}", settings.QDRANT_URL, str(e))
            raise ConnectionError(f"Could not connect to Qdrant vector database: {str(e)}") from e

        return self._client_instance

    def health_check(self) -> bool:
        """Verifies if the connection to Qdrant is currently operational.

        Returns:
            bool: True if database queries succeed.
        """
        try:
            client = self.connect()
            if settings.QDRANT_URL == ":memory:":
                return True
            # Lightweight listing query serves as connection verify health diagnostic
            client.get_collections()
            return True
        except Exception as e:
            logger.warning("Qdrant connection health check failed: {}", str(e))
            # Reset client singleton cache so reconnect will be forced on next invoke
            QdrantConnectionManager._client_instance = None
            return False
