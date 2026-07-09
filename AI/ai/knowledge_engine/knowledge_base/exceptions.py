class KnowledgeBaseError(Exception):
    """Base exception for all knowledge base related errors."""
    pass

class DocumentRegistryError(KnowledgeBaseError):
    """Raised when registering, updating, or deleting document profiles fails."""
    pass

class MetadataStoreError(KnowledgeBaseError):
    """Raised when storing, querying, or parsing metadata records fails."""
    pass
