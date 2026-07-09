from enum import Enum


class QueryType(str, Enum):
    """Enumeration cataloging query intelligence classes in EPC operations."""

    GENERAL = "General Question"
    DOCUMENT_SEARCH = "Document Search"
    COMPLIANCE = "Compliance Query"
    SCHEDULE = "Schedule Query"
    PROCUREMENT = "Procurement Query"
    COMMISSIONING = "Commissioning Query"
    RISK = "Risk Query"
    RECOMMENDATION = "Recommendation Query"
