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
