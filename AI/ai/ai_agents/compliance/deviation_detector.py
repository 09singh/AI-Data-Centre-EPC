from typing import List, Dict, Any
from loguru import logger

from ai.ai_agents.intelligence_models import ComplianceIssue
from ai.ai_agents.compliance.interfaces import DeviationDetectorInterface
from ai.knowledge_engine.models import RetrievedChunk


class DeviationDetector(DeviationDetectorInterface):
    """Scans document text for design or engineering deviations against standards."""

    def detect_deviations(
        self,
        chunks: List[RetrievedChunk],
        standards: List[Dict[str, Any]]
    ) -> List[ComplianceIssue]:
        """Detects design deviations or structural clashes from standard references.

        Args:
            chunks: Processed engineering texts.
            standards: Reference standards.

        Returns:
            List[ComplianceIssue]: Detected deviations list.
        """
        logger.info("Running deviation checks against {} standards", len(standards))
        full_text = " ".join(c.text for c in chunks).lower()
        issues = []

        for std in standards:
            std_id = std.get("id", "STD_UNKNOWN")
            name = std.get("name", "Standard")
            keywords = std.get("keywords", [])
            forbidden = std.get("forbidden", [])
            severity = std.get("severity", "High")

            # Check if this standard's topic is mentioned
            topic_present = any(kw.lower() in full_text for kw in keywords)
            if topic_present:
                for bad_word in forbidden:
                    if bad_word.lower() in full_text:
                        logger.warning("Deviation violation detected for standard '{}': forbidden term '{}' found.", name, bad_word)
                        issues.append(ComplianceIssue(
                            issue_id=f"ISS_DEV_{std_id}",
                            requirement_name=name,
                            status="violation",
                            section_heading=std.get("section_heading"),
                            severity=severity,
                            description=(
                                f"Design deviation detected from '{name}': document contains non-compliant configuration "
                                f"reference '{bad_word}' which violates safety guidelines."
                            ),
                            suggested_fix=std.get("suggested_fix", f"Replace the '{bad_word}' config with a certified compliant design.")
                        ))

        return issues
