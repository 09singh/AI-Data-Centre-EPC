from typing import List, Dict, Any, Optional
from loguru import logger

from ai.config.settings import settings
from ai.ai_agents.intelligence_models import ComplianceResult, ComplianceIssue
from ai.ai_agents.compliance.interfaces import (
    ComplianceEngineInterface,
    SpecificationCheckerInterface,
    DeviationDetectorInterface,
)
from ai.ai_agents.compliance.specification_checker import SpecificationChecker
from ai.ai_agents.compliance.deviation_detector import DeviationDetector
from ai.knowledge_engine.models import RetrievedChunk


class ComplianceEngine(ComplianceEngineInterface):
    """Facade orchestrating checker, detector, and quality validator workflows."""

    def __init__(
        self,
        checker: Optional[SpecificationCheckerInterface] = None,
        detector: Optional[DeviationDetectorInterface] = None
    ):
        """Initializes the compliance engine.

        Args:
            checker: Specification checker strategy.
            detector: Deviation detector strategy.
        """
        self.checker = checker or SpecificationChecker()
        self.detector = detector or DeviationDetector()

        # Load dynamic rules from in-code dictionaries (mocking database/file loads)
        self.default_requirements = [
            {
                "id": "REQ_001",
                "name": "Chilled Water Cooling Loop",
                "keywords": ["chilled water", "cooling loop", "liquid cooling"],
                "severity": "Critical",
                "description": "Requires liquid-based chilled loops for high-density racks.",
                "suggested_fix": "Add chilled water pipeline specs to the mechanical design."
            },
            {
                "id": "REQ_002",
                "name": "UPS Lithium-Ion Venting",
                "keywords": ["lithium-ion", "ventilation", "exhaust", "vent"],
                "severity": "High",
                "description": "Requires dedicated emergency ventilation in UPS battery rooms.",
                "suggested_fix": "Incorporate emergency exhaust fans mapped to the battery room zone."
            },
            {
                "id": "REQ_003",
                "name": "Double Fire Barrier Wall",
                "keywords": ["fire barrier", "fire wall", "2-hour", "double fire"],
                "severity": "Critical",
                "description": "Requires a minimum of 2-hour fire barriers separating transformer bays.",
                "suggested_fix": "Update construction detail panels specifying 2-hour rated gypsum boards."
            }
        ]

        self.default_standards = [
            {
                "id": "STD_001",
                "name": "Cooling Loop System Standard",
                "keywords": ["cooling", "chilled water"],
                "forbidden": ["dx system", "direct expansion", "air cooling only"],
                "severity": "High",
                "suggested_fix": "Redesign cooling loop utilizing liquid chilled water chillers."
            },
            {
                "id": "STD_002",
                "name": "UPS Battery Safety Standard",
                "keywords": ["ups", "battery", "lithium-ion"],
                "forbidden": ["no ventilation", "unvented", "sealed room"],
                "severity": "Critical",
                "suggested_fix": "Add HVAC compliance venting details to the room profile."
            }
        ]

    def evaluate(self, chunks: List[RetrievedChunk]) -> ComplianceResult:
        """Runs overall compliance evaluations over a collection of document chunks.

        Args:
            chunks: Search reference document chunks.

        Returns:
            ComplianceResult: Compiled project compliance result.
        """
        logger.info("Compliance engine running evaluations for {} chunks.", len(chunks))

        # 1. Audit core specifications requirements
        spec_result = self.checker.check_specifications(chunks, self.default_requirements)

        # 2. Detect deviations violations
        deviations = self.detector.detect_deviations(chunks, self.default_standards)

        # 3. Merge compliance issues list
        all_issues = list(spec_result.issues_detected) + deviations

        # 4. Re-calculate compliance scoring with deviations included
        total_evals = spec_result.evaluated_count + len(self.default_standards)
        # Each violation counts as a deduction
        passed_evals = spec_result.evaluated_count - len(spec_result.issues_detected)
        # Deduct deviations if they occurred
        passed_evals = max(0, passed_evals - len(deviations))

        compliance_score = (passed_evals / total_evals) if total_evals > 0 else 1.0
        is_compliant = compliance_score >= settings.COMPLIANCE_THRESHOLD

        logger.info("Compliance evaluation complete. Compliance score: {:.4f} | Compliant: {}", compliance_score, is_compliant)

        return ComplianceResult(
            specification_name=spec_result.specification_name,
            compliance_score=round(compliance_score, 4),
            is_compliant=is_compliant,
            issues_detected=all_issues,
            evaluated_count=total_evals
        )
