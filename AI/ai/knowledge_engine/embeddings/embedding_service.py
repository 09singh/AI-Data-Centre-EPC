import time
from typing import List, Dict, Any, Optional
from loguru import logger
from pydantic import BaseModel, Field

from ai.config.settings import settings
from ai.document_processing.models import ProcessedDocument, DocumentChunk
from ai.knowledge_engine.embeddings.embedding_factory import EmbeddingFactory
from ai.knowledge_engine.embeddings.interfaces import EmbeddingProvider


class VectorEmbedding(BaseModel):
    """Strongly typed output model representing a generated vector embedding."""

    chunk_id: str = Field(
        ...,
        description="Unique identifier of the source document chunk"
    )
    embedding: List[float] = Field(
        ...,
        description="High-dimensional floating point coordinate vector"
    )
    metadata_reference: Dict[str, Any] = Field(
        default_factory=dict,
        description="Metadata reference fields associated with the source chunk"
    )


class EmbeddingService:
    """Service orchestrator that manages embedding generations for documents and text chunks."""

    def __init__(self, provider: Optional[EmbeddingProvider] = None):
        """Initializes the EmbeddingService.

        Args:
            provider: Optional custom EmbeddingProvider. If None, resolves from factory configuration.
        """
        if provider:
            self.provider = provider
        else:
            self.provider = EmbeddingFactory.get_provider(settings.EMBEDDING_MODEL)

    def embed_text(self, text: str) -> List[float]:
        """Converts a single string of text into a vector embedding.

        Args:
            text: Input string block.

        Returns:
            List[float]: Output vector.
        """
        start_time = time.time()
        logger.debug("Generating embedding for single text input.")

        vector = self.provider.embed_text(text)

        latency = time.time() - start_time
        logger.info("Single embedding generated successfully. Latency: {:.4f}s", latency)
        return vector

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Converts a batch of string inputs into a list of vector embeddings.

        Args:
            texts: List of input strings.

        Returns:
            List[List[float]]: List of output vectors.
        """
        if not texts:
            return []

        start_time = time.time()
        batch_size = settings.EMBEDDING_BATCH_SIZE
        logger.info(
            "Generating embeddings for batch of {} elements (configured batch_size={})",
            len(texts),
            batch_size
        )

        vectors = self.provider.embed_batch(texts)

        latency = time.time() - start_time
        logger.info("Batch embedding generation completed. Latency: {:.4f}s", latency)
        return vectors

    def embed_chunks(self, chunks: List[DocumentChunk]) -> List[VectorEmbedding]:
        """Generates vector embeddings for a list of document chunks.

        Args:
            chunks: List of DocumentChunk objects.

        Returns:
            List[VectorEmbedding]: Strongly typed vector embedding outputs.
        """
        if not chunks:
            logger.warning("Empty chunk list passed for embedding generation.")
            return []

        logger.info("Processing embedding generation for {} document chunks...", len(chunks))

        # Extract text elements for batch processing to utilize hardware speedups
        texts = [chunk.text for chunk in chunks]
        vectors = self.embed_batch(texts)

        # Re-associate vector outputs with source IDs and chunk contexts
        vector_embeddings = []
        for idx, chunk in enumerate(chunks):
            logger.info("[TRACE: embed_chunks] chunk.text: {}", repr(chunk.text[:60]))
            
            metadata = {
                "chunk_id": chunk.chunk_id,
                "text": chunk.text,
                "page_numbers": chunk.page_numbers,
                "section_heading": chunk.section_heading,
                **chunk.chunk_metadata
            }
            logger.info("[TRACE: embed_chunks] metadata_reference keys: {}", list(metadata.keys()))
            
            vector_embeddings.append(VectorEmbedding(
                chunk_id=chunk.chunk_id,
                embedding=vectors[idx],
                metadata_reference=metadata
            ))

        return vector_embeddings

    def embed_document(self, document: ProcessedDocument) -> List[VectorEmbedding]:
        """Generates vector embeddings for all chunks in a processed document.

        Args:
            document: ProcessedDocument object.

        Returns:
            List[VectorEmbedding]: List of generated vector embeddings.
        """
        logger.info(
            "Embedding processed document: '{}' (Total chunks: {})",
            document.metadata.file_name,
            len(document.chunks)
        )
        return self.embed_chunks(document.chunks)
