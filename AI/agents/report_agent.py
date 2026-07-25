import json
from pathlib import Path

def write_json_report(payload, output_path):
    path = Path(output_path)
    path.write_text(json.dumps(payload, indent=2, default=str), encoding="utf-8")
    return str(path)
