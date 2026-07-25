def recommend(customer):
    choices = []
    if customer.premium_potential >= 70: choices.append(("Premium Card", "High premium potential, income, and credit profile"))
    if customer.investment_readiness >= 60: choices.append(("Wealth Advisory", "Strong investment readiness and available net worth"))
    if customer.total_products <= 2: choices.append(("Product Bundle", "Low product ownership creates a cross-sell opportunity"))
    if customer.dormancy_score >= 60: choices.append(("Re-engagement Campaign", "High dormancy score calls for retention outreach"))
    return [{"product": a, "reason": b} for a, b in (choices or [("Savings Optimizer", "Suitable entry recommendation based on current profile")])]
