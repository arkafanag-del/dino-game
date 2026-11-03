import sqlite3
import os

DB_FILE = "/data/dino.db" if os.path.exists("/data") else os.path.join(os.path.dirname(__file__), "dino.db")

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

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
        
        # БЕЗОПАСНОЕ ОБНОВЛЕНИЕ (если таблица уже была создана ранее)
        try:
            conn.execute("ALTER TABLE players ADD COLUMN selected_skin TEXT DEFAULT 'default'")
            conn.execute("ALTER TABLE players ADD COLUMN unlocked_skins TEXT DEFAULT 'default'")
            conn.execute("ALTER TABLE players ADD COLUMN last_daily TEXT DEFAULT ''")
            conn.execute("ALTER TABLE players ADD COLUMN streak INTEGER DEFAULT 0")
        except sqlite3.OperationalError:
            # Если колонки уже существуют, ничего не делаем
            pass
            
        conn.commit()