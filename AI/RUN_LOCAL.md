# Bank360 AI: local run guide

## Work from one backend folder

Open PowerShell and run:

```powershell
cd C:\Users\arnav\Downloads\HackGeneral\NoCode-NoCry-SocieteGenerale\AI
.\setup.ps1                 # only the first time
.\start.ps1                 # every new backend terminal
```

After `start.ps1`, `python` means the project-local Python environment. You do not need the long Codex Python path again.

## Run order

### Terminal 1: train the offline data/model artifacts

```powershell
python main.py train
```

Run this first, and rerun it only after you replace or update `Enriched_Customer_financial_profiles.csv`.

It saves these deployment-ready artifacts:

```text
models/
  customer_segmentation_kmeans.pkl
  customer_segmentation_scaler.pkl
feature_store/
  customer_features.parquet
  customer_segments.parquet
  customer_features.csv          # local fallback when PyArrow is unavailable
  customer_segments.csv          # local fallback when PyArrow is unavailable
  segment_personas.json
  data_quality_report.json
  metadata.json
```

### Terminal 1: test the agents without the API

```powershell
python main.py query "Find premium customers in Bangalore"
python main.py query "Show income distribution"
python main.py query "Which customers can become premium?"
```

### Terminal 1: start the backend API

```powershell
python main.py serve
```

Keep this terminal running. It serves the API at `http://127.0.0.1:8000`. Visit `http://127.0.0.1:8000/docs` to test `/health`, `/train`, and `/query` interactively.

## Frontend connection

Open **Terminal 2** for the frontend. Its commands depend on the existing project setup, but first use:

```powershell
cd C:\Users\arnav\Downloads\HackGeneral\NoCode-NoCry-SocieteGenerale\UserInterface\banking
```

Start its existing development command (typically `npm run dev`). The frontend should send requests to:

```text
POST http://127.0.0.1:8000/query
Content-Type: application/json

{ "query": "Find premium customers in Bangalore", "limit": 50 }
```

The backend permits local React/Vite development origins on ports 3000 and 5173.

## Hugging Face deployment

Deploy the `AI` folder as the backend repository. The platform installs `requirements.txt` and starts the same FastAPI app with:

```text
uvicorn api.main:app --host 0.0.0.0 --port $PORT
```

The trained `models/` and `feature_store/` files are the runtime assets. For production-sized datasets, store those artifacts in a Hugging Face Dataset repository or object storage and download them during startup rather than committing large files.
