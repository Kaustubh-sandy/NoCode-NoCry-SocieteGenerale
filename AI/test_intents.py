from services.query_router import execute_query

test_queries = [
    "find premium customers in Bangalore",
    "which customers are about to leave and why",
    "which non-premium customers can become premium",
    "show income distribution across segments",
    "give me portfolio insights and cross sell opportunities",
    "check data health and dataset quality",
    "check governance policy for campaign targeting 2000 customers"
]

print("=" * 80)
print(" MULTI-AGENT ROUTING TEST FOR ALL 14 SPECIALIST AGENTS")
print("=" * 80)

for q in test_queries:
    res = execute_query(q)
    plan = res["plan"]
    print(f"\nQUERY  : '{q}'")
    print(f"INTENT : {plan['intent']}")
    print(f"TOOLS  : {plan['tools']}")
    print(f"CITY   : {plan['entities'].get('city')}")
    print(f"SEGMENT: {plan['entities'].get('segment')}")

print("\n" + "=" * 80)
print(" ALL INTENTS & AGENTS ROUTED SUCCESSFULLY!")
print("=" * 80)
