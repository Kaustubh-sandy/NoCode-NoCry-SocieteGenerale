# Bank360 AI

**Customer Segmentation & Personalization Agent for Retail Banking**

A multi-agent, natural-language analytics platform that turns a raw 20,000-row bank transaction export into explainable customer segments, personas, and next-best-action recommendations — queried in plain English, with a full agent audit trail behind every answer.

Built for the Société Générale Hackathon — **Track SF-4**.

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)

📹 **[Demo video](https://www.loom.com/share/4405869054674e8b9ec264742998f4d7)** · 📄 [Full technical documentation](./PROJECT_PRD_AND_EXECUTION.md)

---

## Table of Contents

- [What it does](#what-it-does)
- [At a glance](#at-a-glance)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Detailed setup](#detailed-setup)
- [Environment variables](#environment-variables)
- [Using the app](#using-the-app)
- [API reference](#api-reference)
- [Project structure](#project-structure)
- [How the ML works](#how-the-ml-works)
- [Governance](#governance)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)

---

## What it does

A retail bank markets savings accounts, credit cards, loans and investments the same way to every customer. Bank360 AI replaces that with a system an analyst can simply *ask*:

> *"Find premium customers in Bangalore"*
> *"Which customers are at risk of churning?"*
> *"Show me income distribution statistics"*

A **Supervisor Agent** parses the question into an intent and entities, builds an execution plan, and dispatches **only the specialist agents that question actually needs** — not a fixed pipeline. Every response returns the answer, the supporting data, *and* a step-by-step audit trail of which agent ran and why.

**Key capabilities**

- 🔍 Automated EDA on demand (distributions, skew, kurtosis, outliers, cross-segment comparison)
- 👥 Unsupervised K-Means segmentation into 4 explainable personas
- 🎯 Rule-based next-best-action product recommendations with reason codes
- 💡 Segment-level (Z-score drivers) and customer-level explainability
- 🛡️ Human-in-the-loop governance gate on high-risk / low-confidence actions
- 📊 Plotly-compatible visualizations rendered in a Next.js banking console

## At a glance

| | |
|---|---|
| Raw transaction rows ingested | **20,000** |
| Source columns → enriched columns | **21 → 75** |
| Unique customer profiles | **~4,900** |
| Features used for clustering | **40** |
| Specialist AI agents | **14** |
| Explainable personas | **4** |
| Natural-language query intents | **8** |

**The four personas**

| Persona | Traits | Strategy |
|---|---|---|
| **Premium Investors** | High net worth, high investment balance, top premium-potential scores | Private banking, wealth advisory, exclusive premium cards |
| **Emerging Affluent** | Growing income, high digital adoption, expanding credit needs | Investment upsell, pre-approved credit |
| **Credit Borrowers** | High credit debt / loan balances needing management | Debt consolidation, refinancing, credit-builder offers |
| **Dormant Recovery** | Elevated dormancy, declining logins | Digital re-activation campaigns, retention incentives |

## Architecture

Two independently runnable layers sharing one feature store, and two distinct flows:

```
┌─────────────────────────────────────────────────────────────┐
│  UserInterface/banking  —  Next.js 16 + React 19 console    │
│  Dashboard · Customers · Insights · Admin                   │
└───────────────────────────┬─────────────────────────────────┘
                            │  POST /query
┌───────────────────────────▼─────────────────────────────────┐
│  AI/api  —  FastAPI                                         │
│                                                             │
│         ┌──────────────────────────────┐                    │
│         │   Supervisor Agent (0)       │                    │
│         │   intent + entity extraction │                    │
│         └──────────────┬───────────────┘                    │
│                        │  execution plan                    │
│      ┌─────────────────┼─────────────────┐                  │
│      ▼                 ▼                 ▼                  │
│  Data Foundation   Intelligence     Action & Trust          │
│  Data              Segmentation     Recommendation          │
│  Preprocessing     Persona          Insights                │
│  FeatureEng        Explainability   Human-in-the-Loop       │
│                    EDA              Visualization/Report    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                 models/ + feature_store/
```

**Flow 1 — Training** (`pipelines/train.py`, or `POST /train`): profile → clean → engineer features → fit K-Means → persist artifacts.

**Flow 2 — Serving** (`api/main.py`, `services/query_router.py`): stateless; plans and dispatches per query against the trained artifacts. Never retrains on a request.

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Python | 3.10+ | Backend |
| Node.js + npm | 18+ recommended | Frontend |
| Gemini API key | — | **Optional.** Falls back to deterministic rule-based narratives |

## Quick start

```bash
git clone https://github.com/Kaustubh-sandy/NoCode-NoCry-SocieteGenerale.git
cd NoCode-NoCry-SocieteGenerale
```

**Terminal 1 — backend**

```bash
cd AI
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python start_be.py
```

> The API auto-triggers the full training pipeline on first start if `models/` or `feature_store/` artifacts are missing — so a fresh clone needs nothing more than this. First boot takes longer while it trains.

**Terminal 2 — frontend**

```bash
cd UserInterface/banking
npm install
npm run dev
```

Open **http://localhost:3000** → the navbar status dot should read *online*.

| Service | URL |
|---|---|
| Console | http://localhost:3000 |
| API | http://127.0.0.1:8000 |
| Swagger docs | http://127.0.0.1:8000/docs |

## Detailed setup

Run the pipeline stages explicitly if you want to inspect each artifact, or force a rebuild.

### Backend (`AI/`)

```bash
cd AI
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 1. Enrich the raw export: 21 → 75 columns, all rule-derived (no random values)
python dataset.py

# 2. Train segmentation: profile → clean → feature-engineer → K-Means → persist
python model_train.py

# 3. Serve
python start_be.py
```

Artifacts written:

```
AI/models/            pickled KMeans model + StandardScaler
AI/feature_store/     Parquet + CSV feature store, persona & metadata JSON,
                      data_quality_report.json
```

### Query from the CLI (no UI needed)

Useful for verifying the backend independently:

```bash
python main.py query "Find premium customers in Bangalore"
```

### Frontend (`UserInterface/banking/`)

```bash
cd UserInterface/banking
npm install
npm run dev            # dev server on :3000
```

The console expects the API at `http://127.0.0.1:8000`. To change it, edit `API_BASE_URL` in `src/app/page.tsx`.

```bash
npm run build && npm start   # production build
```

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | No | Enables Gemini 1.5 Flash executive-narrative synthesis. Without it the Gemini Agent falls back to a deterministic statistical generator — **core segmentation and recommendation logic never depends on it.** |

```bash
export GEMINI_API_KEY=your_key_here    # Windows: set GEMINI_API_KEY=your_key_here
```

Governance thresholds live in `AI/config.py` under `GOVERNANCE_POLICY` — see [Governance](#governance).

## Using the app

### Preset quick-queries

The dashboard ships seven presets that exercise different agent paths — the fastest way to see selective invocation in action:

| Preset | Demonstrates |
|---|---|
| Churn & Attrition | `churn_query` intent → Explainability Agent |
| Premium Prospects | `prospecting_query` → Recommendation Agent |
| Premium in a city | Entity extraction (city) + segment filter |
| Income EDA Stats | `eda_analysis` → EDA Agent only |
| Portfolio Insights | `portfolio_insights` → Insights Agent |
| Data Health Audit | `data_quality_query` → Data Agent |
| Governance Policy | `risk_governance` → Human-in-the-Loop Agent |

### Views

| Tab | Contents |
|---|---|
| **Dashboard** | Query bar, presets, Supervisor Planner card, Segment Overview |
| **Customers** | Filterable customer table, drill-down drawer with recommendations + explanation |
| **Insights** | EDA Explorer, portfolio insight cards (cross-sell %, dormancy %, premium potential %) |
| **Admin** | Retrain control with live metrics, in-app architecture view |

The **Agent Audit Trail** panel updates alongside every answer — showing which agent ran, why it was called, and the data backing its output.

## API reference

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Liveness probe |
| `GET` | `/status` | Model trained? when, on how many rows/customers, cluster count, latest evaluation metrics |
| `GET` | `/data-quality` | Persisted data-quality report — health score, missing values, duplicates, column typing |
| `POST` | `/train` | Trigger the full training pipeline |
| `POST` | `/query` | **Primary endpoint.** Accepts `{ query, limit }` |

### Example

```bash
curl -X POST http://127.0.0.1:8000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Find premium customers in Bangalore", "limit": 10}'
```

Every `/query` response has the same shape:

```jsonc
{
  "plan":         { "intent": "...", "entities": {...}, "tools_invoked": [...] },
  "result_count": 10,
  "results":      [ /* enriched customer records */ ],
  "raw_output":   { /* key figures for quick consumption */ },
  "audit_trail":  [
    { "step": 1, "agent": "...", "role": "...",
      "why_called": "...", "output_summary": "...", "backing_data": {...} }
  ]
}
```

## Project structure

```
NoCode-NoCry-SocieteGenerale/
├── AI/                              # Python backend
│   ├── agents/                      # 14 specialist agents
│   │   ├── data_agent.py            #  1  data-quality profiler
│   │   ├── preprocessing_agent.py   #  2  clean + chronological sort
│   │   ├── feature_engineering_agent.py  # 3  transaction → customer features
│   │   ├── segmentation_agent.py    #  4  K-Means + auto-K + Z-score drivers
│   │   ├── persona_agent.py         #  5  cluster ID → persona + strategy
│   │   ├── recommendation_agent.py  #  6  rule-based next-best-action
│   │   ├── explainability_agent.py  #  7  per-customer reason narratives
│   │   ├── eda_agent.py             #  8  descriptive stats + comparisons
│   │   ├── visualization_agent.py   #  9  Plotly chart specs
│   │   ├── insights_agent.py        # 10  portfolio-wide insights
│   │   ├── human_loop_agent.py      # 11  governance policy gate
│   │   ├── report_agent.py          # 12  JSON/HTML executive reports
│   │   └── gemini_agent.py          # 13  optional LLM synthesis + fallback
│   ├── api/main.py                  # FastAPI app + routes
│   ├── services/
│   │   ├── planner.py               # Supervisor Agent (agent 0) — intent/entity parsing
│   │   ├── query_router.py          # dispatch + audit trail assembly
│   │   └── tool_registry.py         # tool catalog + safe-execution wrapper
│   ├── pipelines/train.py           # Flow 1 — training pipeline
│   ├── models/                      # pickled model + scaler  (generated)
│   ├── feature_store/               # Parquet/CSV + JSON      (generated)
│   ├── config.py                    # GOVERNANCE_POLICY
│   ├── dataset.py                   # rule-based enrichment 21 → 75 columns
│   ├── model_train.py               # training entrypoint
│   ├── start_be.py                  # API server entrypoint
│   ├── main.py                      # CLI query interface
│   └── requirements.txt
│
├── UserInterface/banking/           # Next.js 16 + React 19 + TS + Tailwind v4
│   └── src/app/page.tsx             # API_BASE_URL lives here
│
├── PROJECT_PRD_AND_EXECUTION.md     # full technical documentation
└── README.md
```

## How the ML works

**Feature engineering** — 20,000 transaction rows are grouped by `client_id` into ~4,900 customer profiles, combining time-series aggregates (transaction count, total/avg/max spend, spend volatility, avg days between transactions), the latest demographic/financial snapshot, spending ratios and digital-channel activity, plus derived business scores (financial health, investment readiness, premium potential, dormancy, churn risk).

**Clustering** — 40 non-redundant numeric features are scaled and passed to K-Means. `find_optimal_k()` fits K = 3…7 (`n_init=15`), scores each by Silhouette coefficient, and selects the best; the final model refits with `n_init=20`, `random_state=42` for reproducibility.

**Evaluation** — reported per training run and exposed via `GET /status`:

| Metric | Direction |
|---|---|
| Silhouette Score | higher is better (−1 to 1) |
| Calinski-Harabasz Index | higher is better |
| Davies-Bouldin Index | **lower** is better |
| Explained variance (R²-equivalent) | higher is better |

**Explainability** — for each cluster, every feature's mean is compared to the population mean/std as a Z-score; the top 3 positive and bottom 2 negative drivers generate an automatic narrative, e.g. *"Cluster 2 is primarily defined by high Premium Potential (+1.8 std), Investment Balance (+1.6 std)… lower Dormancy Score (−0.9 std)."*

Each customer also receives a **cluster confidence** score, `1 / (1 + distance to nearest centroid)`, which the governance layer checks before permitting automated action.

**Recommendation rules** — fully transparent; the triggering condition is returned as the reason:

| Condition | Offer |
|---|---|
| Premium potential ≥ 70 | Premium Wealth Card |
| Investment readiness ≥ 60 | Wealth Advisory |
| Spend ≥ ₹50,000 or avg txn ≥ ₹5,000 | High-Spender Rewards Card |
| Transaction count ≥ 10 | Frequent Transactor Loyalty Program |
| Product count ≤ 2 | Cross-Sell Product Bundle |
| Dormancy score ≥ 60 | Re-engagement Retention Campaign |
| *no rule triggered* | Savings Optimizer (default) |

## Governance

Every execution plan is evaluated against `GOVERNANCE_POLICY` in `AI/config.py` before any customer-facing action:

| Policy key | Default | Effect |
|---|---|---|
| `min_cluster_confidence` | `0.50` | Lower-confidence assignments are flagged, not auto-actioned |
| `max_auto_campaign_target_count` | `1000` | Larger automated outreach requires manual sign-off |
| `high_risk_intents` | `credit_limit_change`, `account_suspension`, `loan_cancellation` | Always routed for human approval |
| `require_approval_for_prospecting` | — | Gates prospecting campaigns |

Plans are returned with a risk level (`LOW` / `MEDIUM` / `HIGH`) and the specific reasons. Because thresholds live in one dictionary, a risk & compliance team can tune them without touching model or agent logic.

## Troubleshooting

<details>
<summary><b>Navbar shows "offline"</b></summary>

The frontend polls `GET /health`. Confirm the backend is up:

```bash
curl http://127.0.0.1:8000/health
```

If it responds, check `API_BASE_URL` in `UserInterface/banking/src/app/page.tsx`. CORS is enabled for `localhost:3000` and `localhost:5173` — if your dev server picked a different port, add it to the CORS origins in `AI/api/main.py`.
</details>

<details>
<summary><b>First request is very slow / "model not trained"</b></summary>

The training pipeline auto-runs when artifacts are missing. Either wait for it, or pre-train:

```bash
cd AI && python model_train.py
```

Check state with `curl http://127.0.0.1:8000/status`.
</details>

<details>
<summary><b>Force a full rebuild</b></summary>

```bash
cd AI
rm -rf models feature_store        # Windows: rmdir /s models feature_store
python dataset.py
python model_train.py
```

Or hit `POST /train` / use the Admin tab's Retrain control.
</details>

<details>
<summary><b>No Gemini narrative appearing</b></summary>

Expected without `GEMINI_API_KEY`. The Gemini Agent falls back to a deterministic statistical summary — segmentation, recommendations and explainability are unaffected.
</details>

<details>
<summary><b><code>ModuleNotFoundError</code> on backend start</b></summary>

Confirm the virtual environment is active and you're running from inside `AI/`:

```bash
cd AI
source .venv/bin/activate
pip install -r requirements.txt
```
</details>

## Roadmap

- Persist audit trails and query history to a database for compliance record-keeping
- Authentication and role-based access (relationship managers vs. risk/compliance reviewers)
- Optional supervised uplift/propensity model *alongside* — not replacing — the transparent rule engine
- Feedback loop so accepted/rejected recommendations refine persona strategies
- Docker Compose for one-command deployment
- Broader planner coverage: more cities, product names, multi-condition queries

## Tech stack

**Backend** Python 3.10+ · FastAPI · Uvicorn · scikit-learn · pandas · NumPy
**Frontend** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Plotly
**LLM (optional)** Google Gemini 1.5 Flash, with deterministic fallback
**Persistence** Parquet + CSV feature store, pickled model/scaler, JSON metadata

---

<div align="center">

**Team NoCode-NoCry** · Société Générale Hackathon · Track SF-4

[Demo video](https://www.loom.com/share/4405869054674e8b9ec264742998f4d7) · [Documentation](./PROJECT_PRD_AND_EXECUTION.md)

</div>
