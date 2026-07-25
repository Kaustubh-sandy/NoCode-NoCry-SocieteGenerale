import json
import pandas as pd

def profile_data(path):
    df = pd.read_csv(path)
    numeric = df.select_dtypes(include="number").columns.tolist()
    datetime_like = [c for c in df.columns if "date" in c.lower() or "year" in c.lower()]
    report = {
        "rows": len(df), "columns": len(df.columns), "numeric_columns": numeric,
        "categorical_columns": [c for c in df.columns if c not in numeric and c not in datetime_like],
        "datetime_columns": datetime_like,
        "missing_values": df.isna().sum().loc[lambda x: x.gt(0)].to_dict(),
        "duplicate_rows": int(df.duplicated().sum()),
        "potential_ids": [c for c in df.columns if c.lower() in {"id", "client_id", "customer_id"}],
    }
    return df, report

def save_report(report, path):
    path.write_text(json.dumps(report, indent=2, default=str), encoding="utf-8")
