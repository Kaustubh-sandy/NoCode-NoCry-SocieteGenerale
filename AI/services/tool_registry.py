"""
Bank360 AI Tool Registry Service
Centralized Agent Catalog & Execution Manager.
Provides tool metadata schemas, allow-listed agent dispatching, and safe execution wrappers.
"""
import time
from typing import Dict, Any, Callable

# Import all specialist agent entry points
from agents.supervisor_agent import supervise
from agents.data_agent import profile_data
from agents.preprocessing_agent import clean_data
from agents.feature_engineering_agent import build_features
from agents.segmentation_agent import train_segments
from agents.recommendation_agent import recommend
from agents.explainability_agent import explain
from agents.insights_agent import generate_insights
from agents.eda_agent import summarize, compare
from agents.visualization_agent import histogram_spec
from agents.human_loop_agent import needs_approval
from agents.report_agent import write_json_report


class ToolRegistry:
    """
    Centralized Tool Registry for Multi-Agent Dispatch.
    Tracks agent tools, capabilities, metadata schemas, and safe execution.
    """
    def __init__(self):
        self._tools: Dict[str, Callable] = {}
        self._schemas: Dict[str, Dict[str, Any]] = {}
        self._register_default_tools()

    def register(self, name: str, func: Callable, description: str, category: str = "general"):
        """
        Registers a tool function alongside descriptive metadata.
        """
        self._tools[name] = func
        self._schemas[name] = {
            "name": name,
            "description": description,
            "category": category,
            "function_name": func.__name__
        }

    def _register_default_tools(self):
        """
        Registers all 13 specialist project agents into the tool catalog.
        """
        self.register("supervisor", supervise, "Parses query intent and builds execution plan", "orchestration")
        self.register("data_agent", profile_data, "Profiles raw dataset schema and data quality", "data")
        self.register("preprocessing", clean_data, "Cleans raw dataframe duplicates and missing values", "data")
        self.register("feature_engineering", build_features, "Computes 30+ customer financial features", "ml")
        self.register("segmentation", train_segments, "Fits optimal K-Means clustering model", "ml")
        self.register("recommendation", recommend, "Generates tailored product/campaign offers", "ai_agent")
        self.register("explainability", explain, "Provides transparent decision reasons & narratives", "ai_agent")
        self.register("portfolio_insights", generate_insights, "Computes portfolio-wide cross-sell & dormancy insights", "analytics")
        self.register("eda_summary", summarize, "Calculates column descriptive statistics", "eda")
        self.register("eda_compare", compare, "Compares metrics across segment groups", "eda")
        self.register("visualization", histogram_spec, "Emits Plotly-compatible chart specifications", "visualization")
        self.register("human_approval", needs_approval, "Flags high-impact actions for human review", "governance")
        self.register("report_writer", write_json_report, "Writes JSON report payload to disk", "reporting")

    def get_tool(self, name: str) -> Callable:
        """
        Retrieves a registered tool function or raises KeyError.
        """
        if name not in self._tools:
            raise KeyError(f"Tool '{name}' is not registered in the ToolRegistry. Available tools: {list(self._tools.keys())}")
        return self._tools[name]

    def execute(self, name: str, *args, **kwargs) -> Dict[str, Any]:
        """
        Safely executes a registered tool with execution timing and error handling.
        """
        tool_fn = self.get_tool(name)
        start_time = time.time()
        try:
            result = tool_fn(*args, **kwargs)
            duration = round((time.time() - start_time) * 1000, 2)
            return {
                "status": "success",
                "tool": name,
                "execution_ms": duration,
                "output": result
            }
        except Exception as e:
            duration = round((time.time() - start_time) * 1000, 2)
            return {
                "status": "error",
                "tool": name,
                "execution_ms": duration,
                "error": str(e)
            }

    def list_tools(self) -> Dict[str, Dict[str, Any]]:
        """
        Returns catalog of all registered tools and metadata schemas.
        """
        return self._schemas


# Global Registry Instance & Legacy Mapping for Backward Compatibility
registry = ToolRegistry()
TOOLS = registry._tools