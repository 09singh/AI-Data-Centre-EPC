# Configurable EPC rules templates for Data Centre engineering checks

DEFAULT_EPC_RULES = [
    {
        "id": "RULE_CL_001",
        "name": "Client Redundant Cooling Check",
        "category": "Client",
        "keywords": ["redundancy", "n+1", "n+2", "backup chiller"],
        "forbidden": ["no backup", "single chiller", "n redundancy only"],
        "success_msg": "Client requirement for N+1/N+2 chiller redundancy satisfied.",
        "fail_msg": "Critical: Cooling loop configuration lacks redundant chiller backups."
    },
    {
        "id": "RULE_PR_002",
        "name": "Project Platform Elevation Check",
        "category": "Project",
        "keywords": ["elevation", "flood level", "raised platform", "generator platform"],
        "forbidden": ["basement generator", "below grade", "floor level placement"],
        "success_msg": "Project platform elevation check passed. Critical equipment is elevated.",
        "fail_msg": "Warning: Generator or fuel assets placed below grade or in basement zones."
    },
    {
        "id": "RULE_CO_003",
        "name": "Company Cabling Separation Standard",
        "category": "Company",
        "keywords": ["cable tray", "separation", "power signal separation", "distance"],
        "forbidden": ["shared routing", "power and signal touching", "mixed containment"],
        "success_msg": "Cabling segregation checks satisfied. Power and instrumentation are separate.",
        "fail_msg": "Quality: Power and data signal cabling routing lack separation clearance."
    }
]
