"""
Visualization Agent.
Generates full Plotly-compatible JSON chart specifications for web dashboards.
"""

def histogram_spec(column, statistics, title=None):
    """
    Generates a Plotly-compatible histogram specification.
    """
    return {
        "library": "plotly",
        "chart_type": "histogram",
        "title": title or f"Distribution Analysis of {column.replace('_', ' ').title()}",
        "x_axis": column,
        "statistics": statistics,
        "theme": "dark_modern"
    }

def scatter_spec(x_col, y_col, color_col="segment_label", title=None):
    """
    Generates a Plotly scatter plot specification (e.g. Income vs Net Worth by Segment).
    """
    return {
        "library": "plotly",
        "chart_type": "scatter",
        "title": title or f"{x_col.replace('_', ' ').title()} vs {y_col.replace('_', ' ').title()}",
        "x_axis": x_col,
        "y_axis": y_col,
        "color_group": color_col,
        "theme": "dark_modern"
    }

def pie_spec(group_col="segment_label", title="Customer Segment Distribution"):
    """
    Generates a Plotly pie/donut chart specification.
    """
    return {
        "library": "plotly",
        "chart_type": "pie",
        "title": title,
        "group_by": group_col,
        "hole": 0.4,
        "theme": "dark_modern"
    }
