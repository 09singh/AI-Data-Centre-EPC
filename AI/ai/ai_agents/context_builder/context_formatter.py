from typing import List
from loguru import logger

from ai.knowledge_engine.models import RetrievedChunk
from ai.ai_agents.context_builder.interfaces import ContextFormatterInterface


class ContextFormatter(ContextFormatterInterface):
    """Standard formatter mapping structured chunks into annotated reference blocks."""

    def format_chunks(self, chunks: List[RetrievedChunk]) -> str:
        """Formats lists of chunk objects into structured reference texts.

        Args:
            chunks: Matching retrieved blocks.

        Returns:
            str: Converted text reference blocks.
        """
        if not chunks:
            return ""

        logger.debug("Formatting {} retrieved chunks for prompt injection.", len(chunks))
        formatted = []

        for idx, chunk in enumerate(chunks, 1):
            doc_name = chunk.file_name or "Unknown Document"
            pages = ", ".join(str(p) for p in chunk.page_numbers) if chunk.page_numbers else "1"
            section = f" | Section: {chunk.section_heading}" if chunk.section_heading else ""

            block = (
                f"[Source Document #{idx}] File: {doc_name} | Page(s): {pages}{section} | Score: {chunk.score:.4f}\n"
                f"Content: {chunk.text.strip()}"
            )
            formatted.append(block)

        return "\n\n---\n\n".join(formatted)
