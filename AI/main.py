"""Single local entry point for training, testing, and serving Bank360 AI."""
import argparse
import json
import uvicorn

from config import FEATURES_FILE, FEATURES_CSV_FILE, MODEL_FILE
from pipelines.train import run_training
from services.query_router import execute_query


def ensure_artifacts_exist():
    has_features = FEATURES_FILE.exists() or FEATURES_CSV_FILE.exists()
    has_model = MODEL_FILE.exists()
    if not (has_features and has_model):
        print("Model or feature store artifacts missing. Auto-triggering Flow 1 (Training)...")
        run_training()
        print("Training completed. Proceeding to Usecase Serving...\n")


def main():
    parser = argparse.ArgumentParser(description="Bank360 AI Pipeline Runner")
    parser.add_argument("command", choices=["train", "query", "serve"], help="Command to run: 'train' (Flow 1), 'serve' (Flow 2), or 'query'")
    parser.add_argument("query", nargs="?", help="Natural-language query; required for `query` command.")
    parser.add_argument("--port", type=int, default=8000, help="Port to run the API server on (default: 8000)")
    args = parser.parse_args()

    if args.command == "train":
        print("=" * 60)
        print("FLOW 1: MODEL TRAINING PIPELINE")
        print("=" * 60)
        results = run_training()
        print(json.dumps(results, indent=2))
        print("=" * 60)

    elif args.command == "query":
        if not args.query:
            parser.error("A query string is required. Example: python main.py query \"Find premium customers in Bangalore\"")
        ensure_artifacts_exist()
        print(json.dumps(execute_query(args.query), indent=2, default=str))

    elif args.command == "serve":
        print("=" * 60)
        print(f"FLOW 2: USECASE SERVING PIPELINE (Port {args.port})")
        print("=" * 60)
        ensure_artifacts_exist()
        uvicorn.run("api.main:app", host="127.0.0.1", port=args.port, reload=True, reload_dirs=["."])


if __name__ == "__main__":
    main()
