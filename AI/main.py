"""Single local entry point for training, testing, and serving Bank360 AI."""
import argparse
import json

from pipelines.train import run_training
from services.query_router import execute_query


def main():
    parser = argparse.ArgumentParser(description="Bank360 AI backend")
    parser.add_argument("command", choices=["train", "query", "serve"])
    parser.add_argument("query", nargs="?", help="Natural-language query; required for `query`.")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    if args.command == "train":
        print(json.dumps(run_training(), indent=2))
    elif args.command == "query":
        if not args.query:
            parser.error("A query is required: python main.py query \"Find premium customers in Bangalore\"")
        print(json.dumps(execute_query(args.query), indent=2, default=str))
    else:
        import uvicorn
        uvicorn.run("api.main:app", host="127.0.0.1", port=args.port, reload=True, reload_dirs=["."])


if __name__ == "__main__":
    main()
