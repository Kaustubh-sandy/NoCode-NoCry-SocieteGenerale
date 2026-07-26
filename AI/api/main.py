"""
Bank360 AI FastAPI Application.
Production-ready REST API exposing training, query, insights, and health endpoints.
"""
import json
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from pathlib import Path

from pipelines.train import run_training
from services.query_router import execute_query
from services.feature_store import load_customers
from agents.insights_agent import generate_insights
from agents.eda_agent import summarize, compare
from config import METADATA_FILE, QUALITY_FILE

app = FastAPI(
    title="Bank360 AI Multi-Agent API",
    description="Customer Segmentation & Personalization AI Engine",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request Schemas ────────────────────────────────────────────────────────────

class QueryRequest(BaseModel):
    query: str
    limit: int = 50

class EDARequest(BaseModel):
    metric: Optional[str] = "yearly_income"
    group_by: Optional[str] = "segment_label"

# ── Health & Status ────────────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
def health():
    """Quick liveness probe."""
    return {"status": "ok", "service": "Bank360 AI API v2.0"}

@app.get("/status", tags=["System"])
def status():
    """Returns model training status and evaluation metrics from last run."""
    if not METADATA_FILE.exists():
        return {"trained": False, "message": "No training run found. Execute python model_train.py first."}
    try:
        metadata = json.loads(METADATA_FILE.read_text(encoding="utf-8"))
        return {
            "trained": True,
            "source": metadata.get("source"),
            "trained_at": metadata.get("trained_at"),
            "raw_rows": metadata.get("raw_rows"),
            "unique_customers": metadata.get("customers"),
            "clusters": metadata.get("clusters"),
            "evaluation_metrics": metadata.get("evaluation_metrics", {}),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read metadata: {str(e)}")

@app.get("/data-quality", tags=["System"])
def data_quality():
    """Returns the latest data quality profiling report."""
    if not QUALITY_FILE.exists():
        raise HTTPException(status_code=404, detail="Data quality report not found. Run python model_train.py first.")
    try:
        return json.loads(QUALITY_FILE.read_text(encoding="utf-8"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Training ───────────────────────────────────────────────────────────────────

@app.post("/train", tags=["Training"])
def train():
    """
    Triggers the full time-series training pipeline (Flow 1).
    20,000 transaction records → 4,941 customer profiles → K-Means clustering.
    """
    try:
        return run_training()
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

# ── Query & Recommendation ─────────────────────────────────────────────────────

@app.post("/query", tags=["Query"])
def query(request: QueryRequest):
    """
    Natural Language Query endpoint.
    Supports: segment search, premium prospecting, EDA distribution queries, and explain queries.
    """
    try:
        return execute_query(request.query, request.limit)
    except FileNotFoundError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query execution failed: {str(e)}")

# ── Segment & Portfolio Insights ───────────────────────────────────────────────

@app.get("/segments", tags=["Analytics"])
def segments():
    """
    Returns segment persona distribution across all 4,941 customers.
    """
    try:
        customers = load_customers()
        if "segment_label" not in customers.columns:
            raise HTTPException(status_code=409, detail="Feature store does not contain segment labels. Run training first.")
        distribution = customers.groupby("segment_label").agg(
            count=("customer_id", "count"),
            avg_income=("yearly_income", "mean"),
            avg_net_worth=("net_worth_estimate", "mean"),
            avg_credit_score=("credit_score", "mean"),
            avg_premium_potential=("premium_potential", "mean"),
            avg_tx_count=("total_transaction_count", "mean"),
            avg_total_spend=("total_historical_spend", "mean"),
        ).round(2).reset_index().to_dict(orient="records")
        total = len(customers)
        for row in distribution:
            row["percentage"] = round((row["count"] / total) * 100, 2)
        return {"total_customers": total, "segments": distribution}
    except HTTPException:
        raise
    except FileNotFoundError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/insights", tags=["Analytics"])
def insights():
    """
    Returns portfolio-wide AI-generated cross-sell, dormancy, and high-value customer insights.
    """
    try:
        customers = load_customers()
        return {"insights": generate_insights(customers)}
    except FileNotFoundError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── EDA Analytics ─────────────────────────────────────────────────────────────

@app.post("/eda/summary", tags=["EDA"])
def eda_summary(request: EDARequest):
    """
    Returns descriptive statistics (Mean, Std, Min, Max, Skewness, Kurtosis, Outliers) for a metric.
    """
    try:
        customers = load_customers()
        return {
            "metric": request.metric,
            "statistics": summarize(customers, request.metric)
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/eda/compare", tags=["EDA"])
def eda_compare(request: EDARequest):
    """
    Returns per-group aggregated metric statistics (e.g., income breakdown by segment).
    """
    try:
        customers = load_customers()
        return {
            "metric": request.metric,
            "group_by": request.group_by,
            "comparison": compare(customers, request.metric, request.group_by)
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/customers", tags=["Data"])
def customers(limit: int = 100, offset: int = 0):
    """
    Paginated customer feature store listing.
    """
    try:
        df = load_customers()
        total = len(df)
        page = df.iloc[offset:offset + limit]
        return {
            "total": total,
            "offset": offset,
            "limit": limit,
            "customers": page.to_dict(orient="records")
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/customers/{customer_id}", tags=["Data"])
def get_customer(customer_id: str):
    """
    Retrieves a single customer's complete feature and segment profile by customer_id.
    """
    try:
        df = load_customers()
        row = df[df["customer_id"] == customer_id]
        if row.empty:
            raise HTTPException(status_code=404, detail=f"Customer '{customer_id}' not found.")
        return row.iloc[0].to_dict()
    except HTTPException:
        raise
    except FileNotFoundError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
