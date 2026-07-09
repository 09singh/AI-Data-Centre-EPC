from typing import List, Optional
from loguru import logger

from ai.ai_agents.intelligence_models import RuleEvaluation
from ai.ai_agents.rule_engine.interfaces import RuleEvaluatorInterface
from ai.ai_agents.rule_engine.epc_rules import DEFAULT_EPC_RULES
from ai.knowledge_engine.models import RetrievedChunk


class RuleEvaluator(RuleEvaluatorInterface):
    """Evaluates document chunks against default or custom checklist rules."""

    def __init__(self, rules: Optional[List[dict]] = None):
        """Initializes the evaluator with rules.

        Args:
            rules: Optional custom rules list. If None, default rules are loaded.
        """
        self.rules = rules if rules is not None else DEFAULT_EPC_RULES

    def evaluate_rules(
        self,
        chunks: List[RetrievedChunk],
        category: Optional[str] = None
    ) -> List[RuleEvaluation]:
        """Audits document chunks against loaded rule constraints.

        Args:
            chunks: Search reference document chunks.
            category: Optional rule category filter.

        Returns:
            List[RuleEvaluation]: Rule checkpoints list detailing pass/fail status.
        """
        logger.info("Evaluating {} rules against {} text chunks", len(self.rules), len(chunks))
        full_text = " ".join(c.text for c in chunks).lower()
        evaluations = []

        for rule in self.rules:
            rule_cat = rule.get("category", "General")

            # Apply optional category filter
            if category and rule_cat.lower() != category.lower():
                continue

            rule_id = rule.get("id", "RULE_UNKNOWN")
            name = rule.get("name", "EPC Rule Check")
            keywords = rule.get("keywords", [])
            forbidden = rule.get("forbidden", [])

            # 1. Relevance check: does the rule apply to this document segment?
            relevance_matches = [kw for kw in keywords if kw.lower() in full_text]
            relevance_score = len(relevance_matches) / len(keywords) if keywords else 1.0

            if relevance_score == 0.0:
                logger.debug("Rule '{}' is not applicable to the current document context.", name)
                evaluations.append(RuleEvaluation(
                    rule_id=rule_id,
                    rule_name=name,
                    category=rule_cat,
                    passed=True,
                    relevance_score=0.0,
                    message="Rule checkpoint not applicable to this context."
                ))
                continue

            # 2. Check for forbidden/violation conditions
            violations = [bad for bad in forbidden if bad.lower() in full_text]
            passed = len(violations) == 0

            message = rule.get("success_msg") if passed else f"{rule.get('fail_msg')} (Detected violations: {', '.join(violations)})"

            logger.info("EPC Rule Check '{}' evaluated. Passed: {}", name, passed)

            evaluations.append(RuleEvaluation(
                rule_id=rule_id,
                rule_name=name,
                category=rule_cat,
                passed=passed,
                relevance_score=round(relevance_score, 4),
                message=message
            ))

        return evaluations
