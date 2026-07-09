from loguru import logger
from ai.knowledge_engine.models import Citation
from ai.knowledge_engine.citation_engine.interfaces import CitationFormatterInterface
from ai.knowledge_engine.citation_engine.exceptions import CitationError


class CitationFormatter(CitationFormatterInterface):
    """Formats structured citations into various user-facing layouts."""

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
        logger.debug("Formatting citation in style: '{}'", format_type)
        style = format_type.lower().strip()

        try:
            if style in ["text", "plain"]:
                pages_str = ", ".join(str(p) for p in citation.page_numbers)
                section = f", Section: {citation.section_heading}" if citation.section_heading else ""
                return (
                    f"Source: {citation.document_name} "
                    f"(Page(s): {pages_str}{section}) - "
                    f"Similarity: {citation.similarity_score:.4f}"
                )

            elif style == "markdown":
                pages_str = ", ".join(str(p) for p in citation.page_numbers)
                section = f" (Section: {citation.section_heading})" if citation.section_heading else ""
                score_pct = citation.similarity_score * 100
                return (
                    f"**[{citation.document_name}](file:///{citation.document_id})**"
                    f"{section} | Page(s): {pages_str} | Similarity: {score_pct:.1f}%"
                )

            elif style == "json":
                return citation.model_dump_json()

            else:
                logger.error("Unsupported citation format request: '{}'", format_type)
                raise CitationError(f"Unsupported citation format: '{format_type}'. Supported: 'text', 'markdown', 'json'")
        except CitationError:
            raise
        except Exception as e:
            logger.error("Formatting failed for citation: {}", str(e))
            raise CitationError(f"Failed to serialize citation: {str(e)}") from e
