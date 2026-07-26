import pandas as pd
import numpy as np

def clean_data(df):
    """
    Data Preprocessing Agent for Time-Series Transactions.
    Preserves ALL 20,000 transaction records chronologically across dates.
    NO rows are dropped — legitimate repeated transactions/dates are retained.
    Sorts transactions chronologically per client and derives time-series sequence metrics.
    """
    df_clean = df.copy()
    
    # Parse dates if present
    if "date" in df_clean.columns:
        df_clean["date"] = pd.to_datetime(df_clean["date"], errors="coerce")
        # Sort chronologically per client
        id_col = "client_id" if "client_id" in df_clean.columns else ("id" if "id" in df_clean.columns else None)
        if id_col and id_col in df_clean.columns:
            df_clean = df_clean.sort_values(by=[id_col, "date"]).reset_index(drop=True)
            
            # Compute time-series sequence indicators
            df_clean["tx_sequence_num"] = df_clean.groupby(id_col).cumcount() + 1
            df_clean["prev_tx_date"] = df_clean.groupby(id_col)["date"].shift(1)
            df_clean["days_since_prev_tx"] = (df_clean["date"] - df_clean["prev_tx_date"]).dt.total_seconds() / (24 * 3600)
            df_clean["days_since_prev_tx"] = df_clean["days_since_prev_tx"].fillna(0).round(2)
            df_clean = df_clean.drop(columns=["prev_tx_date"])
            
    # Impute missing numerical values with median
    numeric_cols = df_clean.select_dtypes(include="number").columns
    for col in numeric_cols:
        if df_clean[col].isna().sum() > 0:
            df_clean[col] = df_clean[col].fillna(df_clean[col].median())
            
    # Impute missing categorical values with 'Unknown'
    categorical_cols = df_clean.columns.difference(numeric_cols)
    for col in categorical_cols:
        if col != "date" and df_clean[col].isna().sum() > 0:
            df_clean[col] = df_clean[col].fillna("Unknown")
            
    id_col_name = "client_id" if "client_id" in df_clean.columns else ("id" if "id" in df_clean.columns else None)
    unique_clients = int(df_clean[id_col_name].nunique()) if id_col_name else len(df_clean)
    
    transformation_report = {
        "exact_duplicates_removed": 0,  # Zero rows dropped to preserve full time-series sequence
        "total_time_series_records": len(df_clean),
        "unique_clients": unique_clients,
        "avg_transactions_per_client": round(len(df_clean) / max(unique_clients, 1), 2)
    }
    
    return df_clean, transformation_report
