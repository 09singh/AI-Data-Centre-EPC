class EmbeddingError(Exception):
    """Base exception for all embedding-related errors."""
    pass

class ModelLoadError(EmbeddingError):
    """Raised when the embedding model fails to load into memory."""
    pass

class EmbeddingGenerationError(EmbeddingError):
    """Raised when vector generation fails for single or batch inputs."""
    pass
