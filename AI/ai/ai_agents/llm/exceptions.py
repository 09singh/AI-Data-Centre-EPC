class LLMError(Exception):
    """Base exception for all LLM client and network issues."""
    pass

class GroqError(LLMError):
    """Raised when Groq API calls fail, timeout, or return error payloads."""
    pass
