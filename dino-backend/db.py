import sqlite3
import os

DB_FILE = "/data/dino.db" if os.path.exists("/data") else os.path.join(os.path.dirname(__file__), "dino.db")


def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def _ensure_columns(conn, table, columns):
    existing = {row["name"] for row in conn.execute(f"PRAGMA table_info({table})").fetchall()}
    for col_name, col_def in columns:
        if col_name not in existing:
            conn.execute(f"ALTER TABLE {table} ADD COLUMN {col_name} {col_def}")


def init_db():
    with get_db_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS scores (
                name TEXT PRIMARY KEY,
                score INTEGER NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS players (
                name TEXT PRIMARY KEY,
                coins INTEGER DEFAULT 0,
                quests_done INTEGER DEFAULT 0,
                selected_skin TEXT DEFAULT 'default',
                unlocked_skins TEXT DEFAULT 'default',
                last_daily TEXT DEFAULT '',
                streak INTEGER DEFAULT 0
            )
        """)
        _ensure_columns(conn, "players", [
            ("coins", "INTEGER DEFAULT 0"),
            ("quests_done", "INTEGER DEFAULT 0"),
            ("selected_skin", "TEXT DEFAULT 'default'"),
            ("unlocked_skins", "TEXT DEFAULT 'default'"),
            ("last_daily", "TEXT DEFAULT ''"),
            ("streak", "INTEGER DEFAULT 0"),
        ])
        
        # Таблица мирового босса (синглтон, id=1)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS world_boss (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                week_key TEXT NOT NULL,
                max_hp INTEGER NOT NULL,
                current_hp INTEGER NOT NULL,
                killed_at TEXT DEFAULT '',
                killed_by TEXT DEFAULT ''
            )
        """)
        
        # Таблица урона игроков по неделям
        conn.execute("""
            CREATE TABLE IF NOT EXISTS world_boss_damage (
                week_key TEXT NOT NULL,
                player_name TEXT NOT NULL,
                damage INTEGER DEFAULT 0,
                reward_claimed INTEGER DEFAULT 0,
                PRIMARY KEY (week_key, player_name)
            )
        """)
        
        conn.commit()