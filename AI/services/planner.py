import re

def plan_query(query):
    q = query.lower()
    city = next((c.title() for c in ["bangalore", "bengaluru", "mumbai", "delhi", "pune", "hyderabad", "chennai", "kolkata", "indore"] if c in q), None)
    balance = re.search(r"(?:balance|net worth)\s*(?:above|over|>)\s*₹?\s*([\d,.]+)\s*(lakh|lac|k|million)?", q)
    threshold = None
    if balance:
        threshold = float(balance.group(1).replace(",", "")); unit = balance.group(2)
        threshold *= 100000 if unit in {"lakh", "lac"} else 1000 if unit == "k" else 1000000 if unit == "million" else 1
    if any(x in q for x in ["distribution", "histogram", "correlation", "compare"]): intent, tools = "analysis", ["eda", "visualization"]
    elif any(x in q for x in ["recommend", "can become premium", "upsell", "cross sell"]): intent, tools = "recommendation", ["feature_store", "segmentation", "recommendation", "explainability"]
    elif any(x in q for x in ["why", "explain", "reason"]): intent, tools = "explain", ["feature_store", "explainability"]
    else: intent, tools = "segment_query", ["feature_store", "segmentation"]
    # "Can become premium" is a prospecting request, not a filter for existing premium customers.
    segment = ("Premium" if "premium" in q and "become premium" not in q and "can become premium" not in q else "Dormant" if "dormant" in q else None)
    return {"intent": intent, "entities": {"city": city, "segment": segment, "minimum_net_worth": threshold}, "tools": tools, "approval_required": False}
