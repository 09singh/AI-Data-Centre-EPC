from typing import Dict, Any, List, Optional
from loguru import logger

from ai.document_processing.models import DocumentMetadata
from ai.knowledge_engine.knowledge_base.interfaces import MetadataStoreInterface
from ai.knowledge_engine.knowledge_base.exceptions import MetadataStoreError


class InMemoryMetadataStore(MetadataStoreInterface):
    """In-memory implementation of MetadataStoreInterface."""

    def __init__(self):
        """Initializes metadata indexes and document mapping tables."""
        # Maps document_id -> Dict representing DocumentMetadata fields
        self._document_metadata: Dict[str, Dict[str, Any]] = {}
        # Maps chunk_id -> Dict containing chunk references
        self._chunk_metadata: Dict[str, Dict[str, Any]] = {}
        # Maps document_id -> List of associated chunk_ids (used for cascading purges)
        self._document_chunks_mapping: Dict[str, List[str]] = {}

    def store_document_metadata(self, document_id: str, metadata: DocumentMetadata) -> bool:
        """Stores file-level metadata fields.

        Args:
            document_id: Unique document ID.
            metadata: DocumentMetadata parameters object.

        Returns:
            bool: True if completed.

        Raises:
            MetadataStoreError: If storing fails.
        """
        logger.info("Storing metadata fields for document ID: '{}'", document_id)
        try:
            self._document_metadata[document_id] = metadata.model_dump()
            return True
        except Exception as e:
            logger.error("Failed to save metadata for document '{}': {}", document_id, str(e))
            raise MetadataStoreError(f"Failed to index document metadata: {str(e)}") from e

    def store_chunk_metadata(self, document_id: str, chunk_id: str, metadata: Dict[str, Any]) -> bool:
        """Stores chunk-level metadata indices.

        Args:
            document_id: Parent document ID.
            chunk_id: Unique chunk ID.
            metadata: Chunk parameters dict.

        Returns:
            bool: True if completed.

        Raises:
            MetadataStoreError: If storing fails.
        """
        logger.debug("Indexing chunk metadata for '{}' under document '{}'", chunk_id, document_id)
        try:
            self._chunk_metadata[chunk_id] = {
                **metadata,
                "document_id": document_id
            }

            # Map the chunk to the document mapping list to allow cascading deletes
            if document_id not in self._document_chunks_mapping:
                self._document_chunks_mapping[document_id] = []
            if chunk_id not in self._document_chunks_mapping[document_id]:
                self._document_chunks_mapping[document_id].append(chunk_id)

            return True
        except Exception as e:
            logger.error("Failed to save chunk metadata for '{}': {}", chunk_id, str(e))
            raise MetadataStoreError(f"Failed to index chunk metadata: {str(e)}") from e

    def get_document_metadata(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves file-level metadata records."""
        return self._document_metadata.get(document_id)

    def get_chunk_metadata(self, chunk_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves chunk-level metadata records."""
        return self._chunk_metadata.get(chunk_id)

    def delete_metadata(self, document_id: str) -> bool:
        """Purges document-level metadata and associated chunk metadata records.

        Args:
            document_id: Target document ID to clear.

        Returns:
            bool: True if document metadata records were found and removed.
        """
        logger.info("Purging metadata index entries for document: '{}'", document_id)
        doc_deleted = False
        if document_id in self._document_metadata:
            del self._document_metadata[document_id]
            doc_deleted = True

        # Purge all matching child chunks
        chunk_ids = self._document_chunks_mapping.get(document_id, [])
        for c_id in chunk_ids:
            if c_id in self._chunk_metadata:
                del self._chunk_metadata[c_id]

        # Purge mapping table
        if document_id in self._document_chunks_mapping:
            del self._document_chunks_mapping[document_id]

        return doc_deleted
