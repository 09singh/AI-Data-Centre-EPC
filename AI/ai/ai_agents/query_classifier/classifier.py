from loguru import logger
from ai.ai_agents.query_classifier.query_types import QueryType


class QueryClassifier:
    """Classifies user queries into semantic project domains (e.g. Compliance, Schedule, Risk)."""

    def classify(self, query: str) -> QueryType:
        """Determines the QueryType based on keyword presence analysis.

        Args:
            query: The user text search string.

        Returns:
            QueryType: The classified query category.
        """
        logger.debug("Classifying user query: '{}'", query)
        q = query.lower().strip()

        # Rule-based keyword matching criteria
        if any(w in q for w in ["comply", "compliance", "standard", "regulation", "checklist", "permit", "code"]):
            logger.info("Query classified as: '{}'", QueryType.COMPLIANCE.value)
            return QueryType.COMPLIANCE

        if any(w in q for w in ["schedule", "delay", "milestone", "gantt", "duration", "critical path", "timeline", "late"]):
            logger.info("Query classified as: '{}'", QueryType.SCHEDULE.value)
            return QueryType.SCHEDULE

        if any(w in q for w in ["procure", "equipment", "purchase", "lead time", "supplier", "vendor", "buy", "order"]):
            logger.info("Query classified as: '{}'", QueryType.PROCUREMENT.value)
            return QueryType.PROCUREMENT

        if any(w in q for w in ["commission", "test", "startup", "fat", "sat", "energize", "acceptance"]):
            logger.info("Query classified as: '{}'", QueryType.COMMISSIONING.value)
            return QueryType.COMMISSIONING

        if any(w in q for w in ["risk", "hazard", "threat", "mitigate", "failure", "danger", "probability"]):
            logger.info("Query classified as: '{}'", QueryType.RISK.value)
            return QueryType.RISK

        if any(w in q for w in ["recommend", "suggest", "advice", "best practice", "optimization"]):
            logger.info("Query classified as: '{}'", QueryType.RECOMMENDATION.value)
            return QueryType.RECOMMENDATION

        if any(w in q for w in ["search", "find", "retrieve", "lookup", "document", "pdf", "file"]):
            logger.info("Query classified as: '{}'", QueryType.DOCUMENT_SEARCH.value)
            return QueryType.DOCUMENT_SEARCH

        logger.info("Query classified as default: '{}'", QueryType.GENERAL.value)
        return QueryType.GENERAL
