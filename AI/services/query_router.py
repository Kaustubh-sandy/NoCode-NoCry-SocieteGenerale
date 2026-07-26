from agents.recommendation_agent import recommend
from agents.explainability_agent import explain
from services.feature_store import load_customers
from services.planner import plan_query
from agents.eda_agent import summarize, compare

def _chart(df, target_metric="yearly_income"):
    column = target_metric if target_metric in df.columns else "yearly_income"
    stats = summarize(df, column)
    seg_compare = compare(df, column) if "segment_label" in df.columns else {}
    return {
        "type": "histogram",
        "column": column,
        "statistics": stats,
        "by_segment": seg_compare
    }

def execute_query(query, limit=50):
    plan = plan_query(query)
    customers = load_customers()
    entity = plan["entities"]

    if plan["intent"] == "analysis":
        target_metric = entity.get("target_metric", "yearly_income")
        return {"plan": plan, "result": _chart(customers, target_metric)}

    df = customers.copy()

    # City Filter
    if entity["city"]:
        target_city = entity["city"].lower()
        # Bangalore/Bengaluru are stored in dataset as city; handle both
        aliases = {target_city}
        if target_city == "bangalore":
            aliases.add("bengaluru")
        elif target_city == "bengaluru":
            aliases.add("bangalore")
        df = df[df.city.str.lower().isin(aliases)]

    # Segment Filter
    if entity["segment"]:
        seg = entity["segment"]
        if seg == "Premium":
            df = df[(df.segment_label == "Premium Investors") | (df.premium_potential >= 70)]
        elif seg == "Dormant":
            df = df[(df.segment_label == "Dormant Recovery") | (df.dormancy_score >= 60)]
        elif seg in {"Emerging Affluent", "Credit Borrowers", "Everyday Banking"}:
            df = df[df.segment_label == seg]

    # Minimum Net Worth / Financial Threshold Filter
    if entity["minimum_net_worth"]:
        df = df[df.net_worth_estimate >= entity["minimum_net_worth"]]

    # Recommendation & Prospecting Flow
    if plan["intent"] == "recommendation":
        df = df[df.segment_label != "Premium Investors"].sort_values("premium_potential", ascending=False).head(limit).copy()
        df["recommendations"] = [recommend(row) for _, row in df.iterrows()]
        df["explanation"] = [explain(row, "premium opportunity") for _, row in df.iterrows()]

    # Explain Flow — call explain() per customer record
    elif plan["intent"] == "explain":
        df = df.head(limit).copy()
        df["explanation"] = [explain(row, "segment assignment") for _, row in df.iterrows()]

    return {
        "plan": plan,
        "count": len(df),
        "results": df.head(limit).to_dict(orient="records")
    }
