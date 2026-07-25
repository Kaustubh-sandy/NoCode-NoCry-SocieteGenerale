from agents.supervisor_agent import supervise
from agents.eda_agent import summarize, compare
from agents.recommendation_agent import recommend
from agents.explainability_agent import explain

TOOLS = {"supervisor": supervise, "eda_summary": summarize, "eda_compare": compare, "recommend": recommend, "explain": explain}
