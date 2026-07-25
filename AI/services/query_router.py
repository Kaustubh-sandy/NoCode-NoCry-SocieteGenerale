from agents.recommendation_agent import recommend
from agents.explainability_agent import explain
from services.feature_store import load_customers
from services.planner import plan_query

def _chart(df, query):
    column = "yearly_income" if "income" in query.lower() else "net_worth_estimate" if "worth" in query.lower() or "balance" in query.lower() else "premium_potential"
    return {"type": "histogram", "column": column, "statistics": df[column].describe().round(2).to_dict()}

def execute_query(query, limit=50):
    plan = plan_query(query); customers = load_customers(); entity = plan["entities"]
    if plan["intent"] == "analysis": return {"plan": plan, "result": _chart(customers, query)}
    df = customers.copy()
    if entity["city"]: df = df[df.city.str.lower().isin({entity["city"].lower(), "bengaluru" if entity["city"].lower() == "bangalore" else entity["city"].lower()})]
    if entity["segment"] == "Premium": df = df[(df.segment_label == "Premium Investors") | (df.premium_potential >= 70)]
    if entity["segment"] == "Dormant": df = df[(df.segment_label == "Dormant Recovery") | (df.dormancy_score >= 60)]
    if entity["minimum_net_worth"]: df = df[df.net_worth_estimate >= entity["minimum_net_worth"]]
    if plan["intent"] == "recommendation":
        # Prospects are high-potential customers who are not already in the premium segment.
        df = df[df.segment_label != "Premium Investors"].sort_values("premium_potential", ascending=False).head(limit).copy()
        df["recommendations"] = [recommend(row) for _, row in df.iterrows()]
        df["explanation"] = [explain(row, "premium opportunity") for _, row in df.iterrows()]
    return {"plan": plan, "count": len(df), "results": df.head(limit).to_dict(orient="records")}
