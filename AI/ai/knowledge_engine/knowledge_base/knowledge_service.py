from typing import List, Dict, Any, Optional
from loguru import logger

from ai.document_processing.models import DocumentMetadata, DocumentChunk
from ai.knowledge_engine.knowledge_base.interfaces import (
    KnowledgeServiceInterface,
    DocumentRegistryInterface,
    MetadataStoreInterface,
)
from ai.knowledge_engine.knowledge_base.document_registry import InMemoryDocumentRegistry
from ai.knowledge_engine.knowledge_base.metadata_store import InMemoryMetadataStore
from ai.knowledge_engine.knowledge_base.exceptions import KnowledgeBaseError


class KnowledgeService(KnowledgeServiceInterface):
    """Facade service coordinating document registry and metadata store workflows.

    Acts as the main API interface for the knowledge base container.
    """

    def __init__(
        self,
        registry: Optional[DocumentRegistryInterface] = None,
        metadata_store: Optional[MetadataStoreInterface] = None
    ):
        """Initializes the facade service.

        Args:
            registry: DocumentRegistry client.
            metadata_store: MetadataStore client.
        """
        self.registry = registry or InMemoryDocumentRegistry()
        self.metadata_store = metadata_store or InMemoryMetadataStore()

    def register_processed_document(
        self,
        document_id: str,
        metadata: DocumentMetadata,
        chunks: List[DocumentChunk]
    ) -> bool:
        """Registers a parsed document and indexes its metadata parameters.

        Args:
            document_id: Target document ID.
            metadata: DocumentMetadata object.
            chunks: List of DocumentChunks.

        Returns:
            bool: True if completed.

        Raises:
            KnowledgeBaseError: If registration fails.
        """
        logger.info(
            "Registering processed document '{}' (File: {}, Chunks count: {})",
            document_id,
            metadata.file_name,
            len(chunks)
        )
        try:
            # 1. Register base status
            self.registry.register_document(document_id, len(chunks), "registered")

            # 2. Store document metadata properties
            self.metadata_store.store_document_metadata(document_id, metadata)

            # 3. Store chunk-specific metadata parameters
            for chunk in chunks:
                chunk_meta = {
                    "chunk_id": chunk.chunk_id,
                    "page_numbers": chunk.page_numbers,
                    "section_heading": chunk.section_heading,
                    **chunk.chunk_metadata
                }
                self.metadata_store.store_chunk_metadata(document_id, chunk.chunk_id, chunk_meta)

            # 4. Update status to completed
            self.registry.update_document_status(document_id, "completed")
            return True
        except Exception as e:
            logger.error("Failed to register processed document elements for '{}': {}", document_id, str(e))
            raise KnowledgeBaseError(f"Failed to register document elements: {str(e)}") from e

    def remove_document(self, document_id: str) -> bool:
        """Removes all document records from registry and metadata stores.

        Args:
            document_id: Target document ID.

        Returns:
            bool: True if purged successfully.

        Raises:
            KnowledgeBaseError: If deletion fails.
        """
        logger.info("Removing document '{}' from knowledge base stores", document_id)
        try:
            # Delete from status registry
            registry_deleted = self.registry.delete_document(document_id)
            # Delete associated metadata profiles
            metadata_deleted = self.metadata_store.delete_metadata(document_id)

            return registry_deleted or metadata_deleted
        except Exception as e:
            logger.error("Failed to purge document '{}' from stores: {}", document_id, str(e))
            raise KnowledgeBaseError(f"Failed to delete document from stores: {str(e)}") from e

    def get_document_profile(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Gathers aggregated registry status and metadata references.

        Args:
            document_id: Target document ID.

        Returns:
            Optional[Dict[str, Any]]: Unified document profile dictionary.
        """
        status = self.registry.get_document_status(document_id)
        if not status:
            logger.debug("Document profile for '{}' not found in registry.", document_id)
            return None

        metadata = self.metadata_store.get_document_metadata(document_id)

        return {
            "document_id": document_id,
            "status": status.get("status"),
            "total_chunks": status.get("total_chunks"),
            "registered_at": status.get("registered_at"),
            "updated_at": status.get("updated_at"),
            "metadata": metadata
        }
    def list_documents(self) -> List[str]:
        """Lists registered document IDs."""
        return self.registry.list_documents()
