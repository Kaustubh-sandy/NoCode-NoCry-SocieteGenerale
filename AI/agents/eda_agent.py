import numpy as np
import pandas as pd

def summarize(frame, column):
    """
    Production-grade EDA Summary Statistics.
    Calculates Mean, Std Dev, Min, 25%, Median, 75%, Max, Skewness, Kurtosis, and Outlier Count.
    """
    if column not in frame.columns:
        # Fallback to yearly_income if available, else first numeric column
        numeric_cols = frame.select_dtypes(include="number").columns
        column = "yearly_income" if "yearly_income" in frame.columns else (numeric_cols[0] if len(numeric_cols) > 0 else frame.columns[0])

    series = pd.to_numeric(frame[column], errors="coerce").dropna()
    if len(series) == 0:
        return {"error": f"Column '{column}' contains no numeric data."}

    desc = series.describe().round(2).to_dict()
    q1 = series.quantile(0.25)
    q3 = series.quantile(0.75)
    iqr = q3 - q1
    outlier_count = int(((series < (q1 - 1.5 * iqr)) | (series > (q3 + 1.5 * iqr))).sum())

    desc.update({
        "iqr": round(float(iqr), 2),
        "skewness": round(float(series.skew()), 2),
        "kurtosis": round(float(series.kurtosis()), 2),
        "outlier_count": outlier_count
    })
    return desc

def compare(frame, metric="yearly_income", group="segment_label"):
    """
    Performs multi-group aggregated distribution metrics across segments or cities.
    """
    if metric not in frame.columns:
        numeric_cols = frame.select_dtypes(include="number").columns
        metric = "yearly_income" if "yearly_income" in frame.columns else numeric_cols[0]

    if group not in frame.columns:
        group = "segment_label" if "segment_label" in frame.columns else frame.columns[0]

    grouped = frame.groupby(group)[metric].agg(["count", "mean", "median", "std", "min", "max"]).round(2)
    return grouped.to_dict(orient="index")
