class VectorStoreError(Exception):
    """Base exception for all vector store errors."""
    pass

class ConnectionError(VectorStoreError):
    """Raised when connecting to the Qdrant database fails or timeouts."""
    pass

class CollectionError(VectorStoreError):
    """Raised when collection management operations (create/delete/check) fail."""
    pass

class VectorInsertError(VectorStoreError):
    """Raised when inserting vectors or payloads into a collection fails."""
    pass

class VectorDeleteError(VectorStoreError):
    """Raised when deleting vectors from a collection fails."""
    pass
