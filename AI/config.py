import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
SOURCE_CSV = BASE_DIR / "Enriched_Customer_financial_profiles.csv"
FEATURE_STORE = BASE_DIR / "feature_store"
MODELS_DIR = BASE_DIR / "models"
FEATURES_FILE = FEATURE_STORE / "customer_features.parquet"
SEGMENTS_FILE = FEATURE_STORE / "customer_segments.parquet"
FEATURES_CSV_FILE = FEATURE_STORE / "customer_features.csv"
SEGMENTS_CSV_FILE = FEATURE_STORE / "customer_segments.csv"
METADATA_FILE = FEATURE_STORE / "metadata.json"
QUALITY_FILE = FEATURE_STORE / "data_quality_report.json"
PERSONAS_FILE = FEATURE_STORE / "segment_personas.json"
MODEL_FILE = MODELS_DIR / "customer_segmentation_kmeans.pkl"
SCALER_FILE = MODELS_DIR / "customer_segmentation_scaler.pkl"

# ── Gemini API Configuration ──────────────────────────────────────────────────
# Replace 'api key here' below with your actual Gemini API Key
# Or set the environment variable GEMINI_API_KEY in your system/terminal.
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "api key here")
# Enterprise Governance & Policy Configuration (Configurable by Risk & Product Teams)
GOVERNANCE_POLICY = {
    "max_auto_campaign_target_count": 1000,
    "min_cluster_confidence": 0.50,
    "high_risk_intents": ["credit_limit_change", "account_suspension", "loan_cancellation"],
    "require_approval_for_prospecting": False
}
