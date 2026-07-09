class RetrieverError(Exception):
    """Base exception for all retriever operations failures."""
    pass

class SearchError(RetrieverError):
    """Raised when the SearchService orchestrator fails."""
    pass

class ConfigurationError(RetrieverError):
    """Raised when search parameters violate bounds or defaults are missing."""
    pass
