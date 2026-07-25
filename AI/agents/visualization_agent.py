def histogram_spec(column, statistics):
    return {"library": "plotly", "type": "histogram", "x": column, "statistics": statistics}
