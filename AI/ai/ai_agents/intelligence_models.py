from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ComplianceIssue(BaseModel):
    """Represents a specific compliance discrepancy or violation identified."""

    issue_id: str = Field(
        ...,
        description="Unique identifier code of the compliance issue"
    )
    requirement_name: str = Field(
        ...,
        description="Target requirement criteria name or code reference"
    )
    status: str = Field(
        ...,
        description="Current status ('violation', 'missing', 'compliant')"
    )
    section_heading: Optional[str] = Field(
        default=None,
        description="Source document hierarchy section reference"
    )
    severity: str = Field(
        ...,
        description="Severity classification rating (e.g. 'Critical', 'High', 'Medium')"
    )
    description: str = Field(
        ...,
        description="Detailed explanation of non-conformance details"
    )
    suggested_fix: Optional[str] = Field(
        default=None,
        description="Proposed corrective action fix details"
    )


class ComplianceResult(BaseModel):
    """Aggregate result representing standard compliance checking summaries."""

    specification_name: str = Field(
        ...,
        description="Name of the audited specification document"
    )
    compliance_score: float = Field(
        ...,
        description="Calculated ratio percentage score (0.0 to 1.0)"
    )
    is_compliant: bool = Field(
        ...,
        description="Boolean indicating conformance above threshold limit"
    )
    issues_detected: List[ComplianceIssue] = Field(
        default_factory=list,
        description="Detailed list of discrepancies found"
    )
    evaluated_count: int = Field(
        ...,
        description="Total count of requirement items assessed"
    )


class Recommendation(BaseModel):
    """Intelligent recommendation entry detailing actions, priorities, and reasons."""

    recommendation_id: str = Field(
        ...,
        description="Unique code mapping identifier"
    )
    category: str = Field(
        ...,
        description="Recommendation category (e.g. 'Engineering', 'Procurement', 'Quality')"
    )
    priority: str = Field(
        ...,
        description="Priority class rating ('Critical', 'High', 'Medium', 'Low')"
    )
    severity: str = Field(
        ...,
        description="Associated risk severity indicator"
    )
    reason: str = Field(
        ...,
        description="Root cause reason explaining why this recommendation was logged"
    )
    suggested_action: str = Field(
        ...,
        description="Actionable step instructions for correction"
    )
    custom_metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Metadata dictionary payloads"
    )


class RuleEvaluation(BaseModel):
    """Result logging evaluation checklist parameters from EPC rule files."""

    rule_id: str = Field(
        ...,
        description="Identifier mapping the EPC rule"
    )
    rule_name: str = Field(
        ...,
        description="Brief summary name of target rule"
    )
    category: str = Field(
        ...,
        description="Category group tag ('Client', 'Project', 'Company')"
    )
    passed: bool = Field(
        ...,
        description="Boolean indicating checklist evaluation status"
    )
    relevance_score: float = Field(
        ...,
        description="Match confidence or relevancy scale metric"
    )
    message: str = Field(
        ...,
        description="Evaluation description summary"
    )


class QualityMetrics(BaseModel):
    """Document completeness metrics tracking metadata features and section checks."""

    document_id: str = Field(
        ...,
        description="Audit document code identifier"
    )
    completeness_score: float = Field(
        ...,
        description="Ratio completeness rating (0.0 to 1.0)"
    )
    has_mandatory_metadata: bool = Field(
        ...,
        description="True if required system columns are populated"
    )
    missing_sections: List[str] = Field(
        default_factory=list,
        description="Missing headers detected in document"
    )
    missing_metadata_keys: List[str] = Field(
        default_factory=list,
        description="Missing properties key list"
    )
    is_quality_valid: bool = Field(
        ...,
        description="Quality above threshold rating"
    )


class ProjectHealth(BaseModel):
    """Unified metrics tracking overall project safety and conformance indicators."""

    overall_health_score: float = Field(
        ...,
        description="Global normalized health rating (0.0 to 1.0)"
    )
    compliance_health_score: float = Field(
        ...,
        description="Normalized rating of compliant checklist items"
    )
    quality_health_score: float = Field(
        ...,
        description="Normalized score reflecting overall document quality"
    )
    total_active_critical_issues: int = Field(
        ...,
        description="Count of unresolved critical severity issues"
    )


class InsightReport(BaseModel):
    """Central summary report compiling health, compliance, quality, and recommendations."""

    report_id: str = Field(
        ...,
        description="Unique generated report index"
    )
    project_health: ProjectHealth = Field(
        ...,
        description="Aggregated health overview details"
    )
    compliance_summaries: List[ComplianceResult] = Field(
        ...,
        description="Evaluated compliance checker summaries list"
    )
    quality_summaries: List[QualityMetrics] = Field(
        ...,
        description="Quality validation checks list"
    )
    recommendations: List[Recommendation] = Field(
        ...,
        description="List of actionable recommendations generated"
    )
    executive_summary: str = Field(
        ...,
        description="Natural text overview summarizing findings"
    )
    generated_at: str = Field(
        ...,
        description="ISO 8601 generation timestamp"
    )
