import json
from pathlib import Path

LOG_FILE = Path("logs/routing_events.jsonl")

def load_events():

    if not LOG_FILE.exists():
        return []

    events = []

    with open(LOG_FILE) as f:
        for line in f:
            if line.strip():
                events.append(json.loads(line))

    return events

def get_summary():

    events = load_events()

    if not events:
        return {}

    total_requests = len(events)

    cache_hits = sum(
        1 for e in events
        if e["cached"]
    )

    total_co2 = sum(
        e["co2_kg"]
        for e in events
    )

    total_saved = sum(
        e["co2_saved_kg"]
        for e in events
    )

    tier_counts = {
        "micro": 0,
        "lite": 0,
        "pro": 0
    }

    for e in events:
        tier = e["tier"]

        if tier in tier_counts:
            tier_counts[tier] += 1

    return {
        "total_requests": total_requests,
        "cache_hits": cache_hits,
        "cache_hit_rate": round(
            cache_hits / total_requests * 100,
            2
        ),
        "total_co2_kg": total_co2,
        "total_saved_kg": total_saved,
        "tier_distribution": tier_counts
    }