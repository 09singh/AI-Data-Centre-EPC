from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from ai.document_processing.models import DocumentMetadata, DocumentChunk


class DocumentRegistryInterface(ABC):
    """Interface to manage the active profiles and indexing status of documents."""

    @abstractmethod
    def register_document(self, document_id: str, total_chunks: int, status: str = "registered") -> bool:
        """Creates or updates a document registry record.

        Args:
            document_id: Unique string identifier of document.
            total_chunks: Count of text chunks generated.
            status: Progress state (e.g. 'registered', 'indexed').

        Returns:
            bool: True if completed successfully.
        """
        pass

    @abstractmethod
    def update_document_status(self, document_id: str, status: str) -> bool:
        """Updates document indexing status.

        Args:
            document_id: Unique identifier.
            status: Target progress state.

        Returns:
            bool: True if updated.
        """
        pass

    @abstractmethod
    def delete_document(self, document_id: str) -> bool:
        """Purges a document record from the status registry.

        Args:
            document_id: Target document ID.

        Returns:
            bool: True if deleted.
        """
        pass

    @abstractmethod
    def get_document_status(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves registered status parameters of a document.

        Args:
            document_id: Target ID.

        Returns:
            Optional[Dict[str, Any]]: Status dict containing registration details, or None.
        """
        pass

    @abstractmethod
    def list_documents(self) -> List[str]:
        """Lists IDs of all registered documents."""
        pass


class MetadataStoreInterface(ABC):
    """Interface to manage detailed metadata mapping stores for chunks and files."""

    @abstractmethod
    def store_document_metadata(self, document_id: str, metadata: DocumentMetadata) -> bool:
        """Saves file level metadata.

        Args:
            document_id: Unique ID of document.
            metadata: DocumentMetadata object.

        Returns:
            bool: True if saved.
        """
        pass

    @abstractmethod
    def store_chunk_metadata(self, document_id: str, chunk_id: str, metadata: Dict[str, Any]) -> bool:
        """Saves individual chunk metadata parameters.

        Args:
            document_id: Parent document identifier.
            chunk_id: Target unique chunk ID.
            metadata: Metadata dictionary.

        Returns:
            bool: True if saved.
        """
        pass

    @abstractmethod
    def get_document_metadata(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves stored file-level metadata records.

        Args:
            document_id: Target document ID.

        Returns:
            Optional[Dict[str, Any]]: Metadata dictionary, or None.
        """
        pass

    @abstractmethod
    def get_chunk_metadata(self, chunk_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves stored chunk-level metadata records.

        Args:
            chunk_id: Target chunk ID.

        Returns:
            Optional[Dict[str, Any]]: Metadata details dictionary, or None.
        """
        pass

    @abstractmethod
    def delete_metadata(self, document_id: str) -> bool:
        """Purges all metadata fields related to a document ID.

        Args:
            document_id: Target document ID.

        Returns:
            bool: True if completed.
        """
        pass


class KnowledgeServiceInterface(ABC):
    """Interface to orchestrate registry, metadata indexer, and lifecycles."""

    @abstractmethod
    def register_processed_document(
        self,
        document_id: str,
        metadata: DocumentMetadata,
        chunks: List[DocumentChunk]
    ) -> bool:
        """Registers a newly parsed document and its chunks.

        Args:
            document_id: Target document ID.
            metadata: File metadata.
            chunks: Chunks list.

        Returns:
            bool: True if completed.
        """
        pass

    @abstractmethod
    def remove_document(self, document_id: str) -> bool:
        """Removes all document records from registry and stores.

        Args:
            document_id: Target document ID.

        Returns:
            bool: True if deleted.
        """
        pass

    @abstractmethod
    def get_document_profile(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Gathers aggregated registry status and metadata references.

        Args:
            document_id: Target document ID.

        Returns:
            Optional[Dict[str, Any]]: Profile dictionary.
        """
        pass
