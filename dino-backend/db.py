import os
import sqlite3
from contextlib import contextmanager

DB_FILE = os.getenv("DB_FILE") or (
    "/data/dino.db"
    if os.path.exists("/data")
    else os.path.join(os.path.dirname(__file__), "dino.db")
)


def get_db_connection():
    conn = sqlite3.connect(DB_FILE, timeout=15)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@contextmanager
def transaction():
    """Одна write-транзакция. BEGIN IMMEDIATE не даёт двум запросам
    одновременно прочитать и перезаписать один и тот же баланс."""
    conn = get_db_connection()
    try:
        conn.execute("BEGIN IMMEDIATE")
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def _ensure_columns(conn, table, columns):
    existing = {row["name"] for row in conn.execute(f"PRAGMA table_info({table})").fetchall()}
    for col_name, col_def in columns:
        if col_name not in existing:
            conn.execute(f"ALTER TABLE {table} ADD COLUMN {col_name} {col_def}")


def init_db():
    conn = get_db_connection()
    try:
        conn.execute("PRAGMA journal_mode = WAL")

        conn.execute("""
            CREATE TABLE IF NOT EXISTS scores (
                name TEXT PRIMARY KEY,
                score INTEGER NOT NULL
            )
        """)

        conn.execute("""
            CREATE TABLE IF NOT EXISTS players (
                name TEXT PRIMARY KEY,
                password_hash TEXT NOT NULL DEFAULT '',
                coins INTEGER NOT NULL DEFAULT 0,
                quests_done INTEGER NOT NULL DEFAULT 0,
                selected_skin TEXT NOT NULL DEFAULT 'default',
                unlocked_skins TEXT NOT NULL DEFAULT '["default"]',
                last_daily TEXT NOT NULL DEFAULT '',
                streak INTEGER NOT NULL DEFAULT 0,
                daily_earned INTEGER NOT NULL DEFAULT 0,
                daily_earned_date TEXT NOT NULL DEFAULT '',
                last_save_at REAL NOT NULL DEFAULT 0,
                created_at REAL NOT NULL DEFAULT 0,
                updated_at REAL NOT NULL DEFAULT 0
            )
        """)

        # Миграция старой таблицы players.
        _ensure_columns(conn, "players", [
            ("password_hash", "TEXT NOT NULL DEFAULT ''"),
            ("coins", "INTEGER NOT NULL DEFAULT 0"),
            ("quests_done", "INTEGER NOT NULL DEFAULT 0"),
            ("selected_skin", "TEXT NOT NULL DEFAULT 'default'"),
            ("unlocked_skins", "TEXT NOT NULL DEFAULT '[\"default\"]'"),
            ("last_daily", "TEXT NOT NULL DEFAULT ''"),
            ("streak", "INTEGER NOT NULL DEFAULT 0"),
            ("daily_earned", "INTEGER NOT NULL DEFAULT 0"),
            ("daily_earned_date", "TEXT NOT NULL DEFAULT ''"),
            ("last_save_at", "REAL NOT NULL DEFAULT 0"),
            ("created_at", "REAL NOT NULL DEFAULT 0"),
            ("updated_at", "REAL NOT NULL DEFAULT 0"),
        ])

        # В старых записях unlocked_skins мог быть строкой 'default', а не JSON.
        conn.execute("""
            UPDATE players
            SET unlocked_skins = '["default"]'
            WHERE unlocked_skins IS NULL OR unlocked_skins = '' OR unlocked_skins = 'default'
        """)

        # Сессии аутентификации. В БД хранится только SHA-256 от токена,
        # поэтому утечка базы не даёт готовых bearer-токенов.
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                token_hash TEXT PRIMARY KEY,
                player_name TEXT NOT NULL,
                created_at REAL NOT NULL,
                expires_at REAL NOT NULL,
                FOREIGN KEY (player_name) REFERENCES players(name) ON DELETE CASCADE
            )
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_sessions_player
            ON sessions(player_name, expires_at)
        """)
        # По этому индексу _issue_session быстро удаляет истёкшие сессии.
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_sessions_expires
            ON sessions(expires_at)
        """)

        # Журнал всех изменений баланса: по нему видно, кто и сколько «накрутил».
        conn.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_name TEXT NOT NULL,
                amount INTEGER NOT NULL,
                balance_after INTEGER NOT NULL,
                reason TEXT NOT NULL,
                meta TEXT NOT NULL DEFAULT '',
                created_at REAL NOT NULL
            )
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_transactions_player
            ON transactions(player_name, created_at)
        """)

        # Серверные игровые сессии. Нужны для режима, где сервер сам
        # проверяет длительность забега, счёт и максимальную награду.
        conn.execute("""
            CREATE TABLE IF NOT EXISTS runs (
                run_id TEXT PRIMARY KEY,
                player_name TEXT NOT NULL,
                started_at REAL NOT NULL,
                finished_at REAL,
                score INTEGER NOT NULL DEFAULT 0,
                coins_claimed INTEGER NOT NULL DEFAULT 0,
                coins_awarded INTEGER NOT NULL DEFAULT 0,
                quests_completed INTEGER NOT NULL DEFAULT 0,
                boss_damage INTEGER NOT NULL DEFAULT 0,
                status TEXT NOT NULL DEFAULT 'active',
                client_ip TEXT NOT NULL DEFAULT ''
            )
        """)
        _ensure_columns(conn, "runs", [
            ("boss_damage", "INTEGER NOT NULL DEFAULT 0"),
        ])
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_runs_player_status
            ON runs(player_name, status)
        """)

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
    finally:
        conn.close()
