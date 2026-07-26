"""
Human-in-the-Loop & Risk Governance Policy Evaluator.
Evaluates AI execution plans against configurable Enterprise Risk & Compliance Policies.
"""
from config import GOVERNANCE_POLICY

def needs_approval(plan, target_count=0, min_confidence=1.0, custom_policy=None):
    """
    Evaluates whether an execution plan requires manual human manager sign-off.
    Reads thresholds dynamically from GOVERNANCE_POLICY configuration.
    """
    policy = custom_policy or GOVERNANCE_POLICY
    reasons = []
    
    max_count = policy.get("max_auto_campaign_target_count", 1000)
    conf_threshold = policy.get("min_cluster_confidence", 0.50)
    high_risk_intents = set(policy.get("high_risk_intents", []))
    
    intent = plan.get("intent", "")
    
    if plan.get("approval_required", False):
        reasons.append("Plan explicitly flagged for manual supervisor sign-off.")
        
    if intent in high_risk_intents:
        reasons.append(f"Intent '{intent}' is classified as a High-Risk Banking Operation.")
        
    if target_count > max_count and intent == "recommendation":
        reasons.append(f"Target population ({target_count:,}) exceeds policy threshold ({max_count:,}) for automated outreach.")

    if min_confidence < conf_threshold:
        reasons.append(f"Prediction confidence ({min_confidence * 100:.1f}%) is below regulatory threshold ({conf_threshold * 100:.1f}%).")

    approval_required = len(reasons) > 0
    risk_level = "HIGH" if len(reasons) >= 2 else "MEDIUM" if approval_required else "LOW"

    return {
        "approval_required": approval_required,
        "risk_level": risk_level,
        "risk_reasons": reasons,
        "policy_evaluated": {
            "max_auto_campaign_target_count": max_count,
            "min_cluster_confidence": conf_threshold
        }
    }
