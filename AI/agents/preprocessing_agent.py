import pandas as pd

def clean_data(df):
    """
    Data Preprocessing Agent for Time-Series Transactions.
    Preserves all 20,000 customer transaction records across dates.
    Only removes exact 100% duplicate rows (matching all columns).
    Sorts transactions chronologically by client_id and date.
    """
    before = len(df)
    # Remove ONLY exact 100% duplicate rows (matching every single column)
    df_clean = df.drop_duplicates().copy()
    exact_duplicates_removed = before - len(df_clean)
    
    # Parse dates if present
    if "date" in df_clean.columns:
        df_clean["date"] = pd.to_datetime(df_clean["date"], errors="coerce")
        # Sort chronologically per client
        id_col = "client_id" if "client_id" in df_clean.columns else "id"
        if id_col in df_clean.columns:
            df_clean = df_clean.sort_values(by=[id_col, "date"]).reset_index(drop=True)
            
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
            
    transformation_report = {
        "exact_duplicates_removed": exact_duplicates_removed,
        "total_time_series_records": len(df_clean),
        "unique_clients": int(df_clean["client_id"].nunique()) if "client_id" in df_clean.columns else len(df_clean)
    }
    
    return df_clean, transformation_report
