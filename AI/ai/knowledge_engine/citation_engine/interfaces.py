from abc import ABC, abstractmethod
from ai.knowledge_engine.models import Citation, RetrievedChunk


class CitationBuilderInterface(ABC):
    """Interface to construct structured Citation models from retrieved chunks."""

    @abstractmethod
    def build_citation(self, chunk: RetrievedChunk) -> Citation:
        """Constructs a Citation object linking the matching block to its source file metadata.

        Args:
            chunk: Scored retrieved block.

        Returns:
            Citation: The compiled citation mapping.

        Raises:
            CitationError: If critical citation fields are missing.
        """
        pass


class CitationFormatterInterface(ABC):
    """Interface to format structured citations into user-facing formats."""

    @abstractmethod
    def format_citation(self, citation: Citation, format_type: str) -> str:
        """Formats the citation block into plain text, Markdown, or JSON.

        Args:
            citation: The target Citation model.
            format_type: Format style selection ('text', 'markdown', 'json').

        Returns:
            str: The serialized string representing the citation.

        Raises:
            CitationError: If formatting fails or style is unsupported.
        """
        pass
