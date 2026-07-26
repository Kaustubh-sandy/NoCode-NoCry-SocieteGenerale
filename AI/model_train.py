"""
FLOW 1: Model Training Pipeline
Processes raw customer data, extracts features, trains segmentation model, and outputs artifacts.
"""
import sys
from pathlib import Path

# Ensure project root is in path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from pipelines.train import run_training

if __name__ == "__main__":
    print("=" * 60)
    print("FLOW 1: STARTING MODEL TRAINING PIPELINE")
    print("=" * 60)
    results = run_training()
    print("\nTraining completed successfully!")
    print(f"- Source Dataset: {results.get('source')}")
    print(f"- Raw Rows Processed: {results.get('raw_rows')}")
    print(f"- Feature Columns: {len(results.get('feature_columns', []))}")
    print(f"- Clusters Trained: {results.get('clusters')}")
    print("\nArtifacts saved in /models and /feature_store directories.")
    print("=" * 60)
