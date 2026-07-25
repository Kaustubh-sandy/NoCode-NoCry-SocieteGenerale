import json

def load_personas(path):
    return json.loads(path.read_text(encoding="utf-8"))
