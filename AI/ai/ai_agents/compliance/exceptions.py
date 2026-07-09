class ComplianceError(Exception):
    """Base exception for all specification compliance verification errors."""
    pass

class ValidationError(ComplianceError):
    """Raised when quality validation check fails or metadata is corrupt."""
    pass
