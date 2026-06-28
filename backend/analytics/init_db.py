from analytics.db import get_connection

conn = get_connection()

conn.execute("""
CREATE TABLE IF NOT EXISTS routing_events (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    timestamp TEXT,

    cached INTEGER,

    tier TEXT,

    complexity REAL,

    input_tokens INTEGER,

    token_budget INTEGER,

    co2_kg REAL,

    co2_saved_kg REAL
)
""")

conn.commit()
conn.close()

print("Database initialized")