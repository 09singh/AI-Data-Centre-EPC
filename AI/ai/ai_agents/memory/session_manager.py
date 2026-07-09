from typing import Dict, Optional
from loguru import logger

from ai.ai_agents.memory.interfaces import SessionManagerInterface, ConversationMemoryInterface
from ai.ai_agents.memory.conversation_memory import InMemoryConversationMemory


class InMemorySessionManager(SessionManagerInterface):
    """Manages multi-session conversation memories.

    Current implementation resides in RAM. To upgrade to distributed Redis caching,
    subclass or modify this client, changing dict lookups to Redis key operations.
    """

    def __init__(self):
        """Initializes session dictionary."""
        self._sessions: Dict[str, ConversationMemoryInterface] = {}

    def get_session_memory(self, session_id: str) -> ConversationMemoryInterface:
        """Retrieves or instantiates a conversation memory buffer for a session.

        Args:
            session_id: Unique string.

        Returns:
            ConversationMemoryInterface: Memory stream.
        """
        if session_id not in self._sessions:
            logger.info("Initializing new conversation memory session segment: '{}'", session_id)
            self._sessions[session_id] = InMemoryConversationMemory()
        return self._sessions[session_id]

    def delete_session(self, session_id: str) -> None:
        """Removes session keys and history.

        Args:
            session_id: Target session ID.
        """
        logger.info("Purging conversation session: '{}'", session_id)
        if session_id in self._sessions:
            self._sessions[session_id].clear()
            del self._sessions[session_id]
