import json
import pandas as pd
from config import FEATURES_FILE, SEGMENTS_FILE, FEATURES_CSV_FILE, SEGMENTS_CSV_FILE, METADATA_FILE

def save_features(features, segments, metadata):
    features.to_parquet(FEATURES_FILE, index=False)
    segments.to_parquet(SEGMENTS_FILE, index=False)
    # CSV copies keep local queries usable on Python installs without PyArrow.
    features.to_csv(FEATURES_CSV_FILE, index=False)
    segments.to_csv(SEGMENTS_CSV_FILE, index=False)
    METADATA_FILE.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

def load_customers():
    if not FEATURES_FILE.exists() and not FEATURES_CSV_FILE.exists():
        raise FileNotFoundError("Feature store is empty. Run `py app.py train` first.")
    try:
        features = pd.read_parquet(FEATURES_FILE)
        segments = pd.read_parquet(SEGMENTS_FILE)
    except (ImportError, FileNotFoundError):
        features = pd.read_csv(FEATURES_CSV_FILE)
        segments = pd.read_csv(SEGMENTS_CSV_FILE)
    return features.merge(segments, on="customer_id", how="left")
