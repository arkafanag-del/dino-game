import sqlite3
import os

DB_FILE = "/data/dino.db" if os.path.exists("/data") else os.path.join(os.path.dirname(__file__), "dino.db")


def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def _ensure_columns(conn, table, columns):
    """Безопасно добавляет отсутствующие колонки в существующую таблицу.
    Использует PRAGMA table_info, чтобы не полагаться на исключения ALTER
    (которые при первой же ошибке обрывают всю цепочку добавлений)."""
    existing = {row["name"] for row in conn.execute(f"PRAGMA table_info({table})").fetchall()}
    for col_name, col_def in columns:
        if col_name not in existing:
            conn.execute(f"ALTER TABLE {table} ADD COLUMN {col_name} {col_def}")


def init_db():
    with get_db_connection() as conn:
        # Таблица рекордов
        conn.execute("""
            CREATE TABLE IF NOT EXISTS scores (
                name TEXT PRIMARY KEY,
                score INTEGER NOT NULL
            )
        """)

        # Таблица игроков
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

        # БЕЗОПАСНОЕ ОБНОВЛЕНИЕ — добавляем только недостающие колонки
        _ensure_columns(conn, "players", [
            ("coins", "INTEGER DEFAULT 0"),
            ("quests_done", "INTEGER DEFAULT 0"),
            ("selected_skin", "TEXT DEFAULT 'default'"),
            ("unlocked_skins", "TEXT DEFAULT 'default'"),
            ("last_daily", "TEXT DEFAULT ''"),
            ("streak", "INTEGER DEFAULT 0"),
        ])

        conn.commit()