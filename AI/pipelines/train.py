from datetime import datetime, timezone
from agents.data_agent import profile_data, save_report
from agents.preprocessing_agent import clean_data
from agents.feature_engineering_agent import build_features
from agents.segmentation_agent import train_segments
from config import SOURCE_CSV, FEATURES_FILE, MODEL_FILE, QUALITY_FILE, SCALER_FILE, PERSONAS_FILE
from services.feature_store import save_features

def run_training():
    for path in [FEATURES_FILE.parent, MODEL_FILE.parent]: path.mkdir(parents=True, exist_ok=True)
    raw, quality = profile_data(SOURCE_CSV); save_report(quality, QUALITY_FILE)
    clean, transformations = clean_data(raw); features = build_features(clean)
    segments, personas = train_segments(features, MODEL_FILE, SCALER_FILE, PERSONAS_FILE)
    metadata = {"source": SOURCE_CSV.name, "trained_at": datetime.now(timezone.utc).isoformat(), "raw_rows": len(raw), "customers": len(features), "transformations": transformations, "feature_columns": features.columns.tolist(), "clusters": len(personas)}
    save_features(features, segments, metadata)
    return metadata
