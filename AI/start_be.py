"""
FLOW 2: Usecase Serving Pipeline
Validates trained artifacts and launches the FastAPI multi-agent backend API.
"""
import sys
import uvicorn
from pathlib import Path

# Ensure project root is in path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from config import FEATURES_FILE, FEATURES_CSV_FILE, MODEL_FILE
from pipelines.train import run_training

def ensure_artifacts_exist():
    has_features = FEATURES_FILE.exists() or FEATURES_CSV_FILE.exists()
    has_model = MODEL_FILE.exists()
    if not (has_features and has_model):
        print("Model or feature store artifacts missing. Auto-triggering Flow 1 (Training)...")
        run_training()
        print("Training completed. Proceeding to Usecase Serving...\n")

if __name__ == "__main__":
    print("=" * 60)
    print("FLOW 2: STARTING USECASE SERVING PIPELINE")
    print("=" * 60)
    ensure_artifacts_exist()
    print("Serving Bank360 AI API on http://127.0.0.1:8000")
    print("Press Ctrl+C to stop the server.")
    print("=" * 60)
    uvicorn.run("api.main:app", host="127.0.0.1", port=8000, reload=True, reload_dirs=["."])
