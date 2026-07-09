from abc import ABC, abstractmethod
from typing import List, Dict, Any
from ai.ai_agents.models import PromptContext, ConversationMessage


class PromptLoaderInterface(ABC):
    """Interface to load prompt templates from external file stores or fallbacks."""

    @abstractmethod
    def load_template(self, template_name: str) -> str:
        """Loads the prompt string matching the template name.

        Args:
            template_name: Target prompt template name (e.g. 'compliance').

        Returns:
            str: Raw prompt template text.
        """
        pass


class PromptBuilderInterface(ABC):
    """Interface to dynamically assemble contexts, histories, and queries into PromptContexts."""

    @abstractmethod
    def build_prompts(
        self,
        query: str,
        query_type: str,
        context_str: str,
        history: List[ConversationMessage]
    ) -> PromptContext:
        """Assembles prompt parts into system and user text templates.

        Args:
            query: The user text search string.
            query_type: Classified query type.
            context_str: Cleaned vector search reference context string.
            history: Recent conversation messages list.

        Returns:
            PromptContext: Unified container mapping LLM system and user parameters.
        """
        pass
