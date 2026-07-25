def needs_approval(plan):
    """Hook for UI approval when a plan contains uncertain or high-impact actions."""
    return bool(plan.get("approval_required", False))
