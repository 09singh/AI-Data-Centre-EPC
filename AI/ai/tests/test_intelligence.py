import pytest

from ai.config.settings import settings
settings.COMPLIANCE_THRESHOLD = 0.8
settings.QUALITY_THRESHOLD = 0.75
settings.RECOMMENDATION_LIMIT = 2

from ai.ai_agents.intelligence_models import (
    ComplianceIssue,
    ComplianceResult,
    Recommendation,
    RuleEvaluation,
    QualityMetrics,
)
from ai.ai_agents.compliance.specification_checker import SpecificationChecker
from ai.ai_agents.compliance.deviation_detector import DeviationDetector
from ai.ai_agents.compliance.quality_validator import QualityValidator
from ai.ai_agents.compliance.compliance_engine import ComplianceEngine
from ai.ai_agents.compliance.exceptions import ComplianceError, ValidationError
from ai.ai_agents.recommendation.priority_engine import PriorityEngine
from ai.ai_agents.recommendation.action_generator import ActionGenerator
from ai.ai_agents.recommendation.recommendation_engine import RecommendationEngine
from ai.ai_agents.recommendation.exceptions import RecommendationError
from ai.ai_agents.rule_engine.rule_evaluator import RuleEvaluator
from ai.ai_agents.rule_engine.epc_rules import DEFAULT_EPC_RULES
from ai.ai_agents.rule_engine.exceptions import RuleEngineError
from ai.ai_agents.insights.summary_builder import SummaryBuilder
from ai.ai_agents.insights.insight_engine import InsightEngine
from ai.ai_agents.insights.exceptions import InsightError
from ai.knowledge_engine.models import RetrievedChunk


@pytest.fixture
def sample_chunks():
    """Generates standard retrieved text chunks representing compliant data hall setups."""
    return [
        RetrievedChunk(
            chunk_id="chk_1",
            text="Technical Specification: Data Hall A utilizes a chilled water cooling loop with N+1 chiller redundancy.",
            score=0.9,
            page_numbers=[1],
            file_name="mecanical_specs.pdf"
        ),
        RetrievedChunk(
            chunk_id="chk_2",
            text="Scope: The emergency UPS battery rooms incorporate active exhaust ventilation.",
            score=0.85,
            page_numbers=[2],
            file_name="mecanical_specs.pdf"
        ),
        RetrievedChunk(
            chunk_id="chk_3",
            text="Introduction: Transformer bays are separated by double fire walls rated for 2-hour protection.",
            score=0.95,
            page_numbers=[3],
            file_name="mecanical_specs.pdf"
        )
    ]


def test_specification_checker(sample_chunks):
    """Verifies specification checker matches keywords and scores compliance."""
    checker = SpecificationChecker()
    reqs = [
        {"id": "R1", "name": "Cooling Loop", "keywords": ["chilled water"], "severity": "Critical"},
        {"id": "R2", "name": "Venting Safety", "keywords": ["ventilation"], "severity": "High"},
        {"id": "R3", "name": "Missing Tech Check", "keywords": ["diesel generator"], "severity": "Medium"}
    ]

    res = checker.check_specifications(sample_chunks, reqs)
    assert isinstance(res, ComplianceResult)
    # 2 out of 3 matched -> 0.6667
    assert res.compliance_score == pytest.approx(0.6667, abs=1e-4)
    assert not res.is_compliant
    assert len(res.issues_detected) == 1
    assert res.issues_detected[0].status == "missing"
    assert res.issues_detected[0].requirement_name == "Missing Tech Check"


def test_deviation_detector(sample_chunks):
    """Verifies deviation detector captures forbidden configuration keywords."""
    detector = DeviationDetector()
    standards = [
        {
            "id": "S1",
            "name": "Cooling Limits",
            "keywords": ["cooling"],
            "forbidden": ["dx system", "air cooling only"],
            "severity": "High"
        }
    ]

    # Compliant case (no forbidden words)
    issues_clean = detector.detect_deviations(sample_chunks, standards)
    assert len(issues_clean) == 0

    # Non-compliant chunk case
    bad_chunks = sample_chunks + [
        RetrievedChunk(
            chunk_id="chk_bad",
            text="Alternate hall designs utilize a direct expansion dx system.",
            score=0.8,
            page_numbers=[4],
            file_name="mechanical_specs.pdf"
        )
    ]
    issues_bad = detector.detect_deviations(bad_chunks, standards)
    assert len(issues_bad) == 1
    assert issues_bad[0].status == "violation"
    assert "dx system" in issues_bad[0].description


def test_quality_validator(sample_chunks):
    """Verifies quality validator validates metadata completeness."""
    validator = QualityValidator()

    # Fully populated metadata
    metadata_ok = {
        "author": "John Doe",
        "created_at": "2026-07-07",
        "file_name": "specs.pdf",
        "title": "Data Centre Mechanical Specs"
    }
    metrics_ok = validator.validate_quality("doc_1", metadata_ok, sample_chunks)
    assert metrics_ok.has_mandatory_metadata
    assert len(metrics_ok.missing_sections) == 0
    assert metrics_ok.completeness_score == 1.0
    assert metrics_ok.is_quality_valid

    # Missing metadata and mandatory sections
    metadata_bad = {"author": "John Doe"}
    metrics_bad = validator.validate_quality("doc_2", metadata_bad, [
        RetrievedChunk(chunk_id="1", text="No headings present here.", score=0.9)
    ])
    assert not metrics_bad.has_mandatory_metadata
    assert "file_name" in metrics_bad.missing_metadata_keys
    assert "Scope" in metrics_bad.missing_sections
    assert metrics_bad.completeness_score < 0.5
    assert not metrics_bad.is_quality_valid


def test_recommendation_prioritization():
    """Verifies priority engine and action generator map priorities correctly."""
    priority_engine = PriorityEngine()
    assert priority_engine.determine_priority("Safety", "Critical") == "Critical"
    assert priority_engine.determine_priority("Safety", "High") == "Critical"
    assert priority_engine.determine_priority("Engineering", "High") == "High"
    assert priority_engine.determine_priority("Engineering", "Medium") == "Medium"

    # Action generation from issue
    issue = ComplianceIssue(
        issue_id="ISS_1",
        requirement_name="Emergency Venting",
        status="missing",
        severity="High",
        description="UPS battery ventilation missing.",
        suggested_fix="Install exhaust fans."
    )
    generator = ActionGenerator(priority_engine=priority_engine)
    rec = generator.generate_action(issue)
    assert rec.category == "Safety"
    assert rec.priority == "Critical"
    assert rec.suggested_action == "Install exhaust fans."


def test_recommendation_engine():
    """Verifies recommendation engine prioritises and caps actions according to limit configurations."""
    engine = RecommendationEngine()
    issues = [
        ComplianceIssue(issue_id="ISS_1", requirement_name="UPS Venting", status="missing", severity="Medium", description="UPS vent missing"),
        ComplianceIssue(issue_id="ISS_2", requirement_name="Chilled Water", status="missing", severity="Critical", description="Chilled loop missing"),
        ComplianceIssue(issue_id="ISS_3", requirement_name="Fire Wall", status="missing", severity="High", description="Fire barrier missing")
    ]

    recs = engine.generate_recommendations(issues)
    # Capped at RECOMMENDATION_LIMIT (settings.RECOMMENDATION_LIMIT = 2)
    assert len(recs) == 2
    # Critical should be first
    assert recs[0].severity == "Critical"
    assert recs[1].severity == "High"


def test_rule_evaluator(sample_chunks):
    """Verifies rule evaluator assesses EPC engineering checklists."""
    evaluator = RuleEvaluator()
    evals = evaluator.evaluate_rules(sample_chunks)

    assert len(evals) == 3
    # Compliance check text matches all default rule keywords (redundancy, elevation, cable tray)
    # Verify client redundant cooling rules
    redundancy_rule = next(e for e in evals if "Redundant" in e.rule_name)
    assert redundancy_rule.passed
    assert redundancy_rule.relevance_score > 0.0


def test_insight_report_health(sample_chunks):
    """Verifies insight engine aggregates health score stats and executive summary."""
    engine = InsightEngine()
    metadata = {
        "author": "John Doe",
        "created_at": "2026-07-07",
        "file_name": "specs.pdf",
        "title": "Specs Audit"
    }

    # Append a non-compliant chunk to trigger deviation issues and recommendations
    bad_chunks = sample_chunks + [
        RetrievedChunk(
            chunk_id="chk_bad",
            text="Alternate hall designs utilize a direct expansion dx system.",
            score=0.8,
            page_numbers=[4],
            file_name="mechanical_specs.pdf"
        )
    ]

    report = engine.generate_report("doc_001", metadata, bad_chunks)
    assert report.project_health.overall_health_score > 0.2
    assert len(report.compliance_summaries) == 1
    assert len(report.quality_summaries) == 1
    assert "Audit" in report.executive_summary
    assert len(report.recommendations) > 0


def test_compliance_exceptions():
    """Asserts default exception handles raise correctly."""
    with pytest.raises(ComplianceError):
        raise ComplianceError("Generic compliance error")

    with pytest.raises(ValidationError):
        raise ValidationError("Completeness error")

    with pytest.raises(RecommendationError):
        raise RecommendationError("Priority error")

    with pytest.raises(RuleEngineError):
        raise RuleEngineError("EPC rule error")

    with pytest.raises(InsightError):
        raise InsightError("Insights engine failure")
