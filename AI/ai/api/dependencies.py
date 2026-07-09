from ai.config.settings import settings
from ai.knowledge_engine.embeddings.embedding_service import EmbeddingService
from ai.knowledge_engine.knowledge_base.knowledge_service import KnowledgeService
from ai.knowledge_engine.retriever.search_service import SearchService
from ai.knowledge_engine.vector_store.vector_service import QdrantVectorService
from ai.knowledge_engine.vector_store.collection_manager import QdrantCollectionManager
from ai.knowledge_engine.vector_store.qdrant_client import QdrantConnectionManager
from ai.knowledge_engine.knowledge_base.document_registry import InMemoryDocumentRegistry
from ai.knowledge_engine.knowledge_base.metadata_store import InMemoryMetadataStore
from ai.ai_agents.orchestrator.ai_orchestrator import AIOrchestrator
from ai.ai_agents.compliance.compliance_engine import ComplianceEngine
from ai.ai_agents.compliance.risk_engine import RiskEngine
from ai.ai_agents.recommendation.recommendation_engine import RecommendationEngine
from ai.ai_agents.rule_engine.rule_evaluator import RuleEvaluator
from ai.ai_agents.insights.insight_engine import InsightEngine


# Instantiated singletons cached at module load to optimize resource allocation
_connection_manager = QdrantConnectionManager()
_collection_manager = QdrantCollectionManager(_connection_manager)
_vector_service = QdrantVectorService(_connection_manager)
_embedding_service = EmbeddingService()

_document_registry = InMemoryDocumentRegistry()
_metadata_store = InMemoryMetadataStore()
_knowledge_service = KnowledgeService(
    registry=_document_registry,
    metadata_store=_metadata_store
)

_search_service = SearchService(
    retriever=None,
    reranker=None,
    citation_builder=None
)

_ai_orchestrator = AIOrchestrator(
    classifier=None,
    session_manager=None,
    embedding_service=_embedding_service,
    search_service=_search_service,
    context_builder=None,
    prompt_builder=None,
    llm_client=None
)

_compliance_engine = ComplianceEngine()
_risk_engine = RiskEngine(_compliance_engine)
_recommendation_engine = RecommendationEngine()
_rule_evaluator = RuleEvaluator()
_insight_engine = InsightEngine(
    compliance_engine=_compliance_engine,
    quality_validator=None,
    recommendation_engine=_recommendation_engine,
    summary_builder=None
)


def get_settings():
    """Dependency provider for global Settings."""
    return settings


def get_connection_manager() -> QdrantConnectionManager:
    """Dependency provider for Qdrant client connection managers."""
    return _connection_manager


def get_collection_manager() -> QdrantCollectionManager:
    """Dependency provider for Qdrant collections managers."""
    return _collection_manager


def get_vector_service() -> QdrantVectorService:
    """Dependency provider for Qdrant vector CRUD operations."""
    return _vector_service


def get_embedding_service() -> EmbeddingService:
    """Dependency provider for local text embedding models."""
    return _embedding_service


def get_knowledge_service() -> KnowledgeService:
    """Dependency provider for KB document registry and chunk mappings."""
    return _knowledge_service


def get_search_service() -> SearchService:
    """Dependency provider for similarity vector search and citation engines."""
    return _search_service


def get_ai_orchestrator() -> AIOrchestrator:
    """Dependency provider for conversation agents orchestrator."""
    return _ai_orchestrator


def get_compliance_engine() -> ComplianceEngine:
    """Dependency provider for specifications checklist checks."""
    return _compliance_engine


def get_risk_engine() -> RiskEngine:
    """Dependency provider for safety and schedule risk evaluations."""
    return _risk_engine


def get_recommendation_engine() -> RecommendationEngine:
    """Dependency provider for prioritizing action items."""
    return _recommendation_engine


def get_rule_evaluator() -> RuleEvaluator:
    """Dependency provider for custom project rules checkpoints evaluations."""
    return _rule_evaluator


def get_insight_engine() -> InsightEngine:
    """Dependency provider for aggregated reports and project health metrics."""
    return _insight_engine
