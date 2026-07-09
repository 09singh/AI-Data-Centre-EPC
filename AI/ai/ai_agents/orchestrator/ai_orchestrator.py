import time
from typing import Optional
from loguru import logger

from ai.config.settings import settings
from ai.ai_agents.models import AIRequest, AIResponse, ResponseMetadata
from ai.ai_agents.orchestrator.interfaces import AIOrchestratorInterface
from ai.ai_agents.orchestrator.exceptions import OrchestratorError
from ai.ai_agents.query_classifier.classifier import QueryClassifier
from ai.ai_agents.memory.session_manager import InMemorySessionManager
from ai.ai_agents.memory.interfaces import SessionManagerInterface
from ai.ai_agents.context_builder.context_builder import ContextBuilder
from ai.ai_agents.context_builder.interfaces import ContextBuilderInterface
from ai.ai_agents.prompt_manager.prompt_builder import PromptBuilder
from ai.ai_agents.prompt_manager.interfaces import PromptBuilderInterface
from ai.ai_agents.llm.llm_factory import LLMFactory
from ai.ai_agents.llm.interfaces import LLMClientInterface
from ai.knowledge_engine.embeddings.embedding_service import EmbeddingService
from ai.knowledge_engine.retriever.search_service import SearchService


class AIOrchestrator(AIOrchestratorInterface):
    """The central orchestrator pipeline of the AI Project Brain."""

    def __init__(
        self,
        classifier: Optional[QueryClassifier] = None,
        session_manager: Optional[SessionManagerInterface] = None,
        embedding_service: Optional[EmbeddingService] = None,
        search_service: Optional[SearchService] = None,
        context_builder: Optional[ContextBuilderInterface] = None,
        prompt_builder: Optional[PromptBuilderInterface] = None,
        llm_client: Optional[LLMClientInterface] = None
    ):
        """Initializes the orchestrator.

        Args:
            classifier: Query classification strategy.
            session_manager: Conversation history buffer storage manager.
            embedding_service: Text embedding vector generator service.
            search_service: Knowledge base similarity search manager.
            context_builder: Prompt context compiler strategy.
            prompt_builder: Prompt template formatter.
            llm_client: Provider client wrapper.
        """
        self.classifier = classifier or QueryClassifier()
        self.session_manager = session_manager or InMemorySessionManager()
        self.embedding_service = embedding_service or EmbeddingService()
        self.search_service = search_service or SearchService()
        self.context_builder = context_builder or ContextBuilder()
        self.prompt_builder = prompt_builder or PromptBuilder()
        self.llm_client = llm_client or LLMFactory.get_client("groq")

    def process_query(self, request: AIRequest) -> AIResponse:
        """Processes incoming user query from start to finish.

        Args:
            request: Structured request parameter packet.

        Returns:
            AIResponse: Unified response packet.

        Raises:
            OrchestratorError: If any pipeline stages crash.
        """
        logger.info("AI Project Brain processing query: '{}' | Session: '{}'", request.query, request.session_id)
        start_time = time.time()

        try:
            # 1. Classify the user query
            query_type = self.classifier.classify(request.query)

            # 2. Retrieve Conversation Memory History
            memory = self.session_manager.get_session_memory(request.session_id)
            history = memory.get_messages()

            # 3. Call Knowledge Engine Search
            logger.debug("Generating query text embeddings coordinates...")
            query_vector = self.embedding_service.embed_text(request.query)

            logger.debug("Executing similarity retrieval search...")
            search_start = time.time()
            search_res = self.search_service.search(
                query_text=request.query,
                query_vector=query_vector,
                filters=request.filters
            )
            search_latency = time.time() - search_start

            # 4. Aggregated Context Building
            context_str = self.context_builder.build_context(
                chunks=search_res.results,
                query=request.query,
                history=history
            )

            # 5. Prompt Formatting
            prompt_context = self.prompt_builder.build_prompts(
                query=request.query,
                query_type=query_type.value,
                context_str=context_str,
                history=history
            )

            # 6. Execute LLM Query
            messages = [
                {"role": "system", "content": prompt_context.system_prompt},
                {"role": "user", "content": prompt_context.user_prompt}
            ]

            logger.debug("Executing LLM generation chat request...")
            llm_start = time.time()
            llm_res = self.llm_client.generate(messages)
            llm_latency = time.time() - llm_start

            # 7. Update Conversation Memory
            memory.add_message(role="user", content=request.query)
            memory.add_message(role="assistant", content=llm_res.content)

            # 8. Compile Metadata Metrics and Final Output Response
            total_latency = time.time() - start_time

            metadata = ResponseMetadata(
                query_type=query_type.value,
                latency_seconds=round(total_latency, 4),
                search_latency_seconds=round(search_latency, 4),
                llm_latency_seconds=round(llm_latency, 4),
                token_usage=llm_res.token_usage,
                model_name=llm_res.model_name
            )

            logger.info(
                "AI Project Brain successfully generated response for type '{}'. Total Latency: {:.4f}s",
                query_type.value,
                total_latency
            )

            return AIResponse(
                query=request.query,
                response=llm_res.content,
                query_type=query_type.value,
                metadata=metadata
            )

        except Exception as e:
            logger.error("AI project brain orchestrator failed pipeline execution: {}", str(e))
            raise OrchestratorError(f"AI project brain pipeline execution failed: {str(e)}") from e
