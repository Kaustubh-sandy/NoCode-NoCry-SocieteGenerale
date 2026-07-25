def generate_insights(frame):
    one_product = float((frame.total_products <= 1).mean() * 100)
    dormant = float((frame.dormancy_score >= 60).mean() * 100)
    return [
        {"priority": "medium", "insight": f"{one_product:.1f}% of customers have one or fewer products, representing a cross-sell opportunity."},
        {"priority": "high" if dormant >= 20 else "medium", "insight": f"{dormant:.1f}% of customers have elevated dormancy scores and should be targeted for retention."},
    ]
