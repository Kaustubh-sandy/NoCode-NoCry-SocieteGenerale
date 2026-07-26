from services.query_router import execute_query

test_queries = [
    ("Which customers are about to leave and why", "churn_query"),
    ("Which customers can become premium?", "prospecting_query"),
    ("Find premium customers in Bangalore", "segment_query"),
    ("Show income distribution statistics", "eda_analysis"),
    ("Show portfolio cross sell opportunities", "portfolio_insights"),
    ("Run data health quality check", "data_quality_query"),
    ("Check risk governance approval policy for net worth 50 lakh", "risk_governance"),
]

print("=== TESTING MULTI-AGENT INTENT ROUTING & AUDIT TRAIL ===")
for q, expected in test_queries:
    res = execute_query(q)
    intent = res["plan"]["intent"]
    steps = res.get("audit_trail", [])
    agents = [s["agent"] for s in steps]
    status = "OK" if intent == expected else f"FAIL (got {intent})"
    print(f"[{status}] Query: '{q}'")
    print(f"  -> Intent: {intent}")
    print(f"  -> Audit Steps ({len(steps)}): {' -> '.join(agents)}")
    print()
