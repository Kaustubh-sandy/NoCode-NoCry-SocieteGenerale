"""
=============================================================================
 Bank360 Dataset Enrichment Pipeline
=============================================================================
 Reads the raw Customer_financial_profiles.csv (20k rows, 21 cols)
 and enriches it to ~60 columns using BUSINESS-RULE-BASED generation.
 
 NO random noise without anchoring — every new column depends on existing
 customer attributes (income, age, credit_score, debt, etc.).
 
 Output : Enriched_Customer_financial_profiles.csv
=============================================================================
"""

import pandas as pd
import numpy as np
from pathlib import Path

# ── reproducibility ──────────────────────────────────────────────────────────
np.random.seed(42)

# ── file paths ───────────────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parent
INPUT_CSV  = BASE_DIR / "Customer_financial_profiles.csv"
OUTPUT_CSV = BASE_DIR / "Enriched_Customer_financial_profiles.csv"


# =============================================================================
#  Helper Utilities
# =============================================================================

def clip(series, lo=0, hi=None):
    """Clip a series/array to [lo, hi] range."""
    s = np.clip(series, lo, hi if hi is not None else np.inf)
    if isinstance(s, np.ndarray):
        return pd.Series(s) if isinstance(series, pd.Series) else s
    return s


def norm_score(series, lo=0, hi=100):
    """Min-max normalise a series to [lo, hi]."""
    mn, mx = series.min(), series.max()
    if mx == mn:
        return pd.Series(lo, index=series.index)
    return lo + (series - mn) / (mx - mn) * (hi - lo)


def biased_bool(prob_series):
    """Return boolean Series where True probability = prob_series (0-1)."""
    return np.random.random(len(prob_series)) < prob_series


# =============================================================================
#  1.  Derived Base Columns
# =============================================================================

def add_derived_base(df):
    """Add monthly_income and helper ratios used by many downstream columns."""
    df["monthly_income"] = (df["yearly_income"] / 12).round(2)

    # Debt-to-income ratio (0-1 scale, higher = more stressed)
    df["debt_to_income_ratio"] = clip(
        df["total_debt"] / df["yearly_income"].replace(0, 1), hi=1.0
    ).round(4)

    # Normalised credit score (0-1 scale for formula use)
    df["_cs_norm"] = (df["credit_score"] - 300) / 600  # 300-900 → 0-1

    # Normalised age  (19-70 → 0-1)
    df["_age_norm"] = (df["current_age"] - 19) / 51

    # Normalised income (0-1)
    df["_inc_norm"] = norm_score(df["yearly_income"], 0, 1)

    return df


# =============================================================================
#  2.  Customer Banking Profile
# =============================================================================

def generate_banking_profile(df):
    """
    account_type, customer_since_years, customer_segment,
    preferred_channel, branch_id
    """
    n = len(df)

    # ── account_type: higher income → savings+current, else savings ──────
    conditions = [
        df["yearly_income"] >= 1_500_000,
        df["yearly_income"] >= 600_000,
    ]
    choices = ["Savings + Current", "Savings + Current"]
    df["account_type"] = np.select(conditions, choices, default="Savings")

    # ── customer_since_years: older people tend to be longer customers ───
    max_tenure = clip(df["current_age"] - 18, lo=1, hi=40)
    df["customer_since_years"] = (
        max_tenure * np.random.uniform(0.3, 0.95, n)
    ).astype(int).clip(lower=1)

    # ── customer_segment: based on income + credit score ─────────────────
    seg_score = 0.6 * df["_inc_norm"] + 0.4 * df["_cs_norm"]
    df["customer_segment"] = pd.cut(
        seg_score,
        bins=[-0.01, 0.30, 0.55, 0.80, 1.01],
        labels=["Mass", "Mass Affluent", "Affluent", "HNI"],
    )

    # ── preferred_channel: young → digital, old → branch ─────────────────
    digital_prob = 1 - df["_age_norm"] * 0.7
    df["preferred_channel"] = np.where(
        biased_bool(digital_prob), "Digital", "Branch"
    )

    # ── branch_id: derived from zip ──────────────────────────────────────
    df["branch_id"] = "BR" + (df["zip"] % 500 + 1).astype(str).str.zfill(4)

    return df


# =============================================================================
#  3.  Banking Products (has_*)
# =============================================================================

def generate_products(df):
    """
    Boolean flags for 9 banking products.
    Each probability depends on customer attributes.
    """
    age = df["current_age"]
    inc = df["yearly_income"]
    cs  = df["credit_score"]
    debt = df["total_debt"]

    # ── Savings account: almost everyone ─────────────────────────────────
    df["has_savings_account"] = True

    # ── Current account: income > 6L ─────────────────────────────────────
    df["has_current_account"] = biased_bool(
        clip(df["_inc_norm"] * 0.8 + df["_cs_norm"] * 0.2, hi=0.85)
    )

    # ── Credit card: already have num_credit_cards ───────────────────────
    df["has_credit_card"] = df["num_credit_cards"] > 0

    # ── Personal loan: higher if has debt + mid income ───────────────────
    pl_prob = clip(
        0.15 + 0.35 * df["debt_to_income_ratio"] + 0.10 * (1 - df["_cs_norm"]),
        hi=0.70,
    )
    df["has_personal_loan"] = biased_bool(pl_prob)

    # ── Home loan: age 25-55, income > 5L ────────────────────────────────
    hl_prob = clip(
        np.where(
            (age >= 25) & (age <= 55) & (inc >= 500_000),
            0.20 + 0.40 * df["_inc_norm"] + 0.15 * df["_cs_norm"],
            0.03,
        ),
        hi=0.65,
    )
    df["has_home_loan"] = biased_bool(hl_prob)

    # ── Car loan: age 25-60, income > 4L ─────────────────────────────────
    cl_prob = clip(
        np.where(
            (age >= 25) & (age <= 60) & (inc >= 400_000),
            0.10 + 0.30 * df["_inc_norm"],
            0.02,
        ),
        hi=0.50,
    )
    df["has_car_loan"] = biased_bool(cl_prob)

    # ── Fixed deposit: older + higher savings tendency ───────────────────
    fd_prob = clip(0.10 + 0.30 * df["_age_norm"] + 0.20 * df["_cs_norm"], hi=0.70)
    df["has_fixed_deposit"] = biased_bool(fd_prob)

    # ── Recurring deposit ────────────────────────────────────────────────
    rd_prob = clip(0.08 + 0.15 * df["_age_norm"] + 0.15 * df["_inc_norm"], hi=0.50)
    df["has_recurring_deposit"] = biased_bool(rd_prob)

    # ── Insurance: age 28+, income > 3L ──────────────────────────────────
    ins_prob = clip(
        np.where(
            (age >= 28) & (inc >= 300_000),
            0.15 + 0.25 * df["_age_norm"] + 0.20 * df["_inc_norm"],
            0.05,
        ),
        hi=0.65,
    )
    df["has_insurance"] = biased_bool(ins_prob)

    # ── Mutual funds: age 25-60, income > 4L, good credit ───────────────
    mf_prob = clip(
        np.where(
            (age >= 25) & (age <= 60) & (inc >= 400_000) & (cs >= 650),
            0.10 + 0.35 * df["_inc_norm"] + 0.20 * df["_cs_norm"],
            0.03,
        ),
        hi=0.60,
    )
    df["has_mutual_funds"] = biased_bool(mf_prob)

    # ── Total products count (used later) ────────────────────────────────
    product_cols = [c for c in df.columns if c.startswith("has_")]
    df["total_products"] = df[product_cols].sum(axis=1)

    return df


# =============================================================================
#  4.  Account Balances
# =============================================================================

def generate_balances(df):
    """
    savings_balance, current_balance, investment_balance,
    loan_outstanding, monthly_emi
    """
    n = len(df)
    mi = df["monthly_income"]

    # ── Savings balance: 2-10x monthly income, boosted by credit score ───
    savings_mult = 2 + 8 * df["_cs_norm"] * np.random.uniform(0.5, 1.0, n)
    df["savings_balance"] = (mi * savings_mult).round(2)

    # ── Current balance: only meaningful if has_current_account ───────────
    df["current_balance"] = np.where(
        df["has_current_account"],
        (mi * np.random.uniform(0.5, 3.0, n) * (1 + df["_inc_norm"])).round(2),
        0,
    )

    # ── Investment balance: income + credit + age driven ─────────────────
    inv_factor = (
        0.4 * df["_inc_norm"]
        + 0.3 * df["_cs_norm"]
        + 0.3 * df["_age_norm"]
    )
    df["investment_balance"] = np.where(
        df["has_mutual_funds"] | df["has_fixed_deposit"],
        (df["yearly_income"] * inv_factor * np.random.uniform(0.3, 1.5, n)).round(2),
        0,
    )

    # ── Loan outstanding: based on active loans + debt ───────────────────
    has_any_loan = (
        df["has_personal_loan"] | df["has_home_loan"] | df["has_car_loan"]
    )
    # Loan outstanding is anchored to total_debt but can exceed for home loans
    home_loan_mult = np.where(df["has_home_loan"], np.random.uniform(3, 8, n), 1)
    df["loan_outstanding"] = np.where(
        has_any_loan,
        clip(df["total_debt"] * home_loan_mult * np.random.uniform(0.8, 1.2, n)).round(2),
        0,
    )

    # ── Monthly EMI: typically 5-15% of income if loan exists ────────────
    emi_ratio = np.where(
        has_any_loan,
        np.random.uniform(0.05, 0.15, n) * (1 + 0.3 * df["debt_to_income_ratio"]),
        0,
    )
    df["monthly_emi"] = (df["monthly_income"] * emi_ratio).round(2)

    return df


# =============================================================================
#  5.  Digital Banking Usage
# =============================================================================

def generate_digital_usage(df):
    """
    mobile_login_count, internet_banking_login, upi_transactions,
    atm_transactions, branch_visits, last_login_days
    """
    n   = len(df)
    age = df["current_age"]

    # Digital affinity: young → high, old → low
    digital_affinity = clip(1 - (age - 19) / 51 * 0.85, lo=0.10, hi=1.0)

    # ── Mobile logins / month ────────────────────────────────────────────
    df["mobile_login_count"] = (
        digital_affinity * np.random.uniform(60, 120, n)
    ).astype(int)

    # ── Internet banking logins / month ──────────────────────────────────
    df["internet_banking_login"] = (
        digital_affinity * np.random.uniform(10, 40, n) * 0.8
    ).astype(int)

    # ── UPI transactions / month ─────────────────────────────────────────
    df["upi_transactions"] = (
        digital_affinity * np.random.uniform(15, 80, n)
    ).astype(int)

    # ── ATM transactions / month: inverse of digital ─────────────────────
    atm_affinity = clip(1 - digital_affinity + 0.15, lo=0.10, hi=1.0)
    df["atm_transactions"] = (
        atm_affinity * np.random.uniform(2, 12, n)
    ).astype(int)

    # ── Branch visits / month: older → more visits ───────────────────────
    df["branch_visits"] = (
        atm_affinity * np.random.uniform(0, 5, n)
    ).astype(int)

    # ── Last login days ago: digital people log in recently ──────────────
    df["last_login_days"] = (
        (1 - digital_affinity) * np.random.uniform(0, 30, n)
    ).astype(int)

    return df


# =============================================================================
#  6.  Behavioural Spending Ratios
# =============================================================================

def generate_behaviour(df):
    """
    salary_credit_frequency, average_monthly_spend,
    shopping_ratio, travel_ratio, food_ratio,
    healthcare_ratio, cash_dependency
    """
    n  = len(df)
    mi = df["monthly_income"]

    # ── Salary credit frequency (times/month: 1 or 2) ────────────────────
    df["salary_credit_frequency"] = np.where(
        df["yearly_income"] >= 800_000, 1, np.random.choice([1, 2], n, p=[0.8, 0.2])
    )

    # ── Average monthly spend: 40-85% of monthly income ──────────────────
    spend_ratio = 0.40 + 0.45 * (1 - df["_cs_norm"]) * np.random.uniform(0.6, 1.0, n)
    df["average_monthly_spend"] = (mi * spend_ratio).round(2)

    # ── Spending category ratios (must sum to ~1.0) ──────────────────────
    #    Young → more shopping/food, Old → more healthcare
    age_factor = df["_age_norm"]

    raw_shopping    = clip(0.30 - 0.10 * age_factor + np.random.uniform(-0.05, 0.05, n))
    raw_travel      = clip(0.10 + 0.08 * df["_inc_norm"] + np.random.uniform(-0.03, 0.03, n))
    raw_food        = clip(0.25 - 0.05 * age_factor + np.random.uniform(-0.03, 0.03, n))
    raw_healthcare  = clip(0.08 + 0.15 * age_factor + np.random.uniform(-0.03, 0.03, n))

    total = raw_shopping + raw_travel + raw_food + raw_healthcare
    df["shopping_ratio"]    = (raw_shopping   / total).round(4)
    df["travel_ratio"]      = (raw_travel     / total).round(4)
    df["food_ratio"]        = (raw_food       / total).round(4)
    df["healthcare_ratio"]  = (raw_healthcare / total).round(4)

    # ── Cash dependency: inverse of digital adoption ─────────────────────
    digital_affinity = clip(1 - (df["current_age"] - 19) / 51 * 0.85, lo=0.10)
    df["cash_dependency"] = (
        clip(1 - digital_affinity + np.random.uniform(-0.1, 0.1, n), lo=0.05, hi=0.95)
    ).round(4)

    return df


# =============================================================================
#  7.  Marketing
# =============================================================================

def generate_marketing(df):
    """
    last_campaign, campaign_response, offers_received,
    offers_accepted, preferred_product
    """
    n = len(df)

    # ── Offers received: higher segment → more offers ────────────────────
    seg_map = {"Mass": 2, "Mass Affluent": 4, "Affluent": 6, "HNI": 8}
    base_offers = df["customer_segment"].astype(str).map(seg_map).fillna(3).astype(int)
    df["offers_received"] = (
        base_offers + np.random.randint(0, 4, n)
    ).clip(upper=15)

    # ── Offers accepted: depends on credit score + income ────────────────
    accept_rate = clip(
        0.15 + 0.35 * df["_cs_norm"] + 0.20 * df["_inc_norm"]
        + np.random.uniform(-0.10, 0.10, n),
        lo=0.05, hi=0.90,
    )
    df["offers_accepted"] = (df["offers_received"] * accept_rate).astype(int)

    # ── Campaign response (boolean): higher for affluent ─────────────────
    response_prob = clip(
        0.10 + 0.30 * df["_inc_norm"] + 0.20 * df["_cs_norm"], hi=0.70
    )
    df["campaign_response"] = biased_bool(response_prob)

    # ── Last campaign type ───────────────────────────────────────────────
    campaigns = [
        "Credit Card Upgrade", "Personal Loan Offer", "FD Promotion",
        "Insurance Cross-sell", "Mutual Fund SIP", "Premium Account",
        "Digital Onboarding", "Festive Cashback",
    ]
    df["last_campaign"] = np.random.choice(campaigns, n)

    # ── Preferred product: rule-based ────────────────────────────────────
    conditions = [
        (df["yearly_income"] >= 2_000_000) & (df["credit_score"] >= 780),
        df["has_mutual_funds"],
        df["has_home_loan"],
        df["has_personal_loan"],
        df["current_age"] >= 55,
    ]
    choices = [
        "Wealth Management",
        "Mutual Funds",
        "Home Loan Top-up",
        "Debt Consolidation",
        "Fixed Deposit",
    ]
    df["preferred_product"] = np.select(
        conditions, choices, default="Credit Card"
    )

    return df


# =============================================================================
#  8.  AI / Analytical Scores  (0-100 scale)
# =============================================================================

def generate_scores(df):
    """
    financial_health_score, digital_adoption_score, loyalty_score,
    activity_score, premium_potential_score, cross_sell_score,
    investment_readiness, churn_risk
    """
    n = len(df)

    # ── Financial Health Score ────────────────────────────────────────────
    #    40% credit score + 30% savings ratio + 30% (1 - debt ratio)
    savings_ratio = clip(
        df["savings_balance"] / df["yearly_income"].replace(0, 1), hi=1.0
    )
    fh = (
        0.40 * df["_cs_norm"]
        + 0.30 * savings_ratio
        + 0.30 * (1 - df["debt_to_income_ratio"])
    )
    df["financial_health_score"] = norm_score(fh, 0, 100).round(1)

    # ── Digital Adoption Score ───────────────────────────────────────────
    max_mobile = df["mobile_login_count"].max() or 1
    max_upi    = df["upi_transactions"].max() or 1
    max_ib     = df["internet_banking_login"].max() or 1
    da = (
        0.40 * df["mobile_login_count"]  / max_mobile
        + 0.30 * df["upi_transactions"]  / max_upi
        + 0.30 * df["internet_banking_login"] / max_ib
    )
    df["digital_adoption_score"] = norm_score(da, 0, 100).round(1)

    # ── Loyalty Score ────────────────────────────────────────────────────
    #    50% tenure + 30% products + 20% campaign response
    max_tenure   = df["customer_since_years"].max() or 1
    max_products = df["total_products"].max() or 1
    loyalty = (
        0.50 * df["customer_since_years"] / max_tenure
        + 0.30 * df["total_products"] / max_products
        + 0.20 * df["campaign_response"].astype(float)
    )
    df["loyalty_score"] = norm_score(loyalty, 0, 100).round(1)

    # ── Activity Score ───────────────────────────────────────────────────
    max_atm    = df["atm_transactions"].max() or 1
    max_branch = df["branch_visits"].max() or 1
    activity = (
        0.30 * df["mobile_login_count"] / max_mobile
        + 0.25 * df["upi_transactions"]  / max_upi
        + 0.20 * df["internet_banking_login"] / max_ib
        + 0.15 * df["atm_transactions"]  / max_atm
        + 0.10 * df["branch_visits"]     / max_branch
    )
    df["activity_score"] = norm_score(activity, 0, 100).round(1)

    # ── Premium Potential Score ──────────────────────────────────────────
    premium = (
        0.35 * df["_inc_norm"]
        + 0.25 * savings_ratio
        + 0.20 * df["_cs_norm"]
        + 0.10 * df["total_products"] / max_products
        + 0.10 * (df["investment_balance"] / df["investment_balance"].max().clip(min=1))
    )
    df["premium_potential_score"] = norm_score(premium, 0, 100).round(1)

    # ── Cross-sell Score ─────────────────────────────────────────────────
    #    Higher if fewer products but high income/credit
    product_gap = 1 - df["total_products"] / 10  # out of 10 possible products
    cross = (
        0.40 * product_gap
        + 0.30 * df["_inc_norm"]
        + 0.30 * df["_cs_norm"]
    )
    df["cross_sell_score"] = norm_score(cross, 0, 100).round(1)

    # ── Investment Readiness ─────────────────────────────────────────────
    inv_ready = np.where(
        (df["current_age"] >= 25) & (df["current_age"] <= 60),
        0.40 * df["_inc_norm"]
        + 0.30 * df["_cs_norm"]
        + 0.20 * savings_ratio
        + 0.10 * (1 - df["debt_to_income_ratio"]),
        0.05 + 0.20 * df["_inc_norm"],
    )
    df["investment_readiness"] = norm_score(pd.Series(inv_ready, index=df.index), 0, 100).round(1)

    # ── Churn Risk ───────────────────────────────────────────────────────
    #    Inverse of activity + products + loyalty + savings
    churn_raw = (
        0.30 * (1 - activity)
        + 0.25 * (1 - df["total_products"] / max_products)
        + 0.25 * (1 - loyalty)
        + 0.20 * (1 - savings_ratio)
    )
    # Add small noise so it's not perfectly deterministic
    churn_raw += np.random.uniform(-0.03, 0.03, n)
    df["churn_risk"] = norm_score(clip(churn_raw, lo=0, hi=1), 0, 100).round(1)

    return df


# =============================================================================
#  9.  Feature Engineering (composite features for ML readiness)
# =============================================================================

def feature_engineering(df):
    """Add a few derived composite features useful for downstream ML."""

    # ── Savings-to-Debt ratio ────────────────────────────────────────────
    df["savings_to_debt_ratio"] = (
        df["savings_balance"] / df["total_debt"].replace(0, 1)
    ).round(4)

    # ── Digital vs Physical preference (positive = digital) ──────────────
    df["digital_physical_ratio"] = (
        (df["mobile_login_count"] + df["upi_transactions"])
        / (df["atm_transactions"] + df["branch_visits"] + 1)
    ).round(2)

    # ── Product penetration (fraction of 10 possible products) ───────────
    df["product_penetration"] = (df["total_products"] / 10).round(2)

    # ── Income bracket label ─────────────────────────────────────────────
    df["income_bracket"] = pd.cut(
        df["yearly_income"],
        bins=[0, 300_000, 600_000, 1_200_000, 2_500_000, float("inf")],
        labels=["Low", "Lower-Mid", "Mid", "Upper-Mid", "High"],
    )

    # ── Age group label ──────────────────────────────────────────────────
    df["age_group"] = pd.cut(
        df["current_age"],
        bins=[0, 25, 35, 45, 55, 100],
        labels=["Gen-Z", "Young Professional", "Mid-Career", "Senior", "Retiree"],
    )

    return df


# =============================================================================
#  10.  Cleanup & Save
# =============================================================================

def cleanup(df):
    """Drop internal helper columns and reorder for readability."""
    df.drop(columns=["_cs_norm", "_age_norm", "_inc_norm"], inplace=True)
    
    # Define a clean column order grouped by category
    ordered_cols = [
        # ── Customer Information ──
        "id", "current_age", "age_group", "birth_year", "birth_month",
        "gender", "address", "zip",

        # ── Financial Information ──
        "yearly_income", "monthly_income", "income_bracket",
        "per_capita_income", "total_debt", "debt_to_income_ratio",
        "credit_score", "num_credit_cards",

        # ── Banking Profile ──
        "account_type", "customer_since_years", "customer_segment",
        "preferred_channel", "branch_id",

        # ── Banking Products ──
        "has_savings_account", "has_current_account", "has_credit_card",
        "has_personal_loan", "has_home_loan", "has_car_loan",
        "has_fixed_deposit", "has_recurring_deposit",
        "has_insurance", "has_mutual_funds", "total_products",
        "product_penetration",

        # ── Account Balances ──
        "savings_balance", "current_balance", "investment_balance",
        "loan_outstanding", "monthly_emi",
        "savings_to_debt_ratio",

        # ── Transaction Info ──
        "transaction_id", "date", "client_id", "card_id",
        "amount", "use_chip", "merchant_id",
        "merchant_city", "merchant_state",

        # ── Behaviour ──
        "salary_credit_frequency", "average_monthly_spend",
        "shopping_ratio", "travel_ratio", "food_ratio",
        "healthcare_ratio", "cash_dependency",

        # ── Digital Banking ──
        "mobile_login_count", "internet_banking_login",
        "upi_transactions", "atm_transactions",
        "branch_visits", "last_login_days",
        "digital_physical_ratio",

        # ── Marketing ──
        "last_campaign", "campaign_response",
        "offers_received", "offers_accepted",
        "preferred_product",

        # ── AI Scores ──
        "financial_health_score", "digital_adoption_score",
        "loyalty_score", "activity_score",
        "premium_potential_score", "cross_sell_score",
        "investment_readiness", "churn_risk",
    ]

    # Keep only columns that exist (safety)
    final_cols = [c for c in ordered_cols if c in df.columns]
    # Append any extra columns not in our list
    extra = [c for c in df.columns if c not in final_cols]
    df = df[final_cols + extra]

    return df


# =============================================================================
#  MAIN PIPELINE
# =============================================================================

def main():
    print("=" * 60)
    print("  Bank360 Dataset Enrichment Pipeline")
    print("=" * 60)

    # ── Load ─────────────────────────────────────────────────────────────
    print(f"\n>> Loading   : {INPUT_CSV.name}")
    df = pd.read_csv(INPUT_CSV)
    print(f"   Rows      : {len(df):,}")
    print(f"   Columns   : {len(df.columns)}")

    # -- Enrich --
    steps = [
        ("Derived base columns",   add_derived_base),
        ("Banking profile",        generate_banking_profile),
        ("Banking products",       generate_products),
        ("Account balances",       generate_balances),
        ("Digital banking usage",  generate_digital_usage),
        ("Behavioural spending",   generate_behaviour),
        ("Marketing",              generate_marketing),
        ("AI / Analytical scores", generate_scores),
        ("Feature engineering",    feature_engineering),
        ("Cleanup & reorder",      cleanup),
    ]

    for name, func in steps:
        df = func(df)
        print(f"   [OK] {name:<28s}  ->  {len(df.columns)} columns")

    # -- Save --
    df.to_csv(OUTPUT_CSV, index=False)
    print(f"\n>> Saved     : {OUTPUT_CSV.name}")
    print(f"   Rows      : {len(df):,}")
    print(f"   Columns   : {len(df.columns)}")

    # -- Summary --
    print("\n>> Column Groups:")
    groups = {
        "Customer Info":    ["id", "current_age", "age_group", "gender"],
        "Financial":        ["yearly_income", "monthly_income", "credit_score", "debt_to_income_ratio"],
        "Banking Profile":  ["account_type", "customer_segment", "customer_since_years"],
        "Products":         [c for c in df.columns if c.startswith("has_")],
        "Balances":         ["savings_balance", "current_balance", "investment_balance"],
        "Digital Banking":  ["mobile_login_count", "upi_transactions", "internet_banking_login"],
        "Behaviour":        ["average_monthly_spend", "shopping_ratio", "cash_dependency"],
        "Marketing":        ["campaign_response", "offers_received", "preferred_product"],
        "AI Scores":        ["financial_health_score", "churn_risk", "premium_potential_score"],
    }
    for group, cols in groups.items():
        existing = [c for c in cols if c in df.columns]
        print(f"   {group:<20s}: {len(existing)} columns")

    print("\n" + "=" * 60)
    print("  [OK]  Enrichment complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
