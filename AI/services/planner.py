import re

# Comprehensive list of major Indian banking cities & variations
CITY_SYNONYMS = {
    "bangalore": "Bengaluru",
    "bengaluru": "Bengaluru",
    "mumbai": "Mumbai",
    "delhi": "Delhi",
    "new delhi": "Delhi",
    "pune": "Pune",
    "hyderabad": "Hyderabad",
    "chennai": "Chennai",
    "kolkata": "Kolkata",
    "ahmedabad": "Ahmedabad",
    "surat": "Surat",
    "jaipur": "Jaipur",
    "lucknow": "Lucknow",
    "kanpur": "Kanpur",
    "indore": "Indore",
    "thane": "Thane",
    "bhopal": "Bhopal",
    "vadodara": "Vadodara",
    "nagpur": "Nagpur",
    "patna": "Patna",
    "coimbatore": "Coimbatore"
}

# Column keywords for EDA distribution queries
METRIC_KEYWORDS = {
    "income": "yearly_income",
    "salary": "yearly_income",
    "earning": "yearly_income",
    "worth": "net_worth_estimate",
    "net worth": "net_worth_estimate",
    "wealth": "net_worth_estimate",
    "balance": "savings_balance",
    "savings": "savings_balance",
    "investment": "investment_balance",
    "debt": "total_debt",
    "loan": "loan_outstanding",
    "credit": "credit_score",
    "cibil": "credit_score",
    "spend": "average_monthly_spend",
    "expense": "average_monthly_spend",
    "premium": "premium_potential",
    "dormancy": "dormancy_score",
    "activity": "activity_score"
}

def extract_numerical_threshold(query_lower):
    """
    Extracts financial threshold amounts supporting Indian notation (lakh, lac, cr, k, million).
    Examples: 'above 5 lakh', 'over 10 lac', '> 50k', 'balance > 1000000', 'at least 15 lakh'
    """
    pattern = r"(?:balance|net worth|income|worth|spend|debt)?\s*(?:above|over|>|greater than|at least|more than|min)\s*₹?\s*([\d,.]+)\s*(lakh|lac|cr|crore|k|million)?"
    match = re.search(pattern, query_lower)
    if not match:
        return None
        
    try:
        val_str = match.group(1).replace(",", "")
        val = float(val_str)
        unit = (match.group(2) or "").lower()
        
        if unit in {"lakh", "lac"}:
            val *= 100000
        elif unit in {"cr", "crore"}:
            val *= 10000000
        elif unit == "k":
            val *= 1000
        elif unit == "million":
            val *= 1000000
            
        return val
    except (ValueError, TypeError):
        return None

def plan_query(query):
    """
    Natural Language Query Planner:
    1. Semantic Intent Classification (analysis, recommendation, explain, segment_query).
    2. Entity Extraction (city, segment, net worth threshold).
    3. Target Column Identification for analytics.
    4. Dynamic Tool Pipeline Construction.
    """
    q = query.lower().strip()
    
    # 1. City Entity Extraction
    city = None
    for token, normalized_city in CITY_SYNONYMS.items():
        if re.search(rf"\b{token}\b", q):
            city = normalized_city
            break
            
    # 2. Financial Threshold Extraction
    threshold = extract_numerical_threshold(q)
    
    # 3. Intent Classification & Tool Pipeline
    analysis_keywords = ["distribution", "histogram", "stats", "statistics", "average", "mean", "summary", "compare", "breakdown", "correlation", "plot", "graph"]
    rec_keywords = ["recommend", "recommendation", "upsell", "cross sell", "prospect", "convert", "target", "offer", "can become premium", "who can become", "prospecting"]
    explain_keywords = ["why", "explain", "reason", "rationale", "because", "driver"]
    
    if any(k in q for k in analysis_keywords):
        intent = "analysis"
        tools = ["eda", "visualization"]
    elif any(k in q for k in rec_keywords):
        intent = "recommendation"
        tools = ["feature_store", "segmentation", "recommendation", "explainability"]
    elif any(k in q for k in explain_keywords):
        intent = "explain"
        tools = ["feature_store", "explainability"]
    else:
        intent = "segment_query"
        tools = ["feature_store", "segmentation"]
        
    # 4. Target Metric Detection for Analysis
    target_metric = "yearly_income"
    for kw, col_name in METRIC_KEYWORDS.items():
        if kw in q:
            target_metric = col_name
            break
            
    # 5. Segment Entity Extraction
    # Special rule: "can become premium" or "prospect" means non-premium target prospect, not filter for existing premium
    segment = None
    if "become premium" not in q and "can become premium" not in q and "prospect" not in q:
        if any(k in q for k in ["premium", "hni", "wealthy", "high net worth", "affluent"]):
            segment = "Premium"
        elif any(k in q for k in ["dormant", "inactive", "churn", "passive"]):
            segment = "Dormant"
        elif any(k in q for k in ["emerging", "growing"]):
            segment = "Emerging Affluent"
        elif any(k in q for k in ["borrower", "debtor", "loan"]):
            segment = "Credit Borrowers"
        elif any(k in q for k in ["everyday", "regular", "retail"]):
            segment = "Everyday Banking"
            
    return {
        "intent": intent,
        "entities": {
            "city": city,
            "segment": segment,
            "minimum_net_worth": threshold,
            "target_metric": target_metric
        },
        "tools": tools,
        "approval_required": False
    }
