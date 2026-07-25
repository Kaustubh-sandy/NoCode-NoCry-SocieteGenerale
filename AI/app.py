import argparse
import json
from pipelines.train import run_training
from services.query_router import execute_query

parser = argparse.ArgumentParser(description="Bank360 AI multi-agent MVP")
parser.add_argument("command", choices=["train", "query"])
parser.add_argument("query", nargs="?")
args = parser.parse_args()
if args.command == "train": print(json.dumps(run_training(), indent=2))
else:
    if not args.query: parser.error("query text is required")
    print(json.dumps(execute_query(args.query), indent=2, default=str))
