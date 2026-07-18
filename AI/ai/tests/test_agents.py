import pytest
from unittest.mock import MagicMock, patch

from ai.config.settings import settings
settings.GROQ_API_KEY = "mock_key"
settings.RERANKER_TYPE = "identity"

from ai.ai_agents.models import AIRequest, ConversationMessage
from ai.ai_agents.query_classifier.classifier import QueryClassifier
from ai.ai_agents.query_classifier.query_types import QueryType
from ai.ai_agents.memory.conversation_memory import InMemoryConversationMemory
from ai.ai_agents.memory.session_manager import InMemorySessionManager
from ai.ai_agents.context_builder.context_builder import ContextBuilder
from ai.ai_agents.context_builder.context_formatter import ContextFormatter
from ai.ai_agents.prompt_manager.prompt_builder import PromptBuilder
from ai.ai_agents.llm.groq_client import GroqClient
from ai.ai_agents.llm.exceptions import GroqError
from ai.ai_agents.orchestrator.ai_orchestrator import AIOrchestrator
from ai.ai_agents.orchestrator.exceptions import OrchestratorError
from ai.knowledge_engine.models import RetrievedChunk, SearchResult, SearchMetadata


@pytest.fixture
def mock_groq():
    """Mocks the Groq API client chat completions endpoint."""
    with patch("ai.ai_agents.llm.groq_client.Groq") as mock_class:
        mock_instance = MagicMock()
        mock_class.return_value = mock_instance

        # Mock the chat completions creation return value
        mock_completion = MagicMock()
        mock_completion.id = "chatcmpl_mock_123"
        mock_completion.choices = [MagicMock()]
        mock_completion.choices[0].message.content = "This design complies with the 2-hour fire wall standard."

        mock_usage = MagicMock()
        mock_usage.prompt_tokens = 80
        mock_usage.completion_tokens = 40
        mock_usage.total_tokens = 120
        mock_completion.usage = mock_usage

        mock_instance.chat.completions.create.return_value = mock_completion
        yield mock_instance


def test_query_classifier():
    """Verifies that QueryClassifier parses domain-specific keyword tokens correctly."""
    classifier = QueryClassifier()

    assert classifier.classify("Is the layout compliance checklist updated?") == QueryType.COMPLIANCE
    assert classifier.classify("What schedule delays occurred in phase 2?") == QueryType.SCHEDULE
    assert classifier.classify("When is the vendor equipment delivery date?") == QueryType.PROCUREMENT
    assert classifier.classify("Is the generator commissioning test plan ready?") == QueryType.COMMISSIONING
    assert classifier.classify("What is the cost overrun risk?") == QueryType.RISK
    assert classifier.classify("Can you suggest best practices for safety?") == QueryType.RECOMMENDATION
    assert classifier.classify("Find pdf specs files") == QueryType.DOCUMENT_SEARCH
    assert classifier.classify("Hello, how are you?") == QueryType.GENERAL


def test_conversation_memory():
    """Verifies memory inserts, caps, and sliding window trims."""
    memory = InMemoryConversationMemory(memory_window=3)

    memory.add_message("user", "Hello")
    memory.add_message("assistant", "Hi there")
    memory.add_message("user", "Question 1")
    memory.add_message("assistant", "Answer 1")

    messages = memory.get_messages()
    # capped at last 3 messages
    assert len(messages) == 3
    assert messages[0].content == "Hi there"
    assert messages[2].content == "Answer 1"

    memory.clear()
    assert len(memory.get_messages()) == 0


def test_session_manager():
    """Verifies that SessionManager isolates sessions and handles deletes."""
    manager = InMemorySessionManager()
    mem1 = manager.get_session_memory("session_abc")
    mem2 = manager.get_session_memory("session_xyz")

    assert mem1 is not mem2

    mem1.add_message("user", "Test message")
    manager.delete_session("session_abc")

    # Re-retrieval creates a new blank memory
    assert len(manager.get_session_memory("session_abc").get_messages()) == 0


def test_context_builder():
    """Verifies that ContextBuilder joins and formats retrieved vector chunks."""
    formatter = ContextFormatter()
    builder = ContextBuilder(formatter=formatter, max_context_chars=100)

    chunks = [
        RetrievedChunk(
            chunk_id="chunk_1",
            text="First reference text.",
            score=0.92,
            page_numbers=[2],
            file_name="spec_a.pdf"
        )
    ]

    context_str = builder.build_context(chunks, "query", [])
    assert "spec_a.pdf" in context_str
    assert "First reference text." in context_str

    # Test Truncation Check
    large_chunks = [
        RetrievedChunk(
            chunk_id="chunk_large",
            text="A" * 150,
            score=0.95,
            page_numbers=[1]
        )
    ]
    truncated_str = builder.build_context(large_chunks, "query", [])
    assert "[Context truncated for length limitations]" in truncated_str


def test_prompt_builder():
    """Verifies PromptBuilder loads domain templates and formats inputs."""
    builder = PromptBuilder()

    ctx = builder.build_prompts(
        query="Auditing checklist",
        query_type="Compliance Query",
        context_str="Fire wall rating: 2 hours.",
        history=[ConversationMessage(role="user", content="Hi", timestamp="1")]
    )

    assert "Fire wall rating" in ctx.user_prompt
    assert "Auditing checklist" in ctx.user_prompt
    assert "User: Hi" in ctx.user_prompt
    assert "Compliance Auditing Agent" in ctx.system_prompt


def test_groq_client_generate(mock_groq):
    """Verifies Groq Client fetches response text, model labels, and token counts."""
    client = GroqClient(api_key="mock_key")
    res = client.generate([{"role": "user", "content": "Test"}])

    assert res.content == "This design complies with the 2-hour fire wall standard."
    assert res.token_usage.total_tokens == 120
    assert res.model_name in {"openai/gpt-oss-20b", "openai/gpt-oss-120b"}
    assert mock_groq.chat.completions.create.called


def test_groq_client_error(mock_groq):
    """Verifies Groq Client throws GroqError on completions failures."""
    mock_groq.chat.completions.create.side_effect = Exception("API connection timeout")
    client = GroqClient(api_key="mock_key")

    with pytest.raises(GroqError):
        client.generate([{"role": "user", "content": "Test"}])


def test_groq_client_falls_back_to_alternate_model_when_primary_is_unavailable():
    """Verifies Groq Client retries with an alternate model when the primary one is unavailable."""
    with patch("ai.ai_agents.llm.groq_client.Groq") as mock_class:
        mock_instance = MagicMock()
        mock_class.return_value = mock_instance

        mock_failure = Exception("The model `openai/gpt-oss-20b` does not exist")
        mock_completion = MagicMock()
        mock_completion.id = "chatcmpl_fallback"
        mock_completion.choices = [MagicMock()]
        mock_completion.choices[0].message.content = "Fallback response"

        mock_usage = MagicMock()
        mock_usage.prompt_tokens = 10
        mock_usage.completion_tokens = 20
        mock_usage.total_tokens = 30
        mock_completion.usage = mock_usage

        mock_instance.chat.completions.create.side_effect = [mock_failure, mock_completion]

        client = GroqClient(api_key="mock_key")
        response = client.generate([{"role": "user", "content": "Test"}])

        assert response.content == "Fallback response"
        assert mock_instance.chat.completions.create.call_count == 2
        assert mock_instance.chat.completions.create.call_args_list[0].kwargs["model"] != mock_instance.chat.completions.create.call_args_list[1].kwargs["model"]


def test_orchestrator_pipeline(mock_groq):
    """Verifies the AI Orchestrator executes classifications, retrieves, LLM calls, and updates."""
    # Mocking SearchService and EmbeddingService
    mock_embeddings = MagicMock()
    mock_embeddings.embed_text.return_value = [0.1, 0.2, 0.3]

    mock_search = MagicMock()
    mock_search.search.return_value = SearchResult(
        query_text="comply with safety",
        results=[
            RetrievedChunk(
                chunk_id="chunk_1",
                text="Safety requires 2 hours fire protection.",
                score=0.9,
                page_numbers=[1],
                file_name="safety.pdf"
            )
        ],
        citations=[],
        metadata=SearchMetadata(query_latency_seconds=0.01, top_k=1, score_threshold=0.5)
    )

    orchestrator = AIOrchestrator(
        embedding_service=mock_embeddings,
        search_service=mock_search
    )

    req = AIRequest(query="Is layout compliance okay?", session_id="test_session")
    res = orchestrator.process_query(req)

    assert res.query == "Is layout compliance okay?"
    assert res.query_type == "Compliance Query"
    assert "2-hour fire wall" in res.response
    assert res.metadata.token_usage.total_tokens == 120

    # Verify conversation history updated
    memory = orchestrator.session_manager.get_session_memory("test_session")
    msgs = memory.get_messages()
    assert len(msgs) == 2
    assert msgs[0].role == "user"
    assert msgs[1].role == "assistant"


def test_orchestrator_errors():
    """Verifies Orchestrator throws OrchestratorError if internal operations crash."""
    mock_embeddings = MagicMock()
    mock_embeddings.embed_text.side_effect = Exception("Embeddings generation failure")

    orchestrator = AIOrchestrator(embedding_service=mock_embeddings)

    req = AIRequest(query="Fail query", session_id="test_session")
    with pytest.raises(OrchestratorError):
        orchestrator.process_query(req)
