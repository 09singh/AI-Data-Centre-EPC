from typing import List, Optional
from loguru import logger

from ai.ai_agents.models import PromptContext, ConversationMessage
from ai.ai_agents.prompt_manager.interfaces import PromptBuilderInterface, PromptLoaderInterface
from ai.ai_agents.prompt_manager.prompt_loader import PromptLoader
from ai.ai_agents.prompt_manager.system_prompts import USER_TEMPLATE


class PromptBuilder(PromptBuilderInterface):
    """Assembles prompt contexts dynamically by compiling templates, contexts, and histories."""

    def __init__(self, loader: Optional[PromptLoaderInterface] = None):
        """Initializes prompt builder.

        Args:
            loader: Optional custom PromptLoader.
        """
        self.loader = loader or PromptLoader()

    def build_prompts(
        self,
        query: str,
        query_type: str,
        context_str: str,
        history: List[ConversationMessage]
    ) -> PromptContext:
        """Assembles prompt parts into system and user text templates.

        Args:
            query: User search query.
            query_type: Classified type of query (e.g. compliance, risk).
            context_str: reference context blocks.
            history: Session history.

        Returns:
            PromptContext: System and user prompts.
        """
        logger.debug("Building prompts for query type: '{}'", query_type)

        # 1. Load System Prompt based on classification type
        system_prompt = self.loader.load_template(query_type)

        # 2. Format conversation history
        history_lines = []
        if not history:
            history_str = "No prior conversation history."
        else:
            for msg in history:
                role_label = "User" if msg.role == "user" else "AI"
                history_lines.append(f"{role_label}: {msg.content}")
            history_str = "\n".join(history_lines)

        # 3. Format context
        ctx_str = context_str if context_str.strip() else "No relevant project documents were found."

        # 4. Assemble User Prompt using the standard user template
        user_prompt = USER_TEMPLATE.format(
            history_str=history_str,
            context_str=ctx_str,
            query=query
        )

        return PromptContext(
            system_prompt=system_prompt,
            user_prompt=user_prompt
        )
