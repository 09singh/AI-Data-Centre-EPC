from abc import ABC, abstractmethod
from typing import List, Dict, Any
from ai.ai_agents.intelligence_models import ComplianceResult, ComplianceIssue, QualityMetrics
from ai.knowledge_engine.models import RetrievedChunk


class SpecificationCheckerInterface(ABC):
    """Interface to audit documents against specific EPC requirements."""

    @abstractmethod
    def check_specifications(
        self,
        chunks: List[RetrievedChunk],
        requirements: List[Dict[str, Any]]
    ) -> ComplianceResult:
        """Audits text chunks for presence and validation of defined checklist specifications.

        Args:
            chunks: List of document text chunks.
            requirements: Requirement rule dicts (e.g. name, threshold, keywords).

        Returns:
            ComplianceResult: The parsed evaluation result.
        """
        pass


class DeviationDetectorInterface(ABC):
    """Interface to scan text and detect design or engineering deviations."""

    @abstractmethod
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
        pass


class QualityValidatorInterface(ABC):
    """Interface to validate completeness and metadata quality of documents."""

    @abstractmethod
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
            QualityMetrics: Document quality scorecard.
        """
        pass


class ComplianceEngineInterface(ABC):
    """Facade orchestrating checker, detector, and quality validator workflows."""

    @abstractmethod
    def evaluate(self, chunks: List[RetrievedChunk]) -> ComplianceResult:
        """Runs overall compliance evaluations over a collection of document chunks.

        Args:
            chunks: Search reference document chunks.

        Returns:
            ComplianceResult: Compiled project compliance result.
        """
        pass
