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

def explain(customer, outcome="premium opportunity"):
    """
    Produces transparent, human-readable reason codes and summary explanations
    incorporating time-series transaction aggregations and financial strength metrics.
    """
    income = float(_get(customer, "yearly_income", 0))
    net_worth = float(_get(customer, "net_worth_estimate", 0))
    credit = float(_get(customer, "credit_score", 0))
    premium = float(_get(customer, "premium_potential", 0))
    inv_read = float(_get(customer, "investment_readiness", 0))
    activity = float(_get(customer, "activity_score", 0))
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
        "total_historical_spend": total_spend,
        "total_transaction_count": total_tx,
        "avg_transaction_amount": avg_tx
    }
    
    sorted_factors = sorted(factors.items(), key=lambda item: item[1], reverse=True)
    summary = f"Supported by a premium-potential score of {premium:.1f}, credit score of {credit:.0f}, estimated net worth of ₹{net_worth:,.0f}, and historical spend of ₹{total_spend:,.0f} across {int(total_tx)} transactions."
    
    return {
        "outcome": outcome,
        "reason_codes": sorted_factors,
        "summary": summary
    }
