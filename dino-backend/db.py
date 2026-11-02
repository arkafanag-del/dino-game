import sqlite3
import os

DB_FILE = os.path.join(os.path.dirname(__file__), "dino.db")

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db_connection() as conn:
        # Таблица для рекордов
        conn.execute("""
            CREATE TABLE IF NOT EXISTS scores (
                name TEXT PRIMARY KEY,
                score INTEGER NOT NULL
            )
        """)
        # НОВАЯ Таблица для профилей RPG
        conn.execute("""
            CREATE TABLE IF NOT EXISTS players (
                name TEXT PRIMARY KEY,
                coins INTEGER DEFAULT 0,
                quests_done INTEGER DEFAULT 0
            )
        """)
        conn.commit()