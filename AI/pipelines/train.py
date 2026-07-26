from datetime import datetime, timezone
import json
from agents.data_agent import profile_data, save_report
from agents.preprocessing_agent import clean_data
from agents.feature_engineering_agent import build_features
from agents.segmentation_agent import train_segments
from config import SOURCE_CSV, FEATURES_FILE, MODEL_FILE, QUALITY_FILE, SCALER_FILE, PERSONAS_FILE, FEATURE_STORE
from services.feature_store import save_features

def run_training():
    """
    Time-Series Training Pipeline:
    1. Data Profiling (20,000 transaction records → data quality report)
    2. Data Cleaning (exact deduplication only, sort chronologically)
    3. Feature Engineering (group by client_id → 4,941 customer profiles)
    4. K-Means Segmentation (Optimal K auto-selection, 43 features)
    5. Feature Store Persistence (Parquet + CSV + JSON metadata)
    """
    for path in [FEATURES_FILE.parent, MODEL_FILE.parent]:
        path.mkdir(parents=True, exist_ok=True)

    # Step 1: Profile raw time-series data
    raw, quality = profile_data(SOURCE_CSV)
    save_report(quality, QUALITY_FILE)
    print(f"   [Data Agent] Profiled {quality['summary']['total_transaction_records']:,} records "
          f"({quality['summary']['unique_clients_count']:,} unique clients, "
          f"avg {quality['summary']['avg_transactions_per_client']} tx/client, "
          f"health: {quality['summary']['data_health_score_pct']}%)")

    # Step 2: Clean (preserve all time-series records, sort chronologically)
    clean, transformations = clean_data(raw)
    print(f"   [Preprocessing Agent] {transformations['exact_duplicates_removed']} exact duplicates removed. "
          f"{transformations['total_time_series_records']:,} records retained.")

    # Step 3: Feature Engineering (time-series aggregation per customer)
    features = build_features(clean)
    print(f"   [Feature Engineering Agent] Built {len(features.columns)} features "
          f"for {len(features):,} customer profiles.")

    # Step 4: Train K-Means Segmentation
    segments, personas = train_segments(features, MODEL_FILE, SCALER_FILE, PERSONAS_FILE)

    # Step 5: Read evaluation metrics written by segmentation_agent
    model_metadata_file = FEATURE_STORE / "metadata.json"
    eval_metrics = {}
    if model_metadata_file.exists():
        try:
            m_data = json.loads(model_metadata_file.read_text(encoding="utf-8"))
            eval_metrics = m_data.get("evaluation_metrics", {})
        except Exception:
            pass

    # Step 6: Save Feature Store with complete metadata
    metadata = {
        "source": SOURCE_CSV.name,
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "raw_rows": quality["summary"]["total_transaction_records"],
        "customers": len(features),
        "unique_clients_in_raw": quality["summary"]["unique_clients_count"],
        "avg_transactions_per_client": quality["summary"]["avg_transactions_per_client"],
        "data_health_score_pct": quality["summary"]["data_health_score_pct"],
        "transformations": transformations,
        "evaluation_metrics": eval_metrics,
        "feature_columns": features.columns.tolist(),
        "clusters": len(personas)
    }
    save_features(features, segments, metadata)
    return metadata
