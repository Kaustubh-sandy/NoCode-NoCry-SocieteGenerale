# Bank360 AI

**Customer Segmentation & Personalization Agent for Retail Banking**
Société Générale Hackathon — Track SF-4

Ask a retail-banking question in plain English. A Supervisor Agent parses the intent, invokes **only** the specialist agents that question needs, and returns segments, personas and recommendations — with a full audit trail of which agent ran and why.

📹 **[Demo video](https://www.loom.com/share/4405869054674e8b9ec264742998f4d7)** 

```
20,000 transactions → 75 enriched columns → ~4,900 customers → 40 features
14 agents · 4 personas · 8 query intents
```

---

## Quick start

**Prerequisites:** Python 3.10+, Node.js 18+

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

**Terminal 2 — frontend**

```bash
cd UserInterface/banking
npm install
npm run dev
```

Open **http://localhost:3000** — the navbar dot should read *online*.

| | |
|---|---|
| Console | http://localhost:3000 |
| API + Swagger | http://127.0.0.1:8000 · `/docs` |

> Training runs automatically on first start if model artifacts are missing, so first boot is slow. To pre-train explicitly:
> ```bash
> python dataset.py        # enrich 21 → 75 columns
> python model_train.py    # fit K-Means, write models/ + feature_store/
> ```
> CLI query without the UI: `python main.py query "Find premium customers in Bangalore"`

**Optional:** `export GEMINI_API_KEY=...` enables LLM executive summaries. Without it the system falls back to deterministic narratives — core segmentation and recommendations are unaffected.

## API

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Liveness probe |
| `GET` | `/status` | Model state + evaluation metrics |
| `GET` | `/data-quality` | Data health report |
| `POST` | `/train` | Trigger training pipeline |
| `POST` | `/query` | **Primary.** `{ query, limit }` |

```bash
curl -X POST http://127.0.0.1:8000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Find premium customers in Bangalore", "limit": 10}'
```

Returns `plan` (intent + entities + tools invoked), `results`, `raw_output`, and `audit_trail`.

## Structure

```
AI/                        Python backend
├── agents/                14 specialist agents (data, preprocessing, feature-eng,
│                          segmentation, persona, recommendation, explainability,
│                          EDA, visualization, insights, governance, report, gemini)
├── services/planner.py    Supervisor Agent — intent & entity parsing
├── api/main.py            FastAPI routes
├── pipelines/train.py     Training flow
├── config.py              GOVERNANCE_POLICY thresholds
├── dataset.py             Rule-based enrichment (21 → 75 cols)
├── model_train.py         Training entrypoint
└── start_be.py            API server

UserInterface/banking/     Next.js 16 + React 19 + TS + Tailwind v4
└── src/app/page.tsx       API_BASE_URL configured here
```

## How it works

**Segmentation** — 40 scaled features → K-Means with automatic K selection (silhouette across K=3–7, `random_state=42`). Evaluated on Silhouette, Calinski-Harabasz, Davies-Bouldin and explained variance, all exposed via `/status`.

**Explainability** — per-cluster Z-scores against the population mean generate the defining drivers automatically (*"Cluster 2 is defined by high Premium Potential (+1.8 std)…"*). Per customer, the Explainability Agent cites the specific values behind each call.

**Personas** — Premium Investors · Emerging Affluent · Credit Borrowers · Dormant Recovery, each with a mapped go-to-market strategy.

**Governance** — every plan is checked against `GOVERNANCE_POLICY`: minimum cluster confidence (0.50), max auto-campaign size (1,000), and a high-risk intent list that always routes to human approval.

## Troubleshooting

| Problem | Fix |
|---|---|
| Navbar "offline" | `curl http://127.0.0.1:8000/health`. If OK, check `API_BASE_URL` in `src/app/page.tsx`; CORS allows ports 3000/5173 only |
| "Model not trained" | `cd AI && python model_train.py`, or check `/status` |
| Force rebuild | `rm -rf AI/models AI/feature_store`, then rerun `dataset.py` + `model_train.py` |
| `ModuleNotFoundError` | Activate the venv and run from inside `AI/` |

## Tech stack

Python 3.10+ · FastAPI · Uvicorn · scikit-learn · pandas · NumPy · Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Plotly  

---

<div align="center">
<b>Team NoCode-NoCry</b> 
</div>
