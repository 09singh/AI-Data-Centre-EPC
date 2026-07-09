import pytest
from ai.config.settings import settings

# Force in-memory database target configuration for testing
settings.QDRANT_URL = ":memory:"
settings.COLLECTION_NAME = "search_test_collection"
settings.RERANKER_TYPE = "identity"

from ai.knowledge_engine.vector_store.qdrant_client import QdrantConnectionManager
from ai.knowledge_engine.vector_store.collection_manager import QdrantCollectionManager
from ai.knowledge_engine.vector_store.vector_service import QdrantVectorService
from ai.knowledge_engine.embeddings.embedding_service import VectorEmbedding
from ai.knowledge_engine.retriever.retriever import QdrantRetriever
from ai.knowledge_engine.retriever.search_service import SearchService
from ai.knowledge_engine.retriever.exceptions import RetrieverError, SearchError
from ai.knowledge_engine.reranker.reranker import IdentityReranker
from ai.knowledge_engine.reranker.factory import RerankerFactory
from ai.knowledge_engine.citation_engine.citation_builder import CitationBuilder
from ai.knowledge_engine.citation_engine.citation_formatter import CitationFormatter
from ai.knowledge_engine.citation_engine.exceptions import CitationError
from ai.knowledge_engine.models import RetrievedChunk, Citation, SearchResult


@pytest.fixture
def connection_manager():
    """Resets client state and retrieves connection manager."""
    QdrantConnectionManager._client_instance = None
    return QdrantConnectionManager()


@pytest.fixture
def collection_manager(connection_manager):
    """Retrieves collection manager instance."""
    return QdrantCollectionManager(connection_manager)


@pytest.fixture
def vector_service(connection_manager):
    """Retrieves vector CRUD service instance."""
    return QdrantVectorService(connection_manager)


@pytest.fixture
def retriever(connection_manager):
    """Retrieves retriever instance."""
    return QdrantRetriever(connection_manager)


@pytest.fixture
def search_service(retriever):
    """Retrieves search service coordinator instance."""
    return SearchService(retriever=retriever)


@pytest.fixture
def seeded_db(collection_manager, vector_service):
    """Seeds the in-memory database with test chunks for retrieval query validation."""
    col_name = settings.COLLECTION_NAME
    collection_manager.recreate_collection(col_name, vector_size=3, distance_metric="Cosine")

    # Seed 3 distinct vectors with metadata payloads
    embeddings = [
        VectorEmbedding(
            chunk_id="chunk_a",
            embedding=[1.0, 0.0, 0.0],
            metadata_reference={
                "chunk_id": "chunk_a",
                "text": "Data Hall A uses chilled water cooling loops.",
                "page_numbers": [1],
                "section_heading": "Cooling Systems",
                "document_id": "doc_001",
                "file_name": "cooling_specs.pdf"
            }
        ),
        VectorEmbedding(
            chunk_id="chunk_b",
            embedding=[0.0, 1.0, 0.0],
            metadata_reference={
                "chunk_id": "chunk_b",
                "text": "UPS battery backups utilize lithium-ion modules.",
                "page_numbers": [2],
                "section_heading": "Electrical Systems",
                "document_id": "doc_001",
                "file_name": "cooling_specs.pdf"
            }
        ),
        VectorEmbedding(
            chunk_id="chunk_c",
            embedding=[0.0, 0.0, 1.0],
            metadata_reference={
                "chunk_id": "chunk_c",
                "text": "Compliance checklist mandates double fire walls.",
                "page_numbers": [1],
                "section_heading": "Safety Regulations",
                "document_id": "doc_002",
                "file_name": "safety_specs.pdf"
            }
        )
    ]

    vector_service.insert_vectors(col_name, embeddings)
    return col_name


def test_similarity_retrieval(seeded_db, retriever):
    """Verifies that retrieval executes similarity queries and sorts scores correctly."""
    # Query vector matches chunk_a perfectly
    results = retriever.retrieve(
        query_vector=[1.0, 0.0, 0.0],
        top_k=2,
        score_threshold=0.1
    )
    assert len(results) > 0
    assert results[0].chunk_id == "chunk_a"
    assert "cooling loops" in results[0].text
    assert results[0].score == pytest.approx(1.0)


def test_metadata_filtering(seeded_db, retriever):
    """Verifies metadata filtering routes Qdrant filter conditions correctly."""
    # Query matches chunk_c, but filtered only for document_id 'doc_001'
    results = retriever.retrieve(
        query_vector=[0.0, 0.0, 1.0],
        top_k=5,
        score_threshold=0.1,
        filters={"document_id": "doc_001"}
    )
    # chunk_c is doc_002 and should be excluded by the filter
    for chunk in results:
        assert chunk.chunk_id != "chunk_c"


def test_top_k_constraint(seeded_db, retriever):
    """Verifies retriever constraints limit results to top-K count."""
    results = retriever.retrieve(
        query_vector=[1.0, 1.0, 1.0],
        top_k=1,
        score_threshold=0.01
    )
    assert len(results) == 1


def test_citation_generation():
    """Verifies citation builder constructs detailed citation properties from a chunk."""
    builder = CitationBuilder()
    chunk = RetrievedChunk(
        chunk_id="chunk_abc",
        text="Sample specification description text.",
        score=0.885,
        page_numbers=[3],
        section_heading="Fire Protection",
        document_id="doc_fire_9",
        file_name="safety.pdf"
    )

    citation = builder.build_citation(chunk)
    assert citation.document_name == "safety.pdf"
    assert citation.document_id == "doc_fire_9"
    assert citation.chunk_id == "chunk_abc"
    assert citation.page_numbers == [3]
    assert citation.section_heading == "Fire Protection"
    assert citation.similarity_score == 0.885


def test_citation_formatting():
    """Verifies citation formatter formats output as text, Markdown, or JSON."""
    formatter = CitationFormatter()
    citation = Citation(
        document_name="specs.pdf",
        document_id="doc_123",
        chunk_id="chk_55",
        page_numbers=[1, 2],
        section_heading="Scope",
        similarity_score=0.95
    )

    # Test Text Format
    txt = formatter.format_citation(citation, "text")
    assert "specs.pdf" in txt
    assert "Page(s): 1, 2" in txt
    assert "Section: Scope" in txt
    assert "0.9500" in txt

    # Test Markdown Format
    md = formatter.format_citation(citation, "markdown")
    assert "**[specs.pdf](file:///doc_123)**" in md
    assert "Similarity: 95.0%" in md

    # Test JSON Format
    js = formatter.format_citation(citation, "json")
    assert '"chunk_id":"chk_55"' in js

    # Test Unsupported Format
    with pytest.raises(CitationError):
        formatter.format_citation(citation, "pdf")


def test_identity_reranker():
    """Verifies identity reranker acts as a pass-through returning elements in order."""
    reranker = IdentityReranker()
    chunks = [
        RetrievedChunk(chunk_id="a", text="text a", score=0.9, page_numbers=[1]),
        RetrievedChunk(chunk_id="b", text="text b", score=0.8, page_numbers=[2])
    ]
    reordered = reranker.rerank("cooling systems", chunks)
    assert reordered[0].chunk_id == "a"
    assert reordered[1].chunk_id == "b"

    # Test Reranker Factory
    factory_reranker = RerankerFactory.get_reranker("cohere")
    assert isinstance(factory_reranker, IdentityReranker)


def test_search_orchestration(seeded_db, search_service):
    """Verifies search service orchestrates query searches, rerank steps, and citations."""
    res = search_service.search(
        query_text="Chilled water systems",
        query_vector=[1.0, 0.0, 0.0],
        top_k=2,
        score_threshold=0.1
    )

    assert isinstance(res, SearchResult)
    assert res.query_text == "Chilled water systems"
    assert len(res.results) > 0
    assert res.results[0].chunk_id == "chunk_a"

    # Verify citation generated mappings matches first result
    assert len(res.citations) == len(res.results)
    assert res.citations[0].document_id == "doc_001"
    assert res.citations[0].document_name == "cooling_specs.pdf"
    assert res.metadata.top_k == 2


def test_retriever_exceptions(retriever):
    """Verifies RetrieverError exceptions are raised when search parameters are wrong."""
    # Querying invalid size vector should raise exception
    with pytest.raises(RetrieverError):
        retriever.retrieve(
            query_vector=[1.0],
            top_k=2,
            score_threshold=0.1
        )


def test_scroll_retrieval_by_document(seeded_db, retriever, search_service):
    """Verifies that scroll-based retrieval successfully fetches all chunks for a document ID."""
    # Retrieve doc_001 (should return chunk_a and chunk_b)
    chunks = retriever.retrieve_by_document("doc_001")
    assert len(chunks) == 2
    chunk_ids = {c.chunk_id for c in chunks}
    assert "chunk_a" in chunk_ids
    assert "chunk_b" in chunk_ids

    # Retrieve doc_002 (should return chunk_c)
    chunks_doc2 = search_service.get_document_chunks("doc_002")
    assert len(chunks_doc2) == 1
    assert chunks_doc2[0].chunk_id == "chunk_c"
