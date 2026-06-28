import json
from pathlib import Path
from datetime import datetime

LOG_FILE = Path("logs/routing_events.jsonl")


def log_routing_event(event: dict):

    event["timestamp"] = datetime.utcnow().isoformat()

    with open(LOG_FILE, "a") as f:
        f.write(json.dumps(event) + "\n")