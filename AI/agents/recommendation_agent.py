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

def recommend(customer):
    """
    Generates rule-based product recommendations incorporating time-series transaction aggregations,
    historical spending volume, transaction velocity, and derived persona scores.
    """
    premium_pot = float(_get(customer, "premium_potential", 0))
    inv_read = float(_get(customer, "investment_readiness", 0))
    products = float(_get(customer, "total_products", 0))
    dormancy = float(_get(customer, "dormancy_score", 0))
    total_spend = float(_get(customer, "total_historical_spend", 0))
    total_tx = float(_get(customer, "total_transaction_count", 0))
    avg_tx = float(_get(customer, "avg_transaction_amount", 0))
    
    choices = []
    if premium_pot >= 70:
        choices.append(("Premium Wealth Card", "High premium potential, income, and credit profile"))
    if inv_read >= 60:
        choices.append(("Wealth Advisory", "Strong investment readiness and available net worth"))
    if total_spend >= 50000 or avg_tx >= 5000:
        choices.append(("High-Spender Rewards Card", f"High historical spend (₹{total_spend:,.0f}) across {int(total_tx)} transactions"))
    if total_tx >= 10:
        choices.append(("Frequent Transactor Loyalty Program", f"High transaction velocity ({int(total_tx)} completed transactions)"))
    if products <= 2:
        choices.append(("Cross-Sell Product Bundle", "Low product ownership creates a cross-sell opportunity"))
    if dormancy >= 60:
        choices.append(("Re-engagement Retention Campaign", "High dormancy score calls for retention outreach"))
        
    return [{"product": a, "reason": b} for a, b in (choices or [("Savings Optimizer", "Suitable entry recommendation based on current profile")])]
