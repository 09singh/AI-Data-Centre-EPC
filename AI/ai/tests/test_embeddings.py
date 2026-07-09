import pytest
from unittest.mock import MagicMock, patch
import numpy as np

from ai.config.settings import settings
from ai.document_processing.models import DocumentChunk
from ai.knowledge_engine.embeddings.exceptions import ModelLoadError, EmbeddingGenerationError
from ai.knowledge_engine.embeddings.embedding_model import SentenceTransformerEmbeddingModel
from ai.knowledge_engine.embeddings.embedding_factory import EmbeddingFactory
from ai.knowledge_engine.embeddings.embedding_service import EmbeddingService, VectorEmbedding


@pytest.fixture
def mock_sentence_transformer():
    """Fixture to mock SentenceTransformer.

    Prevents downloading model weights from Hugging Face during test execution.
    """
    with patch("ai.knowledge_engine.embeddings.embedding_model.SentenceTransformer") as mock_class:
        mock_instance = MagicMock()
        # Mock encode behavior to return a NumPy array depending on single vs list input
        mock_instance.encode.side_effect = lambda texts, **kwargs: (
            np.random.rand(len(texts), 384) if isinstance(texts, list)
            else np.random.rand(384)
        )
        mock_class.return_value = mock_instance
        yield mock_class


def test_model_lazy_loading(mock_sentence_transformer):
    """Verifies that the SentenceTransformer is not loaded into memory until first invoke."""
    # Reset internal class singletons
    SentenceTransformerEmbeddingModel._model_instance = None
    SentenceTransformerEmbeddingModel._dimension = None

    provider = SentenceTransformerEmbeddingModel()
    assert SentenceTransformerEmbeddingModel._model_instance is None

    # Access dimension to trigger loading
    dim = provider.get_dimension()
    assert dim == 384
    assert SentenceTransformerEmbeddingModel._model_instance is not None
    mock_sentence_transformer.assert_called_once()


def test_single_embedding(mock_sentence_transformer):
    """Verifies single text encoding generates a list of floats of standard size."""
    provider = SentenceTransformerEmbeddingModel()
    vec = provider.embed_text("Data Hall area engineering specifications.")
    assert len(vec) == 384
    assert isinstance(vec, list)
    assert isinstance(vec[0], float)


def test_batch_embedding(mock_sentence_transformer):
    """Verifies batch text encoding generates a list of vectors."""
    provider = SentenceTransformerEmbeddingModel()
    vecs = provider.embed_batch(["Piping spec A", "Cooling spec B"])
    assert len(vecs) == 2
    assert len(vecs[0]) == 384


def test_embedding_factory(mock_sentence_transformer):
    """Verifies the factory maps BGE, E5, and other configurations correctly."""
    provider_bge = EmbeddingFactory.get_provider("BAAI/bge-small-en-v1.5")
    assert isinstance(provider_bge, SentenceTransformerEmbeddingModel)

    provider_e5 = EmbeddingFactory.get_provider("intfloat/multilingual-e5-small")
    assert isinstance(provider_e5, SentenceTransformerEmbeddingModel)


def test_embedding_service_chunks(mock_sentence_transformer):
    """Verifies the service converts DocumentChunks into VectorEmbeddings with metadata refs."""
    service = EmbeddingService()
    chunks = [
        DocumentChunk(
            chunk_id="chk_001",
            text="First specification block text content.",
            page_numbers=[1],
            section_heading="1. SCOPE",
            chunk_metadata={"length": 39}
        ),
        DocumentChunk(
            chunk_id="chk_002",
            text="Second specification block text content.",
            page_numbers=[2],
            section_heading="2. SCHEDULE",
            chunk_metadata={"length": 40}
        )
    ]

    vector_embeddings = service.embed_chunks(chunks)
    assert len(vector_embeddings) == 2

    first_embed = vector_embeddings[0]
    assert isinstance(first_embed, VectorEmbedding)
    assert first_embed.chunk_id == "chk_001"
    assert len(first_embed.embedding) == 384
    assert first_embed.metadata_reference["section_heading"] == "1. SCOPE"
    assert first_embed.metadata_reference["page_numbers"] == [1]
    assert first_embed.metadata_reference["length"] == 39


def test_exception_handling():
    """Verifies custom embedding exceptions are raised upon loading or execution failures."""
    # Reset singleton state
    SentenceTransformerEmbeddingModel._model_instance = None
    SentenceTransformerEmbeddingModel._dimension = None

    # Test load failure
    with patch("ai.knowledge_engine.embeddings.embedding_model.SentenceTransformer", side_effect=Exception("HF Hub offline")):
        provider = SentenceTransformerEmbeddingModel()
        with pytest.raises(ModelLoadError):
            provider.embed_text("test")

    # Test generation failure
    with patch("ai.knowledge_engine.embeddings.embedding_model.SentenceTransformer") as mock_class:
        mock_instance = MagicMock()
        mock_instance.encode.side_effect = Exception("Out of memory on GPU device")
        mock_class.return_value = mock_instance
        SentenceTransformerEmbeddingModel._model_instance = mock_instance
        SentenceTransformerEmbeddingModel._dimension = 384

        provider = SentenceTransformerEmbeddingModel()
        with pytest.raises(EmbeddingGenerationError):
            provider.embed_text("test")
