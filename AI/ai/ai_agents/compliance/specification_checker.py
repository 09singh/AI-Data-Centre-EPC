from typing import List, Dict, Any
from loguru import logger

from ai.config.settings import settings
from ai.ai_agents.intelligence_models import ComplianceResult, ComplianceIssue
from ai.ai_agents.compliance.interfaces import SpecificationCheckerInterface
from ai.knowledge_engine.models import RetrievedChunk


class SpecificationChecker(SpecificationCheckerInterface):
    """Audits text chunks for presence and validation of defined checklist specifications."""

    def check_specifications(
        self,
        chunks: List[RetrievedChunk],
        requirements: List[Dict[str, Any]]
    ) -> ComplianceResult:
        """Audits text chunks for presence and validation of defined checklist specifications.

        Args:
            chunks: List of document text chunks.
            requirements: Requirement rule dicts.

        Returns:
            ComplianceResult: Compiled compliance scorecard.
        """
        logger.info("Auditing specifications requirements against {} text chunks", len(chunks))

        full_text = " ".join(c.text for c in chunks).lower()
        issues = []
        evaluated = len(requirements)
        passed_count = 0

        for req in requirements:
            req_id = req.get("id", "REQ_UNKNOWN")
            name = req.get("name", "Requirement")
            keywords = req.get("keywords", [])
            severity = req.get("severity", "Medium")
            description = req.get("description", "")

            # Check if keywords are matched in content text
            match = any(kw.lower() in full_text for kw in keywords)
            if match:
                passed_count += 1
                logger.debug("Requirement '{}' matched and verified compliant.", name)
            else:
                logger.warning("Requirement '{}' NOT found in document context.", name)
                issues.append(ComplianceIssue(
                    issue_id=f"ISS_MISS_{req_id}",
                    requirement_name=name,
                    status="missing",
                    section_heading=req.get("section_heading"),
                    severity=severity,
                    description=f"Mandatory requirement '{name}' was not detected in project documentation: {description}",
                    suggested_fix=req.get("suggested_fix", f"Insert detailed design specifications defining {name}.")
                ))

        compliance_score = (passed_count / evaluated) if evaluated > 0 else 1.0
        is_compliant = compliance_score >= settings.COMPLIANCE_THRESHOLD

        doc_name = chunks[0].file_name if chunks else "General Specification Document"

        return ComplianceResult(
            specification_name=doc_name,
            compliance_score=round(compliance_score, 4),
            is_compliant=is_compliant,
            issues_detected=issues,
            evaluated_count=evaluated
        )
