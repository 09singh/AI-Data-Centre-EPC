from abc import ABC, abstractmethod
from typing import List


class EmbeddingProvider(ABC):
    """Abstract interface defining the contract for all Embedding Model providers.

    Ensures zero implementation leakage and supports future plug-and-play models.
    """

    @abstractmethod
    def embed_text(self, text: str) -> List[float]:
        """Converts a single string of text into a vector embedding.

        Args:
            text: Input string.

        Returns:
            List[float]: The generated vector embedding.

        Raises:
            EmbeddingGenerationError: If vector generation fails.
        """
        pass

    @abstractmethod
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Converts a batch of string inputs into a list of vector embeddings.

        Args:
            texts: List of strings.

        Returns:
            List[List[float]]: List of generated vector embeddings.

        Raises:
            EmbeddingGenerationError: If vector generation fails.
        """
        pass

    @abstractmethod
    def get_dimension(self) -> int:
        """Returns the output vector space dimension for the loaded model.

        Returns:
            int: Vector dimension size (e.g. 384 for bge-small-en-v1.5).
        """
        pass
