import numpy as np
import pandas as pd

def _col(df, name, fallback=0):
    return pd.to_numeric(df[name], errors="coerce").fillna(fallback) if name in df else pd.Series(fallback, index=df.index)

def _scale(value):
    lo, hi = value.min(), value.max()
    return pd.Series(50.0, index=value.index) if hi == lo else (value - lo) / (hi - lo) * 100

def build_features(df):
    customer_id = df["client_id"].astype(str) if "client_id" in df else df["id"].astype(str)
    income, savings, current, investment = (_col(df, c) for c in ["yearly_income", "savings_balance", "current_balance", "investment_balance"])
    debt, spend, products = (_col(df, c) for c in ["total_debt", "average_monthly_spend", "total_products"])
    credit, tenure, upi = (_col(df, c) for c in ["credit_score", "customer_since_years", "upi_transactions"])
    logins, last_login, branch = (_col(df, c) for c in ["mobile_login_count", "last_login_days", "branch_visits"])
    wealth = savings + current + investment - debt
    activity = _scale(upi + logins * 2 + _col(df, "internet_banking_login"))
    digital = _scale(upi + logins * 2 - branch)
    financial_health = np.clip(0.35*_scale(credit) + 0.35*_scale(wealth) + 0.30*(100-_scale(debt/(income.replace(0,1)))), 0, 100)
    investment_readiness = np.clip(0.45*_scale(income) + 0.30*_scale(investment) + 0.25*_scale(credit), 0, 100)
    premium = np.clip(0.30*_scale(income) + 0.25*_scale(wealth) + 0.20*_scale(credit) + 0.15*_scale(products) + 0.10*activity, 0, 100)
    result = pd.DataFrame({
        "customer_id": customer_id, "city": df.get("merchant_city", pd.Series("Unknown", index=df.index)).astype(str),
        "state": df.get("merchant_state", pd.Series("Unknown", index=df.index)).astype(str), "age": _col(df, "current_age"),
        "yearly_income": income, "savings_balance": savings, "current_balance": current, "investment_balance": investment,
        "total_debt": debt, "credit_score": credit, "total_products": products, "average_monthly_spend": spend,
        "transaction_frequency": _col(df, "salary_credit_frequency") + upi + _col(df, "atm_transactions"),
        "net_worth_estimate": wealth, "debt_ratio": debt / income.replace(0, 1), "activity_score": activity.round(2),
        "digital_adoption_score": digital.round(2), "financial_health": financial_health.round(2),
        "investment_readiness": investment_readiness.round(2), "premium_potential": premium.round(2),
        "dormancy_score": np.clip(_scale(last_login) - activity*0.25, 0, 100).round(2),
        "loyalty_score": _scale(tenure + products).round(2), "cross_sell_score": np.clip((100-_scale(products))*0.45 + investment_readiness*0.55, 0, 100).round(2),
    })
    return result.drop_duplicates("customer_id").reset_index(drop=True)
