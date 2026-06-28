# v1: logging into jsonl (redundant)
# import json
# from datetime import datetime

# from pathlib import Path

# BASE_DIR = Path(__file__).resolve().parent.parent
# LOG_DIR = BASE_DIR / "logs"
# LOG_FILE = LOG_DIR / "routing_events.jsonl"

# LOG_DIR.mkdir(exist_ok=True)
# LOG_FILE.touch(exist_ok=True)


# def log_routing_event(event: dict):

#     event["timestamp"] = datetime.utcnow().isoformat()

#     with open(LOG_FILE, "a") as f:
#         f.write(json.dumps(event) + "\n")

# v2: logging into sqlite 

# from analytics.db import get_connection
# from datetime import datetime


# def log_routing_event(event):

#     conn = get_connection()

#     conn.execute("""
#     INSERT INTO routing_events (

#         timestamp,
#         cached,
#         tier,
#         complexity,
#         input_tokens,
#         token_budget,
#         co2_kg,
#         co2_saved_kg

#     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
#     """, (

#         datetime.utcnow().isoformat(),

#         int(event["cached"]),
#         event["tier"],
#         event["complexity"],
#         event.get("input_tokens", 0),
#         event.get("token_budget", 0),
#         event["co2_kg"],
#         event["co2_saved_kg"]

#     ))

#     conn.commit()
#     conn.close()


# v3: logger writes new columns: org_id, team_id, user_id

from analytics.db import get_connection
from datetime import datetime

def log_routing_event(event: dict):
    conn = get_connection()
    conn.execute("""
        INSERT INTO routing_events (
            timestamp,
            org_id,
            team_id,
            user_id,
            session_id,
            cached,
            tier,
            complexity,
            input_tokens,
            token_budget,
            co2_kg,
            co2_saved_kg,
            baseline_co2_kg
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        datetime.utcnow().isoformat(),
        event.get("org_id", ""),
        event.get("team_id", ""),
        event.get("user_id", ""),
        event.get("session_id", ""),
        int(event["cached"]),
        event["tier"],
        event["complexity"],
        event.get("input_tokens", 0),
        event.get("token_budget", 0),
        event["co2_kg"],
        event["co2_saved_kg"],
        event.get("baseline_co2_kg", 0.0),
    ))
    conn.commit()
    conn.close()

