from abc import ABC, abstractmethod
from typing import List
from ai.ai_agents.models import ConversationMessage


class ConversationMemoryInterface(ABC):
    """Interface managing conversation message history and sliding limits for a session."""

    @abstractmethod
    def add_message(self, role: str, content: str) -> None:
        """Appends a new message (user/assistant) to the conversation history.

        Args:
            role: sender role ('user', 'assistant').
            content: text content of message.
        """
        pass

    @abstractmethod
    def get_messages(self) -> List[ConversationMessage]:
        """Retrieves messages, applying sliding window truncations if needed.

        Returns:
            List[ConversationMessage]: Truncated list of history messages.
        """
        pass

    @abstractmethod
    def clear(self) -> None:
        """Clears all conversation messages from memory."""
        pass


class SessionManagerInterface(ABC):
    """Interface managing multiple session memories."""

    @abstractmethod
    def get_session_memory(self, session_id: str) -> ConversationMemoryInterface:
        """Retrieves or creates the conversation memory object linked to a session ID.

        Args:
            session_id: Unique identifier.

        Returns:
            ConversationMemoryInterface: Memory handler.
        """
        pass

    @abstractmethod
    def delete_session(self, session_id: str) -> None:
        """Purges conversation memory and session keys.

        Args:
            session_id: Unique session ID to clear.
        """
        pass
