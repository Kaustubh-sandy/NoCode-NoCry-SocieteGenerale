# Bank360 AI: Local Setup & Run Guide

Step-by-step instructions to run the AI backend locally on your machine.

---

## Prerequisites

- Python 3.10+
- pip

---

## Step 1: Create & Activate Virtual Environment

```powershell
cd AI
python -m venv .venv
.venv\Scripts\activate
```

---

## Step 2: Install Dependencies

```powershell
pip install -r requirements.txt
```

---

## Step 3: Dataset Enrichment Pipeline

Takes the raw `Customer_financial_profiles.csv` (20K rows, 21 columns) and enriches it to **75 columns** using business-rule-based generation (not random values). Every new column is derived from existing customer attributes like income, age, credit score, and debt.

```powershell
python dataset.py
```

**Input:** `Customer_financial_profiles.csv`
**Output:** `Enriched_Customer_financial_profiles.csv`

New columns added include:

| Category           | Examples                                                      |
| ------------------ | ------------------------------------------------------------- |
| Banking Profile    | `account_type`, `customer_segment`, `customer_since_years`    |
| Banking Products   | `has_home_loan`, `has_mutual_funds`, `has_insurance` (9 flags)|
| Account Balances   | `savings_balance`, `investment_balance`, `loan_outstanding`   |
| Digital Banking    | `mobile_login_count`, `upi_transactions`, `atm_transactions` |
| Behaviour          | `average_monthly_spend`, `shopping_ratio`, `cash_dependency`  |
| Marketing          | `campaign_response`, `offers_received`, `preferred_product`   |
| AI Scores          | `financial_health_score`, `churn_risk`, `premium_potential_score` |

---

## Step 4: Model Training Pipeline

Preprocesses the enriched dataset, generates feature store metrics, trains the K-Means clustering model, and saves artifacts to `models/` and `feature_store/`.

```powershell
python model_train.py
```

---

## Step 5: Start the API Server

Launches the FastAPI multi-agent backend API serving the AI usecases.

> If model artifacts are missing, this automatically triggers Step 4 (training) first.

```powershell
python start_be.py
```

- **API Server:** `http://127.0.0.1:8000`
- **Swagger Docs:** `http://127.0.0.1:8000/docs`

---

## Optional: Direct CLI Queries

```powershell
python main.py query "Find premium customers in Bangalore"
```

---

## Quick Start (All Steps)

```powershell
cd AI
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python dataset.py
python model_train.py
python start_be.py
```
