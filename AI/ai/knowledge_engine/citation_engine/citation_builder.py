from loguru import logger
from ai.knowledge_engine.models import Citation, RetrievedChunk
from ai.knowledge_engine.citation_engine.interfaces import CitationBuilderInterface
from ai.knowledge_engine.citation_engine.exceptions import CitationError


class CitationBuilder(CitationBuilderInterface):
    """Constructs structured Citation metadata objects from retrieved document blocks."""

    def build_citation(self, chunk: RetrievedChunk) -> Citation:
        """Constructs a Citation object linking the matching block to its source file metadata.

        Args:
            chunk: Retrieved Scored block.

        Returns:
            Citation: The compiled citation mapping.

        Raises:
            CitationError: If critical citation fields are missing.
        """
        logger.debug("Building citation mapping for chunk ID: '{}'", chunk.chunk_id)

        try:
            # Map fallback properties if not populated in the payload
            doc_name = chunk.file_name or "Unknown Document"
            doc_id = chunk.document_id or "Unknown_ID"
            pages = chunk.page_numbers or [1]

            return Citation(
                document_name=doc_name,
                document_id=doc_id,
                chunk_id=chunk.chunk_id,
                page_numbers=pages,
                section_heading=chunk.section_heading,
                similarity_score=chunk.score
            )
        except Exception as e:
            logger.error("Failed to build citation for chunk '{}': {}", chunk.chunk_id, str(e))
            raise CitationError(f"Failed to map citation fields: {str(e)}") from e
