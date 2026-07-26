import numpy as np
import pandas as pd

def _col(df, name, fallback=0):
    return pd.to_numeric(df[name], errors="coerce").fillna(fallback) if name in df.columns else pd.Series(fallback, index=df.index)

def _scale(value):
    lo, hi = value.min(), value.max()
    return pd.Series(50.0, index=value.index) if hi == lo else (value - lo) / (hi - lo) * 100

def build_features(df):
    """
    Time-Series Customer Aggregation Engine.
    Ingests all 20,000 transaction records, groups chronologically by client_id, and computes:
    - Time-Series Aggregations (Total Spend, Count, Avg, Max, Min, Volatility, Days Gap, Velocity)
    - Latest Demographics & Financial Snapshot
    - Spending Ratios & Digital Channel Activity
    - Business & Persona Derived Scores
    """
    df = df.copy()
    id_col = "client_id" if "client_id" in df.columns else ("id" if "id" in df.columns else None)
    if not id_col:
        df["client_id"] = range(1, len(df) + 1)
        id_col = "client_id"
    df["customer_id"] = df[id_col].astype(str)
    
    # Parse dates if present
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
        df = df.sort_values(by=["customer_id", "date"]).reset_index(drop=True)
    
    # 1. Time-Series Historical Aggregations (Grouped per customer across all transaction events)
    tx_amount = _col(df, "amount")
    days_gap = _col(df, "days_since_prev_tx")
    
    tx_aggregations = df.groupby("customer_id").agg(
        total_transaction_count=("customer_id", "count"),
        total_historical_spend=("amount", "sum") if "amount" in df.columns else ("yearly_income", "count"),
        avg_transaction_amount=("amount", "mean") if "amount" in df.columns else ("yearly_income", "count"),
        max_transaction_amount=("amount", "max") if "amount" in df.columns else ("yearly_income", "count"),
        min_transaction_amount=("amount", "min") if "amount" in df.columns else ("yearly_income", "count"),
        spend_volatility_std=("amount", lambda x: float(x.std()) if len(x) > 1 else 0.0) if "amount" in df.columns else ("yearly_income", "count"),
        avg_days_between_tx=("days_since_prev_tx", "mean") if "days_since_prev_tx" in df.columns else ("yearly_income", "count")
    ).reset_index()
    
    # 2. Get Most Recent Snapshot per Customer (Latest chronological record)
    if "date" in df.columns:
        df_latest = df.sort_values(by=["customer_id", "date"]).groupby("customer_id").last().reset_index()
    else:
        df_latest = df.groupby("customer_id").last().reset_index()
        
    # Merge Latest Snapshot with Time-Series Aggregations
    merged = pd.merge(df_latest, tx_aggregations, on="customer_id", how="left")
    
    # Extract Snapshot & Behavioral Metrics
    income = _col(merged, "yearly_income")
    per_capita_inc = _col(merged, "per_capita_income")
    debt = _col(merged, "total_debt")
    credit = _col(merged, "credit_score")
    dti = debt / income.replace(0, 1)
    
    savings = _col(merged, "savings_balance")
    current = _col(merged, "current_balance")
    investment = _col(merged, "investment_balance")
    loan_out = _col(merged, "loan_outstanding")
    net_worth = savings + current + investment - debt
    
    age = _col(merged, "current_age")
    gender_numeric = merged["gender"].astype(str).str.upper().map({"M": 1, "MALE": 1}).fillna(0) if "gender" in merged.columns else pd.Series(0, index=merged.index)
    tenure = _col(merged, "customer_since_years")
    
    products = _col(merged, "total_products")
    penetration = _col(merged, "product_penetration")
    has_cc = _col(merged, "has_credit_card")
    has_home = _col(merged, "has_home_loan")
    has_personal = _col(merged, "has_personal_loan")
    has_mf = _col(merged, "has_mutual_funds")
    has_ins = _col(merged, "has_insurance")
    
    spend = _col(merged, "average_monthly_spend")
    shopping_ratio = _col(merged, "shopping_ratio")
    travel_ratio = _col(merged, "travel_ratio")
    food_ratio = _col(merged, "food_ratio")
    healthcare_ratio = _col(merged, "healthcare_ratio")
    cash_dep = _col(merged, "cash_dependency")
    
    mobile_logins = _col(merged, "mobile_login_count")
    net_logins = _col(merged, "internet_banking_login")
    upi = _col(merged, "upi_transactions")
    atm = _col(merged, "atm_transactions")
    branch = _col(merged, "branch_visits")
    digital_phys_ratio = _col(merged, "digital_physical_ratio")
    salary_freq = _col(merged, "salary_credit_frequency")
    last_login = _col(merged, "last_login_days")
    
    tx_count = _col(merged, "total_transaction_count")
    avg_tx = _col(merged, "avg_transaction_amount")

    # 3. Derived Business & Persona Scores
    activity = _scale(upi + mobile_logins * 2 + net_logins + tx_count)
    digital = _scale(upi + mobile_logins * 2 - branch)
    financial_health = np.clip(0.35 * _scale(credit) + 0.35 * _scale(net_worth) + 0.30 * (100 - _scale(dti)), 0, 100)
    investment_readiness = np.clip(0.45 * _scale(income) + 0.30 * _scale(investment) + 0.25 * _scale(credit), 0, 100)
    premium = np.clip(0.30 * _scale(income) + 0.25 * _scale(net_worth) + 0.20 * _scale(credit) + 0.15 * _scale(products) + 0.10 * activity, 0, 100)
    dormancy = np.clip(_scale(last_login) - activity * 0.25, 0, 100)
    loyalty = _scale(tenure + products)
    cross_sell = np.clip((100 - _scale(products)) * 0.45 + investment_readiness * 0.55, 0, 100)
    
    customer_matrix = pd.DataFrame({
        "customer_id": merged["customer_id"],
        "city": merged.get("merchant_city", pd.Series("Unknown", index=merged.index)).astype(str),
        "state": merged.get("merchant_state", pd.Series("Unknown", index=merged.index)).astype(str),
        
        # Demographics & Snapshot
        "current_age": age,
        "gender_numeric": gender_numeric,
        "customer_since_years": tenure,
        "yearly_income": income,
        "per_capita_income": per_capita_inc,
        "total_debt": debt,
        "debt_to_income_ratio": dti.round(4),
        "credit_score": credit,
        
        # Time-Series Aggregations (from all transaction events)
        "total_transaction_count": tx_count,
        "total_historical_spend": _col(merged, "total_historical_spend").round(2),
        "avg_transaction_amount": avg_tx.round(2),
        "max_transaction_amount": _col(merged, "max_transaction_amount").round(2),
        "min_transaction_amount": _col(merged, "min_transaction_amount").round(2),
        "spend_volatility_std": _col(merged, "spend_volatility_std").round(2),
        "avg_days_between_tx": _col(merged, "avg_days_between_tx").round(2),
        
        # Balances & Wealth
        "savings_balance": savings,
        "current_balance": current,
        "investment_balance": investment,
        "loan_outstanding": loan_out,
        "net_worth_estimate": net_worth,
        
        # Products
        "total_products": products,
        "product_penetration": penetration,
        "has_credit_card": has_cc,
        "has_home_loan": has_home,
        "has_personal_loan": has_personal,
        "has_mutual_funds": has_mf,
        "has_insurance": has_ins,
        
        # Spending & Behavioral Channels
        "average_monthly_spend": spend,
        "shopping_ratio": shopping_ratio,
        "travel_ratio": travel_ratio,
        "food_ratio": food_ratio,
        "healthcare_ratio": healthcare_ratio,
        "cash_dependency": cash_dep,
        "mobile_login_count": mobile_logins,
        "internet_banking_login": net_logins,
        "upi_transactions": upi,
        "atm_transactions": atm,
        "branch_visits": branch,
        "digital_physical_ratio": digital_phys_ratio,
        "salary_credit_frequency": salary_freq,
        "last_login_days": last_login,
        
        # Derived AI Scores
        "activity_score": activity.round(2),
        "digital_adoption_score": digital.round(2),
        "financial_health": financial_health.round(2),
        "investment_readiness": investment_readiness.round(2),
        "premium_potential": premium.round(2),
        "dormancy_score": dormancy.round(2),
        "loyalty_score": loyalty.round(2),
        "cross_sell_score": cross_sell.round(2),
    })
    
    return customer_matrix.drop_duplicates("customer_id").reset_index(drop=True)
