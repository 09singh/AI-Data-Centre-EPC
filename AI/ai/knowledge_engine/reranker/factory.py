from loguru import logger
from ai.knowledge_engine.reranker.interfaces import RerankerInterface
from ai.knowledge_engine.reranker.reranker import IdentityReranker


class RerankerFactory:
    """Factory to instantiate configured or custom reranking engines."""

    @staticmethod
    def get_reranker(reranker_type: str) -> RerankerInterface:
        """Returns the reranker implementation matching the selection parameter.

        Args:
            reranker_type: Selected type (e.g. 'identity', 'bge', 'cohere').

        Returns:
            RerankerInterface: Concrete reranker object.
        """
        logger.debug("Factory resolving reranker provider for: '{}'", reranker_type)

        normalized_type = reranker_type.lower()
        if normalized_type == "identity":
            return IdentityReranker()
        elif normalized_type in ["bge", "bge-reranker", "cross-encoder"]:
            logger.info("Selected BGE/CrossEncoder Reranker. Defaulting to Identity reranker placeholder.")
            return IdentityReranker()
        elif normalized_type == "cohere":
            logger.info("Selected Cohere Reranker. Defaulting to Identity reranker placeholder.")
            return IdentityReranker()
        elif normalized_type == "jina":
            logger.info("Selected Jina AI Reranker. Defaulting to Identity reranker placeholder.")
            return IdentityReranker()
        else:
            logger.warning("Unrecognized reranker type: '{}'. Defaulting to Identity reranker.", reranker_type)
            return IdentityReranker()
