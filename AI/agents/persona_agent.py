import json
from pathlib import Path

DEFAULT_PERSONAS = {
    "0": {
        "name": "Emerging Affluent",
        "strategy": "Investment Upsell & Pre-approved Credit Products",
        "description": "Younger professionals with growing income, high digital adoption, and expanding credit needs."
    },
    "1": {
        "name": "Credit Borrowers",
        "strategy": "Debt Consolidation, Refinancing & Credit Builder Offers",
        "description": "Active borrowers with high credit debt or loan balances requiring credit management solutions."
    },
    "2": {
        "name": "Premium Investors",
        "strategy": "Private Banking, Wealth Advisory & Exclusive Premium Cards",
        "description": "High net-worth customers with high investment balances and top premium potential scores."
    },
    "3": {
        "name": "Dormant Recovery",
        "strategy": "Digital Re-activation Campaign & Retention Incentives",
        "description": "Customers with elevated dormancy scores and declining branch/mobile logins requiring re-engagement."
    }
}

def load_personas(path):
    """
    Loads saved segment persona metadata from file with robust default fallback.
    """
    file_path = Path(path)
    if not file_path.exists():
        return DEFAULT_PERSONAS
    try:
        data = json.loads(file_path.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) and len(data) > 0 else DEFAULT_PERSONAS
    except Exception:
        return DEFAULT_PERSONAS

def get_persona_by_cluster(cluster_id, personas_data=DEFAULT_PERSONAS):
    """
    Retrieves persona metadata for a specific cluster ID.
    """
    key = str(cluster_id)
    return personas_data.get(key, {
        "name": "Everyday Banking",
        "strategy": "Mobile App Engagement & Low-Cost Savings Products",
        "description": "Core retail banking customer profile."
    })
