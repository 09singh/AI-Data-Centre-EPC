from datetime import datetime
from typing import List, Optional
from loguru import logger

from ai.config.settings import settings
from ai.ai_agents.models import ConversationMessage
from ai.ai_agents.memory.interfaces import ConversationMemoryInterface


class InMemoryConversationMemory(ConversationMemoryInterface):
    """In-memory sliding window implementation of ConversationMemoryInterface.

    Caps history lengths using a sliding window context size.
    """

    def __init__(self, memory_window: Optional[int] = None):
        """Initializes conversation memory.

        Args:
            memory_window: Optional window cap. If None, loaded from settings.
        """
        self.messages: List[ConversationMessage] = []
        self.memory_window = memory_window or settings.MEMORY_WINDOW

    def add_message(self, role: str, content: str) -> None:
        """Appends user or AI messages to history.

        Args:
            role: Sender role ('user', 'assistant').
            content: Message string.
        """
        logger.debug("Recording message to memory log. Role: '{}' | Content size: {}", role, len(content))
        msg = ConversationMessage(
            role=role,
            content=content,
            timestamp=datetime.utcnow().isoformat() + "Z"
        )
        self.messages.append(msg)

    def get_messages(self) -> List[ConversationMessage]:
        """Retrieves messages cap-truncated by sliding window rules."""
        if len(self.messages) <= self.memory_window:
            return self.messages
        logger.debug("Applying memory window trimming to last {} messages.", self.memory_window)
        return self.messages[-self.memory_window:]

    def clear(self) -> None:
        """Clears memory lists."""
        logger.info("Clearing conversation memory history logs.")
        self.messages.clear()
