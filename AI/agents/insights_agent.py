def generate_insights(frame):
    """
    Computes high-level portfolio insights from customer feature frame
    incorporating time-series transaction aggregations and business scores.
    """
    if frame is None or len(frame) == 0:
        return []
    
    total_products = frame["total_products"] if "total_products" in frame.columns else 0
    dormancy_score = frame["dormancy_score"] if "dormancy_score" in frame.columns else 0
    premium_potential = frame["premium_potential"] if "premium_potential" in frame.columns else 0
    tx_count = frame["total_transaction_count"] if "total_transaction_count" in frame.columns else 0
    total_spend = frame["total_historical_spend"] if "total_historical_spend" in frame.columns else 0
    
    one_product = float((total_products <= 1).mean() * 100) if hasattr(total_products, "mean") else 0.0
    dormant = float((dormancy_score >= 60).mean() * 100) if hasattr(dormancy_score, "mean") else 0.0
    high_potential = float((premium_potential >= 70).mean() * 100) if hasattr(premium_potential, "mean") else 0.0
    high_frequency = float((tx_count >= 5).mean() * 100) if hasattr(tx_count, "mean") else 0.0
    avg_portfolio_spend = float(total_spend.mean()) if hasattr(total_spend, "mean") else 0.0
    
    return [
        {"priority": "medium", "insight": f"{one_product:.1f}% of customers have 1 or fewer products, representing a prime cross-sell opportunity."},
        {"priority": "high" if dormant >= 20 else "medium", "insight": f"{dormant:.1f}% of customers have elevated dormancy scores (>=60) calling for retention outreach."},
        {"priority": "high" if high_potential >= 15 else "medium", "insight": f"{high_potential:.1f}% of customers exhibit high premium potential (>=70)."},
        {"priority": "medium", "insight": f"{high_frequency:.1f}% of customers have 5+ historical transactions with an average portfolio spend of Rs.{avg_portfolio_spend:,.2f}."}
    ]
