def _get(obj, key, default=0):
    if isinstance(obj, dict):
        return obj.get(key, default)
    try:
        val = getattr(obj, key)
        return default if val is None else val
    except AttributeError:
        try:
            return obj[key]
        except (KeyError, TypeError):
            return default

def explain(customer, outcome="segment assignment"):
    """
    Produces transparent, human-readable reason codes and summary explanations
    incorporating time-series transaction aggregations, financial strength metrics,
    and churn / dormancy indicators.
    """
    income = float(_get(customer, "yearly_income", 0))
    net_worth = float(_get(customer, "net_worth_estimate", 0))
    credit = float(_get(customer, "credit_score", 0))
    premium = float(_get(customer, "premium_potential", 0))
    inv_read = float(_get(customer, "investment_readiness", 0))
    activity = float(_get(customer, "activity_score", 0))
    dormancy = float(_get(customer, "dormancy_score", 0))
    churn_risk = float(_get(customer, "churn_risk", dormancy))
    digital = float(_get(customer, "digital_adoption_score", 0))
    last_login = int(_get(customer, "last_login_days", 0))
    products = int(_get(customer, "total_products", 1))
    total_tx = float(_get(customer, "total_transaction_count", 0))
    total_spend = float(_get(customer, "total_historical_spend", 0))
    avg_tx = float(_get(customer, "avg_transaction_amount", 0))
    
    factors = {
        "yearly_income": income,
        "net_worth_estimate": net_worth,
        "credit_score": credit,
        "premium_potential": premium,
        "investment_readiness": inv_read,
        "activity_score": activity,
        "dormancy_score": dormancy,
        "churn_risk": churn_risk,
        "total_historical_spend": total_spend,
        "total_transaction_count": total_tx,
        "avg_transaction_amount": avg_tx
    }
    
    sorted_factors = sorted(factors.items(), key=lambda item: item[1], reverse=True)

    # Churn / Retention specific explanation
    if outcome in {"churn risk", "retention risk", "dormancy risk"} or churn_risk >= 50 or dormancy >= 50:
        summary = (
            f"Elevated churn & dormancy risk ({max(churn_risk, dormancy):.1f}/100) "
            f"driven by {last_login} days since last login, low digital activity score ({activity:.1f}/100), "
            f"and limited product adoption ({products} active product{'s' if products != 1 else ''})."
        )
    # Premium opportunity specific explanation
    elif outcome == "premium opportunity" or premium >= 70:
        summary = (
            f"High premium potential ({premium:.1f}/100) supported by credit score of {credit:.0f}, "
            f"estimated net worth of ₹{net_worth:,.0f}, and historical spend of ₹{total_spend:,.0f} across {int(total_tx)} transactions."
        )
    # General segment assignment explanation
    else:
        summary = (
            f"Segment assignment backed by financial health profile, income of ₹{income:,.0f}, "
            f"credit score of {credit:.0f}, activity score of {activity:.1f}/100, and {products} active product(s)."
        )
    
    return {
        "outcome": outcome,
        "reason_codes": sorted_factors,
        "summary": summary
    }
