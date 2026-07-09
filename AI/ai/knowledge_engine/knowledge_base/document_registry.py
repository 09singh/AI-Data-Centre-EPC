from datetime import datetime
from typing import Dict, Any, List, Optional
from loguru import logger

from ai.knowledge_engine.knowledge_base.interfaces import DocumentRegistryInterface
from ai.knowledge_engine.knowledge_base.exceptions import DocumentRegistryError


class InMemoryDocumentRegistry(DocumentRegistryInterface):
    """In-memory implementation of DocumentRegistryInterface."""

    def __init__(self):
        """Initializes the registry dictionary."""
        self._registry: Dict[str, Dict[str, Any]] = {}

    def register_document(self, document_id: str, total_chunks: int, status: str = "registered") -> bool:
        """Registers a new document.

        Args:
            document_id: Unique string identifier of document.
            total_chunks: Generated count of chunks.
            status: Initial registration status.

        Returns:
            bool: True if registered.

        Raises:
            DocumentRegistryError: If registration fails.
        """
        logger.info("Registering document '{}' in registry (Total chunks: {})", document_id, total_chunks)
        try:
            self._registry[document_id] = {
                "document_id": document_id,
                "total_chunks": total_chunks,
                "status": status,
                "registered_at": datetime.utcnow().isoformat() + "Z",
                "updated_at": datetime.utcnow().isoformat() + "Z"
            }
            return True
        except Exception as e:
            logger.error("Failed to register document '{}': {}", document_id, str(e))
            raise DocumentRegistryError(f"Failed to register document '{document_id}': {str(e)}") from e

    def update_document_status(self, document_id: str, status: str) -> bool:
        """Updates document status in registry.

        Args:
            document_id: Unique document ID.
            status: Progress state.

        Returns:
            bool: True if completed.

        Raises:
            DocumentRegistryError: If status update fails.
        """
        logger.info("Updating document '{}' status to '{}'", document_id, status)
        if document_id not in self._registry:
            logger.error("Registry update failed. Document '{}' is not registered.", document_id)
            raise DocumentRegistryError(f"Document '{document_id}' is not registered.")

        try:
            self._registry[document_id]["status"] = status
            self._registry[document_id]["updated_at"] = datetime.utcnow().isoformat() + "Z"
            return True
        except Exception as e:
            logger.error("Failed to update status for '{}': {}", document_id, str(e))
            raise DocumentRegistryError(f"Failed to update document status for '{document_id}': {str(e)}") from e

    def delete_document(self, document_id: str) -> bool:
        """Deletes a document from the registry.

        Args:
            document_id: Unique identifier.

        Returns:
            bool: True if purged successfully.
        """
        logger.info("Deleting document '{}' from status registry", document_id)
        if document_id in self._registry:
            del self._registry[document_id]
            return True
        return False

    def get_document_status(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Gets document status parameters."""
        return self._registry.get(document_id)

    def list_documents(self) -> List[str]:
        """Lists registered document IDs."""
        return list(self._registry.keys())
