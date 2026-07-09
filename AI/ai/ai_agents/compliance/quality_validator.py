from typing import List, Dict, Any
from loguru import logger

from ai.config.settings import settings
from ai.ai_agents.intelligence_models import QualityMetrics
from ai.ai_agents.compliance.interfaces import QualityValidatorInterface
from ai.knowledge_engine.models import RetrievedChunk


class QualityValidator(QualityValidatorInterface):
    """Validates that mandatory fields, sections, and metadata items exist."""

    def validate_quality(
        self,
        document_id: str,
        metadata: Dict[str, Any],
        chunks: List[RetrievedChunk]
    ) -> QualityMetrics:
        """Validates that mandatory fields, sections, and metadata items exist.

        Args:
            document_id: Target document ID.
            metadata: Properties dictionary.
            chunks: text chunks lists.

        Returns:
            QualityMetrics: Quality metrics scorecard.
        """
        logger.info("Executing document quality completeness checks for ID: '{}'", document_id)

        # 1. Metadata attributes check
        required_meta_keys = ["author", "created_at", "file_name", "title"]
        missing_keys = [k for k in required_meta_keys if not metadata.get(k)]
        has_mandatory_metadata = len(missing_keys) == 0

        # 2. Mandatory sections check
        required_headings = ["Scope", "Introduction", "Technical Specification"]
        full_text = " ".join(c.text for c in chunks).lower()
        missing_sections = [h for h in required_headings if h.lower() not in full_text]

        # 3. Completeness scoring calculations
        total_checks = len(required_meta_keys) + len(required_headings)
        passed_checks = (
            (len(required_meta_keys) - len(missing_keys)) +
            (len(required_headings) - len(missing_sections))
        )

        completeness_score = passed_checks / total_checks if total_checks > 0 else 1.0
        is_quality_valid = completeness_score >= settings.QUALITY_THRESHOLD

        return QualityMetrics(
            document_id=document_id,
            completeness_score=round(completeness_score, 4),
            has_mandatory_metadata=has_mandatory_metadata,
            missing_sections=missing_sections,
            missing_metadata_keys=missing_keys,
            is_quality_valid=is_quality_valid
        )
