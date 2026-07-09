from loguru import logger
from ai.knowledge_engine.embeddings.interfaces import EmbeddingProvider
from ai.knowledge_engine.embeddings.embedding_model import SentenceTransformerEmbeddingModel


class EmbeddingFactory:
    """Factory class to instantiate and retrieve Embedding Providers.

    Acts as an abstraction layer to support plug-and-play integrations for
    BGE, E5, Instructor, and Nomic model families.
    """

    @staticmethod
    def get_provider(model_name: str) -> EmbeddingProvider:
        """Returns a concrete EmbeddingProvider instance matching the selected model.

        Args:
            model_name: Name of the target embedding model.

        Returns:
            EmbeddingProvider: Decoupled model provider instance.
        """
        logger.debug("Factory resolving embedding provider for model name: '{}'", model_name)

        normalized_name = model_name.lower()

        # Route dynamically based on model name signatures.
        # Currently, BGE, E5, and Nomic local models can run directly
        # on our SentenceTransformer implementation.
        if "bge" in normalized_name:
            logger.info("Instantiating local BGE Embedding provider wrapper.")
            return SentenceTransformerEmbeddingModel()
        elif "e5" in normalized_name:
            logger.info("Instantiating local E5 Embedding provider wrapper.")
            return SentenceTransformerEmbeddingModel()
        elif "nomic" in normalized_name:
            logger.info("Instantiating local Nomic Embedding provider wrapper.")
            return SentenceTransformerEmbeddingModel()
        elif "instructor" in normalized_name:
            logger.info("Instantiating local Instructor Embedding provider wrapper.")
            # Standard sentence-transformers loaded wrapper handles instructor model configurations
            return SentenceTransformerEmbeddingModel()
        else:
            logger.info("Instantiating default local SentenceTransformer provider wrapper.")
            return SentenceTransformerEmbeddingModel()
