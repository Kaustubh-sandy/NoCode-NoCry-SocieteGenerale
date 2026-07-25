"""Agent 0: intent understanding, planning, and routing only; no dataframe work."""
from services.planner import plan_query

def supervise(user_query):
    return plan_query(user_query)
