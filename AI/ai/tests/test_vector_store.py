import pytest
from ai.config.settings import settings

# Force in-memory database target configuration for testing
settings.QDRANT_URL = ":memory:"
settings.COLLECTION_NAME = "test_collection"

from ai.knowledge_engine.vector_store.qdrant_client import QdrantConnectionManager
from ai.knowledge_engine.vector_store.collection_manager import QdrantCollectionManager
from ai.knowledge_engine.vector_store.vector_service import QdrantVectorService
from ai.knowledge_engine.embeddings.embedding_service import VectorEmbedding
from ai.knowledge_engine.knowledge_base.knowledge_service import KnowledgeService
from ai.document_processing.models import DocumentMetadata, DocumentChunk


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
def knowledge_service():
    """Retrieves document register service instance."""
    return KnowledgeService()


def test_qdrant_client_connection(connection_manager):
    """Verifies connection manager connection and health diagnostics checks."""
    client = connection_manager.connect()
    assert client is not None
    assert connection_manager.health_check() is True


def test_collection_manager(collection_manager):
    """Verifies collection creation, deletion, existence checks, and listings."""
    col_name = "test_col"
    if collection_manager.collection_exists(col_name):
        collection_manager.delete_collection(col_name)

    assert collection_manager.collection_exists(col_name) is False

    # Create collection
    created = collection_manager.create_collection(col_name, vector_size=384, distance_metric="Cosine")
    assert created is True
    assert collection_manager.collection_exists(col_name) is True

    # List collections
    cols = collection_manager.list_collections()
    assert col_name in cols

    # Delete collection
    deleted = collection_manager.delete_collection(col_name)
    assert deleted is True
    assert collection_manager.collection_exists(col_name) is False


def test_vector_service_operations(collection_manager, vector_service):
    """Verifies vector upserts, retrieval queries, overrides/updates, and deletes."""
    col_name = "vector_test_col"
    collection_manager.recreate_collection(col_name, vector_size=384, distance_metric="Cosine")

    # Create dummy embeddings as unit vectors to prevent Cosine metric scaling differences
    vec1 = [0.0] * 384
    vec1[0] = 1.0
    vec2 = [0.0] * 384
    vec2[1] = 1.0

    embeddings = [
        VectorEmbedding(
            chunk_id="chk_01",
            embedding=vec1,
            metadata_reference={"section_heading": "Intro", "page_numbers": [1]}
        ),
        VectorEmbedding(
            chunk_id="chk_02",
            embedding=vec2,
            metadata_reference={"section_heading": "Scope", "page_numbers": [2]}
        )
    ]

    # Insert batch vectors
    inserted = vector_service.insert_vectors(col_name, embeddings)
    assert inserted is True

    # Fetch vector and verify payload metadata
    record = vector_service.fetch_vector_by_id(col_name, "chk_01")
    assert record is not None
    assert record["payload"]["section_heading"] == "Intro"
    assert len(record["vector"]) == 384
    assert record["vector"][0] == pytest.approx(1.0)

    # Update/re-upsert vector values (using a negative unit vector)
    vec1_updated = [0.0] * 384
    vec1_updated[0] = -1.0

    updated_embeddings = [
        VectorEmbedding(
            chunk_id="chk_01",
            embedding=vec1_updated,
            metadata_reference={"section_heading": "Intro_Updated", "page_numbers": [1]}
        )
    ]
    vector_service.insert_vectors(col_name, updated_embeddings)
    record_updated = vector_service.fetch_vector_by_id(col_name, "chk_01")
    assert record_updated["payload"]["section_heading"] == "Intro_Updated"
    assert record_updated["vector"][0] == pytest.approx(-1.0)


    # Delete vector
    deleted = vector_service.delete_vectors(col_name, ["chk_01"])
    assert deleted is True
    assert vector_service.fetch_vector_by_id(col_name, "chk_01") is None
    assert vector_service.fetch_vector_by_id(col_name, "chk_02") is not None


def test_knowledge_base_operations(knowledge_service):
    """Verifies file-level and chunk-level metadata registrations and cascading deletes."""
    doc_id = "doc_ref_101"
    metadata = DocumentMetadata(
        file_name="design_specifications.pdf",
        file_extension=".pdf",
        file_size_bytes=2048,
        total_pages=3,
        processing_duration_seconds=0.25,
        processing_timestamp="2026-07-07T22:00:00Z"
    )
    chunks = [
        DocumentChunk(
            chunk_id="doc_ref_101_c0",
            text="Sample engineering description text content",
            page_numbers=[1],
            section_heading="Design Parameters"
        )
    ]

    # Register document profile
    registered = knowledge_service.register_processed_document(doc_id, metadata, chunks)
    assert registered is True

    # Check listings
    docs = knowledge_service.list_documents()
    assert doc_id in docs

    # Fetch document profile
    profile = knowledge_service.get_document_profile(doc_id)
    assert profile is not None
    assert profile["status"] == "completed"
    assert profile["total_chunks"] == 1
    assert profile["metadata"]["file_name"] == "design_specifications.pdf"

    # Fetch child chunk metadata
    chunk_meta = knowledge_service.metadata_store.get_chunk_metadata("doc_ref_101_c0")
    assert chunk_meta is not None
    assert chunk_meta["section_heading"] == "Design Parameters"
    assert chunk_meta["document_id"] == doc_id

    # Purge document
    removed = knowledge_service.remove_document(doc_id)
    assert removed is True

    # Verify purge cascaded to child structures
    assert knowledge_service.get_document_profile(doc_id) is None
    assert knowledge_service.metadata_store.get_chunk_metadata("doc_ref_101_c0") is None
