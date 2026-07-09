from pathlib import Path
from typing import Optional
from loguru import logger

from ai.ai_agents.prompt_manager.interfaces import PromptLoaderInterface
from ai.ai_agents.prompt_manager.system_prompts import (
    DEFAULT_SYSTEM_PROMPT,
    COMPLIANCE_SYSTEM_PROMPT,
    RISK_SYSTEM_PROMPT,
)


class PromptLoader(PromptLoaderInterface):
    """Loads prompt templates from the project's 'prompts/' directory with local fallbacks."""

    def __init__(self, prompts_dir: Optional[Path] = None):
        """Initializes the loader.

        Args:
            prompts_dir: Optional override for prompt templates folder.
        """
        # Resolve root prompts directory
        if prompts_dir:
            self.prompts_dir = prompts_dir
        else:
            self.prompts_dir = Path(__file__).resolve().parent.parent.parent / "prompts"

    def load_template(self, template_name: str) -> str:
        """Loads the target prompt template file. Falls back to static dictionary if not found.

        Args:
            template_name: Name of target template.

        Returns:
            str: Raw template content.
        """
        name = template_name.lower().strip()
        filename = f"{name}.txt"
        file_path = self.prompts_dir / filename

        # 1. Try to read from filesystem
        if file_path.exists():
            try:
                logger.debug("Loading prompt template file from: {}", file_path)
                return file_path.read_text(encoding="utf-8").strip()
            except Exception as e:
                logger.warning("Failed to read prompt template '{}' at {}: {}. Using fallback.", name, file_path, str(e))

        # 2. Fallback to static prompts registry
        logger.debug("Prompt template file '{}' not found at {}. Using static fallback.", filename, self.prompts_dir)
        if "compliance" in name:
            return COMPLIANCE_SYSTEM_PROMPT
        elif "risk" in name or "schedule" in name or "procurement" in name:
            return RISK_SYSTEM_PROMPT
        else:
            return DEFAULT_SYSTEM_PROMPT
