# from analytics.db import get_connection

# conn = get_connection()

# conn.execute("""
# CREATE TABLE IF NOT EXISTS routing_events (

#     id INTEGER PRIMARY KEY AUTOINCREMENT,

#     timestamp TEXT,

#     cached INTEGER,

#     tier TEXT,

#     complexity REAL,

#     input_tokens INTEGER,

#     token_budget INTEGER,

#     co2_kg REAL,

#     co2_saved_kg REAL
# )
# """)

# conn.commit()
# conn.close()

# print("Database initialized")

from analytics.db import get_connection

conn = get_connection()

# Create fresh table with full enterprise schema
conn.execute("""
CREATE TABLE IF NOT EXISTS routing_events (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp        TEXT,
    org_id           TEXT DEFAULT '',
    team_id          TEXT DEFAULT '',
    user_id          TEXT DEFAULT '',
    session_id       TEXT DEFAULT '',
    cached           INTEGER,
    tier             TEXT,
    complexity       REAL,
    input_tokens     INTEGER,
    token_budget     INTEGER,
    co2_kg           REAL,
    co2_saved_kg     REAL,
    baseline_co2_kg  REAL
)
""")

# Migrate existing table if it already exists without the new columns
# Safe to run multiple times — ALTER TABLE IF NOT EXISTS column doesn't
# exist in SQLite, so we catch the error silently
migrations = [
    "ALTER TABLE routing_events ADD COLUMN org_id TEXT DEFAULT ''",
    "ALTER TABLE routing_events ADD COLUMN team_id TEXT DEFAULT ''",
    "ALTER TABLE routing_events ADD COLUMN user_id TEXT DEFAULT ''",
    "ALTER TABLE routing_events ADD COLUMN session_id TEXT DEFAULT ''",
    "ALTER TABLE routing_events ADD COLUMN baseline_co2_kg REAL",
]
for sql in migrations:
    try:
        conn.execute(sql)
    except Exception:
        pass  # column already exists

conn.commit()
conn.close()
print("Database initialised")