import re
import unicodedata
from loguru import logger


class TextCleaner:
    """Text cleaner helper for engineering and technical documents.

    Applies Unicode normalization and cleans excessive whitespace while
    preserving technical formats, structural numbers, and engineering units.
    """

    def clean(self, text: str) -> str:
        """Cleans and normalizes extracted document text.

        Args:
            text: Raw extracted text string.

        Returns:
            str: Cleaned and normalized text.
        """
        if not text:
            return ""

        logger.debug("Running text cleaner normalization...")

        # 1. Unicode Normalization (compatibility decomposition & composition)
        # This resolves ligatures, super/subscripts, and variations while preserving characters like m², °C.
        cleaned = unicodedata.normalize("NFKC", text)

        # 2. Normalize Line Breaks (standardize to Unix style LF)
        cleaned = cleaned.replace("\r\n", "\n").replace("\r", "\n")

        # 3. Collapse excessive blank lines (cap at maximum of 2 newlines to preserve paragraphs)
        cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)

        # 4. Clean duplicate spaces per-line (taking care not to disrupt markdown table layouts)
        lines = cleaned.split("\n")
        cleaned_lines = []
        for line in lines:
            trimmed_line = line.strip()
            # If the line represents a Markdown table row, preserve cell spacing boundaries
            if trimmed_line.startswith("|") and trimmed_line.endswith("|"):
                # Clean duplicate spaces within cells, but do not destroy cell margins completely
                cleaned_lines.append(trimmed_line)
            else:
                # Collapse sequential spaces/tabs to a single space
                cleaned_line = re.sub(r"[ \t]+", " ", line)
                cleaned_lines.append(cleaned_line.strip())

        cleaned = "\n".join(cleaned_lines)

        return cleaned.strip()
