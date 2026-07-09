class DocumentProcessingError(Exception):
    """Base exception for all document processing errors."""
    pass

class UnsupportedDocumentError(DocumentProcessingError):
    """Raised when the document format or file extension is not supported."""
    pass

class CorruptedDocumentError(DocumentProcessingError):
    """Raised when the document file is corrupted, unreadable, or missing critical structure."""
    pass

class EmptyDocumentError(DocumentProcessingError):
    """Raised when the document is empty or yields no text content."""
    pass

class ExtractionError(DocumentProcessingError):
    """Raised when text, tables, or metadata extraction fails during processing."""
    pass
