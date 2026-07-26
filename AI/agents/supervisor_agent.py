"""
Supervisor Agent (Agent 0).
Central Orchestrator for Intent Classification, Query Planning, and Tool Delegation.
Operates at the natural language query level without direct DataFrame manipulation.
"""
from services.planner import plan_query

def supervise(user_query: str):
    """
    Parses user query, extracts intent & entities, and returns structured execution plan.
    """
    return plan_query(user_query)
