# Bank360 AI — Multi-Agent System Execution Blueprint

## Goal

Build a query-aware banking analytics platform: the system receives a natural-language request, plans only the work required for that request, runs specialised agents over a shared feature store, and returns evidence-backed insights, recommendations, charts, or reports.

The system is **not** a fixed pipeline. Data preparation and model training happen when the dataset changes; online user requests reuse those saved results whenever possible.

## Architecture

```text
User query / dataset upload
          |
          v
Supervisor / Orchestrator
  - intent, entities, plan, approvals
          |
          +--> Agent tools (only those required)
          |
          v
Shared feature store + model registry + metadata store
          |
          v
API / dashboard / downloadable report
```

### Execution modes

| Mode | Trigger | Agents / services |
|---|---|---|
| Dataset refresh | A CSV or database snapshot is uploaded | Data Understanding → Preprocessing → Feature Engineering → Segmentation → Persona generation → persist artifacts |
| Interactive query | A user asks a question | Supervisor → minimal query-specific agent plan → response |
| Scheduled refresh | A new customer-data batch arrives | Same as dataset refresh, with versioning and drift checks |
| Report export | User requests PDF/CSV/presentation | Supervisor → supporting analytical agents → Report Generator |

## Shared contracts

All agents should receive and return typed objects rather than passing free-form text between services.

```python
from dataclasses import dataclass, field
from typing import Any, Literal

@dataclass
class AgentRequest:
    request_id: str
    dataset_version: str
    user_query: str | None = None
    intent: str | None = None
    entities: dict[str, Any] = field(default_factory=dict)
    filters: dict[str, Any] = field(default_factory=dict)
    payload: dict[str, Any] = field(default_factory=dict)

@dataclass
class AgentResponse:
    status: Literal["ok", "needs_approval", "error"]
    data: dict[str, Any]
    metadata: dict[str, Any] = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)
```

Persist every artifact with `dataset_version`, `created_at`, source columns, feature definitions, and model version. This makes recommendations and explanations reproducible.

## Agent catalogue

| Agent | Responsibility | Inputs | Outputs | Tools | When it runs | Dependencies |
|---|---|---|---|---|---|---|
| Supervisor | Interpret request, create plan, route tools, request approval | Natural language | Intent, entities, filters, execution plan | LLM / rule parser | Every request | Tool registry |
| Data Understanding | Profile schema and data quality | CSV/database | Profile, types, quality issues, likely IDs/targets | pandas, Great Expectations | Upload only | Raw data |
| Preprocessing | Clean and standardise source | Profile + raw data | Clean table, transformation report | pandas, sklearn | Upload / refresh | Data profile |
| Feature Engineering | Create business features | Clean table | Versioned customer feature table | pandas, numpy | Upload or missing feature query | Clean table |
| EDA | Compute contextual statistics | Query + feature table | Statistics and chart specification | pandas, scipy | Analysis request | Feature store |
| Segmentation | Cluster customers and score membership | Engineered features | Segment labels, distances, cluster stats | sklearn | Initial training / refresh | Feature store |
| Persona | Name and describe segments | Cluster stats | Personas and strategies | LLM | Segment changed / requested | Segmentation results |
| Recommendation | Propose products/actions | Customer features + segment | Ranked recommendations and reasons | Rule engine; future ranker | Recommendation request | Feature store, rules |
| Explainability | Explain a score, label or recommendation | Customer + prediction | Feature contributions / plain-language rationale | SHAP, rules, LLM | Why/explain request | Relevant model or rules |
| Insights | Turn aggregates into actionable findings | Stats + segments | Prioritised business insights | statistics, LLM | Comparison/insight request | EDA / segmentation |
| Visualization | Render validated chart specs | Chart specification | Plotly/JSON chart | Plotly | Visual request | EDA / segmentation |
| Report | Compose executive export | Prior outputs | PDF, CSV, slides, summary | reportlab / templates | Export request | Requested results |
| Human-in-the-loop | Get approval for ambiguous/high-impact actions | Plan or thresholds | Confirmed business definition | UI/API | When confidence is low | Supervisor |

## Supervisor planning rules

The Supervisor must not load dataframes or train models. It produces a structured plan and calls registered tools.

```json
{
  "intent": "segment_query",
  "entities": {
    "segment": "Premium",
    "city": "Bangalore",
    "balance": {"operator": ">", "value": 500000, "currency": "INR"}
  },
  "plan": [
    {"tool": "feature_store.search", "required": true},
    {"tool": "segmentation.lookup", "required": true},
    {"tool": "visualization.table", "required": false}
  ],
  "approval_required": false
}
```

Routing examples:

| User request | Plan |
|---|---|
| “Find premium customers in Bangalore” | Feature store filter → segmentation lookup → result table |
| “Which customers can become premium?” | Feature lookup → premium-potential score → segmentation lookup → recommendations → explainability |
| “Show income distribution” | EDA statistics → Visualization |
| “Compare Premium and Dormant customers” | Segmentation → EDA comparison → Visualization → Insights |
| “Why was customer C102 recommended a premium card?” | Recommendation lookup → Explainability |

If a business term is ambiguous (for example, “premium”), the Human-in-the-loop agent asks for the definition or applies a visible approved default. Example default: a composite score of income, average balance, activity, product holdings, credit score, and investment readiness.

## Feature store and models

### Offline artifacts

```text
feature_store/
  customer_features.parquet       # one row/customer, engineered metrics
  customer_segments.parquet       # customer_id, cluster, distance, confidence
  data_quality_report.json
  feature_metadata.json
  segment_personas.json
models/
  scaler.joblib
  pca.joblib                      # optional
  kmeans.joblib
  premium_model.joblib            # optional supervised model
  recommendation_rules.json
  model_metadata.json
```

Use Parquet for query performance and retain the original CSV as immutable source data. The feature table must include `customer_id`, `dataset_version`, and `feature_version`.

### Proposed engineered features

Derive only features supported by available columns, and record unavailable features in metadata:

- Average balance, balance trend, average monthly spend, transaction frequency
- Savings, debt, investment, and product-ownership ratios
- Financial health, activity, loyalty, dormancy, and relationship-strength scores
- Premium potential, cross-sell score, investment readiness, digital-adoption score
- Customer value and a transparent net-worth estimate

## Implementation sequence

### Phase 1 — Foundation and offline pipeline

1. Inspect `Customer_financial_profiles.csv` and document the source schema in the Data Agent.
2. Implement preprocessing as a deterministic, logged transformation pipeline.
3. Build feature engineering with column mapping and feature metadata.
4. Persist clean data and engineered features to the feature store.
5. Train KMeans only after feature validation; choose `k` using silhouette score and business interpretability.
6. Store segmentation labels, distance-based confidence, cluster statistics, and model artifacts.

### Phase 2 — Agent services

1. Define the request/response schemas and a base agent interface.
2. Add a tool registry so the Supervisor can call named capabilities instead of importing every agent directly.
3. Implement a deterministic rule-based Supervisor first; connect an LLM parser behind the same interface afterward.
4. Implement query endpoints: customer search, segment comparison, EDA chart, recommendation, and explanation.
5. Add Human-in-the-loop approval callbacks for ambiguous thresholds and action-oriented recommendations.

### Phase 3 — Product experience and safety

1. Add a dashboard/API that displays the plan, data version, result provenance, and warnings.
2. Add charts and downloadable reports.
3. Add validation, audit logs, PII masking, role-based access, and prompt-injection controls.
4. Evaluate each intent with a test query set and track latency, accuracy, and business acceptance.

## Recommended repository layout

```text
AI/
├── agents/
│   ├── base.py
│   ├── supervisor_agent.py
│   ├── data_agent.py
│   ├── preprocessing_agent.py
│   ├── feature_engineering_agent.py
│   ├── eda_agent.py
│   ├── segmentation_agent.py
│   ├── persona_agent.py
│   ├── recommendation_agent.py
│   ├── explainability_agent.py
│   ├── insights_agent.py
│   ├── visualization_agent.py
│   ├── report_agent.py
│   └── human_loop_agent.py
├── services/
│   ├── planner.py
│   ├── query_router.py
│   ├── tool_registry.py
│   ├── feature_store.py
│   └── database.py
├── pipelines/
│   ├── ingest.py
│   ├── build_features.py
│   └── train_segmentation.py
├── models/
├── feature_store/
├── api/
│   └── main.py
├── dashboard/
├── tests/
├── config.py
└── app.py
```

## First usable demonstration

For the hackathon MVP, deliver these flows end-to-end:

1. Upload/load the customer CSV and display its quality profile.
2. Build and persist engineered customer features.
3. Train/refresh customer segments and show named personas.
4. Answer “Find premium customers in Bangalore” from the feature store.
5. Answer “Show income distribution” with an interactive chart.
6. Answer “Which customers can become premium?” with recommendations and reasons.
7. Show the Supervisor’s selected plan and the dataset/model versions used.

This proves dynamic orchestration: a visual question does not trigger model training, while a recommendation question triggers only the feature, segmentation, recommendation, and explanation capabilities it needs.

## Definition of done

- Data refresh creates versioned quality, clean-data, feature, segmentation, and persona artifacts.
- Each supported user intent produces a machine-readable plan before execution.
- Online requests read persisted features/models instead of recomputing them.
- Every customer-level result includes reason codes, version metadata, and safe handling of missing data.
- Dashboard/API exposes the result plus a compact trace of which agents executed.
