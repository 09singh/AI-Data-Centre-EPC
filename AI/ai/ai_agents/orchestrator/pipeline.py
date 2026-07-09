from ai.ai_agents.orchestrator.ai_orchestrator import AIOrchestrator


def bootstrap_orchestrator() -> AIOrchestrator:
    """Bootstraps and configures a default ready-to-use AIOrchestrator instance.

    Resolves default internal components (QueryClassifier, InMemorySessionManager,
    EmbeddingService, SearchService, ContextBuilder, PromptBuilder, and GroqClient).

    Returns:
        AIOrchestrator: Bootstrapped orchestrator facade.
    """
    return AIOrchestrator()
