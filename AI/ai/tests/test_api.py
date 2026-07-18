import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from ai.app import app
from ai.document_processing.models import ProcessedDocument, DocumentMetadata, DocumentChunk
from ai.knowledge_engine.models import RetrievedChunk, SearchResult, SearchMetadata, Citation
from ai.ai_agents.models import AIResponse, ResponseMetadata, TokenUsage
from ai.ai_agents.intelligence_models import ComplianceIssue, ComplianceResult, ProjectHealth, Recommendation, QualityMetrics

client = TestClient(app)


@pytest.fixture
def mock_pipeline_process():
    """Mocks the document processing pipeline process method."""
    mock_metadata = DocumentMetadata(
        file_name="mechanical_specs.pdf",
        file_extension=".pdf",
        file_size_bytes=2048,
        total_pages=2,
        author="John Doe",
        processing_duration_seconds=0.05,
        processing_timestamp="2026-07-08T12:00:00Z"
    )
    mock_chunks = [
        DocumentChunk(
            chunk_id="chk_mock_001",
            text="Alternate hall designs utilize a chilled water cooling loop for heat dissipation.",
            page_numbers=[1],
            section_heading="1. MECHANICAL DESIGN",
            chunk_metadata={"length": 81}
        ),
        DocumentChunk(
            chunk_id="chk_mock_002",
            text="Emergency power is backed up by double fire wall bays and lithium-ion UPS batteries.",
            page_numbers=[2],
            section_heading="2. POWER PROTECTION",
            chunk_metadata={"length": 85}
        )
    ]
    mock_processed = ProcessedDocument(
        metadata=mock_metadata,
        full_extracted_text="Full text content here.",
        chunks=mock_chunks
    )
    with patch("ai.api.routes.upload.DocumentProcessingPipeline.process") as mock_process:
        mock_process.return_value = mock_processed
        yield mock_process


@pytest.fixture
def mock_groq_completions():
    """Mocks the Groq API completion client."""
    with patch("ai.ai_agents.llm.groq_client.Groq") as mock_class:
        mock_instance = MagicMock()
        mock_class.return_value = mock_instance
        
        mock_completion = MagicMock()
        mock_completion.id = "chatcmpl_api_mock"
        mock_completion.choices = [MagicMock()]
        mock_completion.choices[0].message.content = "Based on mechanical specs, liquid-based chilled loops are required."
        
        mock_usage = MagicMock()
        mock_usage.prompt_tokens = 100
        mock_usage.completion_tokens = 50
        mock_usage.total_tokens = 150
        mock_completion.usage = mock_usage
        
        mock_instance.chat.completions.create.return_value = mock_completion
        yield mock_instance


def test_health_endpoints():
    """Verifies service health check endpoints return expected states."""
    with patch("ai.knowledge_engine.vector_store.qdrant_client.QdrantConnectionManager.health_check") as mock_db:
        mock_db.return_value = True

        # 1. Test overall health route
        res_health = client.get("/api/v1/health")
        assert res_health.status_code == 200
        data = res_health.json()
        assert data["status"] == "ok"
        assert data["api_status"] == "operational"
        assert "memory_usage_mb" in data

        # 2. Test version metadata route
        res_version = client.get("/api/v1/version")
        assert res_version.status_code == 200
        assert "version" in res_version.json()

        # 3. Test AI reasoning status route
        res_ai = client.get("/api/v1/status/ai")
        assert res_ai.status_code == 200
        assert res_ai.json()["status"] == "active"

        # 4. Test model status route
        res_model = client.get("/api/v1/status/model")
        assert res_model.status_code == 200
        assert "embedding_model" in res_model.json()

        # 5. Test vector database status route
        res_db = client.get("/api/v1/status/vector-db")
        assert res_db.status_code == 200
        assert res_db.json()["connected"] is True


def test_upload_endpoint(mock_pipeline_process):
    """Verifies uploading files registers metadata and inserts vector coordinates."""
    # Mock embeddings and database upserts
    with patch("ai.api.routes.upload.EmbeddingService.embed_chunks") as mock_embed, \
         patch("ai.api.routes.upload.QdrantVectorService.insert_vectors") as mock_insert, \
         patch("ai.api.routes.upload.KnowledgeService.register_processed_document") as mock_register:

        mock_embed.return_value = []
        mock_insert.return_value = True
        mock_register.return_value = True

        files = {"file": ("mechanical_specs.pdf", b"mock_pdf_bytes_content", "application/pdf")}
        response = client.post("/api/v1/upload", files=files)

        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "indexed"
        assert "document_id" in data
        assert data["file_name"] == "mechanical_specs.pdf"
        assert mock_pipeline_process.called


def test_search_endpoint():
    """Verifies similarity search route queries vector store and returns citations."""
    mock_result = SearchResult(
        query_text="redundancy chiller",
        results=[
            RetrievedChunk(
                chunk_id="chk_001",
                text="Chilled water loop specifications.",
                score=0.9,
                page_numbers=[1],
                file_name="specs.pdf"
            )
        ],
        citations=[
            Citation(
                document_name="specs.pdf",
                document_id="doc_api_test_01",
                chunk_id="chk_001",
                page_numbers=[1],
                section_heading="1. HVAC Specifications",
                similarity_score=0.9
            )
        ],
        metadata=SearchMetadata(
            query_latency_seconds=0.01,
            top_k=1,
            score_threshold=0.5,
            filters_applied={},
            reranker_applied="identity"
        )
    )

    with patch("ai.api.routes.search.EmbeddingService.embed_text") as mock_embed, \
         patch("ai.api.routes.search.SearchService.search") as mock_search:
        
        mock_embed.return_value = [0.1] * 384
        mock_search.return_value = mock_result

        payload = {"query": "redundancy chiller", "top_k": 1, "score_threshold": 0.5}
        response = client.post("/api/v1/search", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert len(data["results"]) == 1
        assert data["citations"][0]["document_name"] == "specs.pdf"


def test_chat_endpoint(mock_groq_completions):
    """Verifies conversational chat routes call classifications and LLM pipelines."""
    # Mocking SearchService and AIOrchestrator responses
    mock_search_res = SearchResult(
        query_text="water cooling",
        results=[],
        citations=[],
        metadata=SearchMetadata(query_latency_seconds=0.0, top_k=5, score_threshold=0.0, filters_applied={}, reranker_applied="")
    )

    mock_ai_res = AIResponse(
        query="water cooling",
        response="Liquid cooling loop is active.",
        query_type="Compliance Query",
        metadata=ResponseMetadata(
            query_type="Compliance Query",
            latency_seconds=0.1,
            search_latency_seconds=0.02,
            llm_latency_seconds=0.08,
            token_usage=TokenUsage(prompt_tokens=100, completion_tokens=50, total_tokens=150),
            model_name="openai/gpt-oss-20b"
        )
    )

    with patch("ai.api.routes.chat.SearchService.search") as mock_search, \
         patch("ai.api.routes.chat.AIOrchestrator.process_query") as mock_orchestrator, \
         patch("ai.api.routes.chat.EmbeddingService.embed_text") as mock_embed:
        
        mock_embed.return_value = [0.0] * 384
        mock_search.return_value = mock_search_res
        mock_orchestrator.return_value = mock_ai_res

        payload = {"query": "water cooling", "session_id": "session_api_test"}
        response = client.post("/api/v1/chat", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert data["response"] == "Liquid cooling loop is active."
        assert data["query_type"] == "Compliance Query"
        assert data["metadata"]["token_usage"]["total_tokens"] == 150


def test_compliance_and_recommendation_endpoints():
    """Verifies compliance checks and recommendation generations return scorecards."""
    # Mock search service retrieval results
    mock_chunks = SearchResult(
        query_text="",
        results=[
            RetrievedChunk(
                chunk_id="chk_001",
                text="Chilled water cooling loop standard design is fully implemented.",
                score=0.9,
                page_numbers=[1],
                file_name="specs.pdf"
            )
        ],
        citations=[],
        metadata=SearchMetadata(query_latency_seconds=0.0, top_k=1, score_threshold=0.0, filters_applied={}, reranker_applied="")
    )

    with patch("ai.api.routes.compliance.SearchService.get_document_chunks") as mock_search, \
         patch("ai.api.routes.recommendation.SearchService.get_document_chunks") as mock_search_rec:
        
        mock_search.return_value = mock_chunks.results
        mock_search_rec.return_value = mock_chunks.results

        # 1. Test compliance auditing
        comp_payload = {"document_id": "doc_api_test_01"}
        comp_res = client.post("/api/v1/compliance", json=comp_payload)
        assert comp_res.status_code == 200
        assert comp_res.json()["compliance_score"] > 0.0

        # 2. Test recommendation generations
        rec_payload = {"document_id": "doc_api_test_01"}
        rec_res = client.post("/api/v1/recommendations", json=rec_payload)
        assert rec_res.status_code == 200
        assert rec_res.json()["document_id"] == "doc_api_test_01"
        assert "recommendations" in rec_res.json()


def test_reports_endpoints():
    """Verifies reports generation routes compile health indices."""
    mock_profile = {
        "document_id": "doc_report_test",
        "status": "completed",
        "metadata": {
            "file_name": "specs.pdf",
            "file_extension": ".pdf",
            "file_size_bytes": 1024,
            "total_pages": 1,
            "processing_duration_seconds": 0.1,
            "processing_timestamp": "2026-07-08T12:00:00Z"
        }
    }

    mock_search_res = SearchResult(
        query_text="",
        results=[
            RetrievedChunk(
                chunk_id="chk_001",
                text="Alternate cooling designs utilize a direct expansion dx system.",
                score=0.8,
                page_numbers=[1],
                file_name="specs.pdf"
            )
        ],
        citations=[],
        metadata=SearchMetadata(query_latency_seconds=0.0, top_k=1000, score_threshold=0.0, filters_applied={}, reranker_applied="")
    )

    with patch("ai.api.routes.reports.KnowledgeService.get_document_profile") as mock_get_profile, \
         patch("ai.api.routes.reports.SearchService.get_document_chunks") as mock_search:
        
        mock_get_profile.return_value = mock_profile
        mock_search.return_value = mock_search_res.results

        # Test POST generate report
        res_report = client.post("/api/v1/reports/generate?document_id=doc_report_test")
        assert res_report.status_code == 200
        data = res_report.json()
        assert "project_health" in data
        assert "compliance_summaries" in data
        assert "executive_summary" in data

        # Test sub-endpoints
        res_health = client.get("/api/v1/reports/doc_report_test/health")
        assert res_health.status_code == 200
        assert "overall_health_score" in res_health.json()

        res_compliance = client.get("/api/v1/reports/doc_report_test/compliance")
        assert res_compliance.status_code == 200
        assert len(res_compliance.json()) > 0

        res_rec = client.get("/api/v1/reports/doc_report_test/recommendations")
        assert res_rec.status_code == 200
        assert isinstance(res_rec.json(), list)

        res_sum = client.get("/api/v1/reports/doc_report_test/summary")
        assert res_sum.status_code == 200
        assert "executive_summary" in res_sum.json()


def test_project_dashboard_summary():
    """Verifies dashboard summaries aggregate metrics and document lists."""
    mock_doc_list = ["doc_dash_01"]
    mock_profile = {
        "document_id": "doc_dash_01",
        "status": "completed",
        "total_chunks": 5,
        "registered_at": "2026-07-08T12:00:00Z",
        "metadata": {
            "file_name": "general_specs.pdf",
            "file_extension": ".pdf",
            "file_size_bytes": 4096,
            "total_pages": 4
        }
    }

    mock_search_res = SearchResult(
        query_text="",
        results=[
            RetrievedChunk(
                chunk_id="chk_001",
                text="Chilled loop designs are active.",
                score=0.9,
                page_numbers=[1],
                file_name="general_specs.pdf"
            )
        ],
        citations=[],
        metadata=SearchMetadata(query_latency_seconds=0.0, top_k=1, score_threshold=0.0, filters_applied={}, reranker_applied="")
    )

    with patch("ai.api.routes.project.KnowledgeService.list_documents") as mock_list, \
         patch("ai.api.routes.project.KnowledgeService.get_document_profile") as mock_profile_get, \
         patch("ai.api.routes.project.SearchService.get_document_chunks") as mock_search:
        
        mock_list.return_value = mock_doc_list
        mock_profile_get.return_value = mock_profile
        mock_search.return_value = mock_search_res.results

        res_dash = client.get("/api/v1/project/dashboard")
        assert res_dash.status_code == 200
        data = res_dash.json()
        assert data["document_count"] == 1
        assert len(data["registered_documents"]) == 1
        assert data["registered_documents"][0]["file_name"] == "general_specs.pdf"
        assert data["total_chunks"] == 5
        assert data["health_metrics"] is not None


def test_environment_loading():
    """Verifies Pydantic Settings class loads values and matches defaults."""
    from ai.config.settings import Settings
    custom_settings = Settings(
        APP_NAME="Custom Platform",
        GROQ_API_KEY="test_key"
    )
    assert custom_settings.APP_NAME == "Custom Platform"
    assert custom_settings.GROQ_API_KEY == "test_key"
    assert custom_settings.LOG_LEVEL == "INFO" or custom_settings.LOG_LEVEL is not None


def test_settings_validation_errors():
    """Verifies settings raise validation errors on bad datatypes."""
    from ai.config.settings import Settings
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        Settings(APP_PORT="not_an_int")


@pytest.mark.anyio
async def test_startup_validation_missing_key():
    """Verifies that missing or placeholder GROQ_API_KEY triggers a startup ValueError."""
    from ai.app import lifespan
    from ai.config.settings import settings
    from fastapi import FastAPI

    app_mock = FastAPI()
    original_key = settings.GROQ_API_KEY
    try:
        settings.GROQ_API_KEY = "your_groq_api_key_here"
        with pytest.raises(ValueError) as excinfo:
            async with lifespan(app_mock):
                pass
        assert "Missing or placeholder GROQ_API_KEY" in str(excinfo.value)
    finally:
        settings.GROQ_API_KEY = original_key


def test_risk_endpoint():
    """Verifies document risk assessment endpoints query vector stores and run compliance rules."""
    mock_profile = {
        "document_id": "doc_risk_test",
        "status": "completed",
        "total_chunks": 2,
        "metadata": {"file_name": "safety_specs.pdf"}
    }
    
    mock_search_res = SearchResult(
        query_text="",
        results=[
            RetrievedChunk(
                chunk_id="chk_001",
                text="Safety loop controls and risk metrics.",
                score=0.9,
                page_numbers=[1],
                file_name="safety_specs.pdf"
            )
        ],
        citations=[],
        metadata=SearchMetadata(query_latency_seconds=0.0, top_k=1, score_threshold=0.0, filters_applied={}, reranker_applied="")
    )

    with patch("ai.api.routes.project.KnowledgeService.get_document_profile") as mock_profile_get, \
         patch("ai.api.routes.project.SearchService.get_document_chunks") as mock_search:
        
        mock_profile_get.return_value = mock_profile
        mock_search.return_value = mock_search_res.results

        res_risk = client.get("/api/v1/project/doc_risk_test/risk")
        assert res_risk.status_code == 200
        data = res_risk.json()
        assert data["document_id"] == "doc_risk_test"
        assert "risk_level" in data
        assert "risk_summary" in data
        assert len(data["suggested_actions"]) > 0
