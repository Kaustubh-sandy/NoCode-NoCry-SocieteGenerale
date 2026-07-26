# Bank360 AI: 2-Flow Pipeline Guide

The AI backend is streamlined into two simple Python entry points in the `AI` directory.

---

## FLOW 1: Model Training Pipeline

Preprocesses raw financial data, generates feature store metrics, trains the K-Means clustering model, and saves artifacts to `models/` and `feature_store/`.

```powershell
python model_train.py
```

---

## FLOW 2: Usecase Serving Pipeline

Launches the FastAPI multi-agent backend API serving the AI usecase.
*(Note: If model artifacts are missing, Flow 2 automatically runs Flow 1 training first.)*

```powershell
python start_be.py
```

- API Server: `http://127.0.0.1:8000`
- Swagger Documentation: `http://127.0.0.1:8000/docs`

---

## Optional Direct CLI Queries

```powershell
python main.py query "Find premium customers in Bangalore"
```
