import torch
from typing import List, Optional
try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    # Robust fallback for environments where large binaries cannot be downloaded
    class SentenceTransformer:  # type: ignore
        def __init__(self, *args, **kwargs):
            pass
        def encode(self, *args, **kwargs):
            raise ImportError("sentence-transformers package is not installed.")

from loguru import logger

from ai.config.settings import settings
from ai.knowledge_engine.embeddings.interfaces import EmbeddingProvider
from ai.knowledge_engine.embeddings.exceptions import ModelLoadError, EmbeddingGenerationError


class SentenceTransformerEmbeddingModel(EmbeddingProvider):
    """Sentence-transformers local embedding provider.

    Implements a lazy loading class-level model cache to ensure the model
    weights are loaded into memory exactly once.
    """

    _model_instance: Optional[SentenceTransformer] = None
    _dimension: Optional[int] = None

    def __init__(self):
        """Initializes the provider. Model loading is deferred until first invoke."""
        pass

    @classmethod
    def _get_model(cls) -> SentenceTransformer:
        """Loads and returns the model singleton instance, auto-detecting hardware acceleration.

        Returns:
            SentenceTransformer: The active model wrapper.

        Raises:
            ModelLoadError: If model cannot be instantiated or loaded.
        """
        if cls._model_instance is not None:
            return cls._model_instance

        model_name = settings.EMBEDDING_MODEL
        logger.info("Initializing SentenceTransformer embedding model: '{}'", model_name)

        # 1. Device detection
        if settings.EMBEDDING_DEVICE:
            device = settings.EMBEDDING_DEVICE.lower()
            logger.info("Using device configuration override: {}", device)
        else:
            if torch.cuda.is_available():
                device = "cuda"
            elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
                device = "mps"
            else:
                device = "cpu"
            logger.info("Hardware acceleration auto-detected device: {}", device)

        # 2. Model Loading
        try:
            cls._model_instance = SentenceTransformer(model_name, device=device)
            # Execute dummy encoding to verify dimension size
            test_vec = cls._model_instance.encode("test", normalize_embeddings=True)
            cls._dimension = len(test_vec)
            logger.info("Embedding model loaded successfully. Vector dimension: {}", cls._dimension)
        except Exception as e:
            logger.error("Failed to load SentenceTransformer model '{}': {}", model_name, str(e))
            raise ModelLoadError(f"Failed to load sentence-transformers model '{model_name}': {str(e)}") from e

        return cls._model_instance

    def embed_text(self, text: str) -> List[float]:
        """Encodes a single text block.

        Args:
            text: Input string.

        Returns:
            List[float]: Output vector coordinates.
        """
        if not text:
            raise EmbeddingGenerationError("Cannot generate embedding for empty or null text input.")

        model = self._get_model()
        try:
            # We enforce normalization for cosine similarity compatibility
            embedding = model.encode(text, normalize_embeddings=True)
            return embedding.tolist()
        except Exception as e:
            logger.error("Embedding generation failed for text: {}", str(e))
            raise EmbeddingGenerationError(f"Embedding generation failed: {str(e)}") from e

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Encodes a batch of texts.

        Args:
            texts: List of input strings.

        Returns:
            List[List[float]]: List of output vector coordinates.
        """
        if not texts:
            return []

        model = self._get_model()
        try:
            batch_size = settings.EMBEDDING_BATCH_SIZE
            logger.debug("Generating batch embeddings for {} items with batch_size={}", len(texts), batch_size)
            embeddings = model.encode(
                texts,
                batch_size=batch_size,
                show_progress_bar=False,
                normalize_embeddings=True
            )
            return embeddings.tolist()
        except Exception as e:
            logger.error("Batch embedding generation failed: {}", str(e))
            raise EmbeddingGenerationError(f"Batch embedding generation failed: {str(e)}") from e

    def get_dimension(self) -> int:
        """Returns the output vector space dimension for the loaded model."""
        if self._dimension is None:
            self._get_model()
        return self._dimension or 384
