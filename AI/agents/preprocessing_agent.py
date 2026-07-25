import pandas as pd

def clean_data(df):
    before = len(df)
    df = df.drop_duplicates().copy()
    numeric = df.select_dtypes(include="number").columns
    for col in numeric:
        df[col] = df[col].fillna(df[col].median())
    for col in df.columns.difference(numeric):
        df[col] = df[col].fillna("Unknown")
    if "date" in df:
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
    return df, {"duplicates_removed": before - len(df), "rows_after_cleaning": len(df)}
