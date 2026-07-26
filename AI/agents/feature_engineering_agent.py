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
    Ingests all 20,000 transaction records, groups by client_id, and computes:
    - Latest Financial Snapshot (Income, Balances, Debt, Credit Score)
    - Historical Transaction Aggregations (Total Spend, Count, Avg, Max, Min, Volatility)
    - Digital Channel Velocity & Category Spending Ratios
    - Business & Persona Derived Scores
    """
    df = df.copy()
    id_col = "client_id" if "client_id" in df.columns else "id"
    df["customer_id"] = df[id_col].astype(str)
    
    # 1. Historical Transaction Aggregations (grouped by customer_id)
    tx_amount = _col(df, "amount")
    
    tx_aggregations = df.groupby("customer_id").agg(
        total_transaction_count=("customer_id", "count"),
        total_historical_spend=(tx_amount.name if hasattr(tx_amount, 'name') and tx_amount.name in df.columns else "amount", "sum"),
        avg_transaction_amount=(tx_amount.name if hasattr(tx_amount, 'name') and tx_amount.name in df.columns else "amount", "mean"),
        max_transaction_amount=(tx_amount.name if hasattr(tx_amount, 'name') and tx_amount.name in df.columns else "amount", "max"),
        min_transaction_amount=(tx_amount.name if hasattr(tx_amount, 'name') and tx_amount.name in df.columns else "amount", "min"),
        spend_volatility_std=(tx_amount.name if hasattr(tx_amount, 'name') and tx_amount.name in df.columns else "amount", lambda x: float(x.std()) if len(x) > 1 else 0.0)
    ).reset_index()
    
    # 2. Get Most Recent Snapshot per Customer (Last chronological record)
    if "date" in df.columns:
        df_latest = df.sort_values(by=["customer_id", "date"]).groupby("customer_id").last().reset_index()
    else:
        df_latest = df.groupby("customer_id").last().reset_index()
        
    # Merge Latest Snapshot with Time-Series Aggregations
    merged = pd.merge(df_latest, tx_aggregations, on="customer_id", how="left")
    
    # Extract Latest Snapshot Fields
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
    
    # 3. Derived Business Scores
    activity = _scale(upi + mobile_logins * 2 + net_logins)
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
        
        # A. Latest Demographics & Snapshot
        "current_age": age,
        "gender_numeric": gender_numeric,
        "customer_since_years": tenure,
        "yearly_income": income,
        "per_capita_income": per_capita_inc,
        "total_debt": debt,
        "debt_to_income_ratio": dti.round(4),
        "credit_score": credit,
        
        # B. Historical Transaction Aggregations (From all 20k rows)
        "total_transaction_count": _col(merged, "total_transaction_count"),
        "total_historical_spend": _col(merged, "total_historical_spend").round(2),
        "avg_transaction_amount": _col(merged, "avg_transaction_amount").round(2),
        "max_transaction_amount": _col(merged, "max_transaction_amount").round(2),
        "min_transaction_amount": _col(merged, "min_transaction_amount").round(2),
        "spend_volatility_std": _col(merged, "spend_volatility_std").round(2),
        
        # C. Balances & Wealth
        "savings_balance": savings,
        "current_balance": current,
        "investment_balance": investment,
        "loan_outstanding": loan_out,
        "net_worth_estimate": net_worth,
        
        # D. Products
        "total_products": products,
        "product_penetration": penetration,
        "has_credit_card": has_cc,
        "has_home_loan": has_home,
        "has_personal_loan": has_personal,
        "has_mutual_funds": has_mf,
        "has_insurance": has_ins,
        
        # E. Spending & Channel Behavior
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
        
        # F. Derived Scores
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
