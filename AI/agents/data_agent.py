import json
from pathlib import Path
import pandas as pd

def profile_data(source):
    """
    Production-grade Data Quality Profiler for Time-Series Transactions.
    Ingests CSV filepath or DataFrame, computes data health quality score %,
    column data types, missing values, memory usage, unique client count,
    and average transaction records per customer.
    """
    if isinstance(source, (str, Path)):
        df = pd.read_csv(source)
    elif isinstance(source, pd.DataFrame):
        df = source.copy()
    else:
        raise TypeError("Source must be a file path string, Path object, or pandas DataFrame.")

    total_cells = df.size
    missing_total = int(df.isna().sum().sum())
    health_score = round(((total_cells - missing_total) / total_cells) * 100, 2) if total_cells > 0 else 0.0

    numeric_cols = df.select_dtypes(include="number").columns.tolist()
    datetime_cols = [c for c in df.columns if "date" in c.lower() or "year" in c.lower()]
    categorical_cols = [c for c in df.columns if c not in numeric_cols and c not in datetime_cols]
    potential_ids = [c for c in df.columns if c.lower() in {"id", "client_id", "customer_id", "transaction_id"}]

    zero_variance_cols = [c for c in numeric_cols if df[c].nunique() <= 1]
    missing_by_col = df.isna().sum().loc[lambda x: x.gt(0)].to_dict()

    id_col = "client_id" if "client_id" in df.columns else ("id" if "id" in df.columns else None)
    unique_clients = df[id_col].nunique() if id_col else len(df)
    avg_tx_per_client = round(len(df) / unique_clients, 2) if unique_clients > 0 else 1.0

    report = {
        "summary": {
            "total_transaction_records": len(df),
            "total_columns": len(df.columns),
            "unique_clients_count": unique_clients,
            "avg_transactions_per_client": avg_tx_per_client,
            "memory_usage_mb": round(df.memory_usage(deep=True).sum() / (1024 * 1024), 2),
            "data_health_score_pct": health_score,
            "exact_duplicate_rows": int(df.duplicated().sum()),
        },
        "column_breakdown": {
            "numeric_columns_count": len(numeric_cols),
            "categorical_columns_count": len(categorical_cols),
            "datetime_columns_count": len(datetime_cols),
            "potential_identifier_columns": potential_ids,
            "zero_variance_columns": zero_variance_cols,
        },
        "missing_values": {k: int(v) for k, v in missing_by_col.items()}
    }

    return df, report

def save_report(report, output_path):
    """
    Persists data quality report to JSON disk path.
    """
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report, indent=2, default=str), encoding="utf-8")
    return str(path)
