import time
from collections import defaultdict
from threading import Lock
from datetime import date, datetime

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import db

MAX_SCORE = 999_999
WORLD_BOSS_BASE_HP = 100_000
WORLD_BOSS_REWARD_COINS = 500
WORLD_BOSS_REWARD_DNA = 200
RATE_LIMIT_WINDOW = 10
RATE_LIMIT_MAX_REQUESTS = 5

_rate_limit_store = defaultdict(list)
_rate_limit_lock = Lock()


def _check_rate_limit(ip: str) -> bool:
    with _rate_limit_lock:
        now = time.time()
        entries = _rate_limit_store[ip]
        entries[:] = [t for t in entries if now - t < RATE_LIMIT_WINDOW]
        if len(entries) >= RATE_LIMIT_MAX_REQUESTS:
            return False
        entries.append(now)
        return True


def get_week_key() -> str:
    iso = date.today().isocalendar()
    return f"{iso.year}-W{iso.week:02d}"


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ScorePayload(BaseModel):
    name: str
    score: int

class PlayerLoad(BaseModel):
    name: str

class PlayerSave(BaseModel):
    name: str
    coins: int
    quests_done: int
    selected_skin: str
    unlocked_skins: str

class WorldBossDamagePayload(BaseModel):
    name: str
    damage: int

class WorldBossClaimPayload(BaseModel):
    name: str


# --- Рекорды ---
@app.get("/api/leaderboard")
def get_leaderboard():
    conn = db.get_db_connection()
    rows = conn.execute("SELECT name, score FROM scores ORDER BY score DESC LIMIT 5").fetchall()
    conn.close()
    return [{"name": row["name"], "score": row["score"]} for row in rows]


@app.post("/api/score")
def add_score(payload: ScorePayload, request: Request):
    ip = request.client.host if request.client else "unknown"
    if not _check_rate_limit(ip):
        raise HTTPException(status_code=429, detail="Too many requests")
    if payload.score < 0 or payload.score > MAX_SCORE:
        raise HTTPException(status_code=400, detail="Invalid score")

    clean_name = payload.name.strip()[:20] or "Аноним"
    conn = db.get_db_connection()
    conn.execute("""
        INSERT INTO scores (name, score) VALUES (?, ?)
        ON CONFLICT(name) DO UPDATE SET score = MAX(scores.score, excluded.score)
    """, (clean_name, payload.score))
    conn.commit()
    conn.close()
    return {"status": "ok"}


# --- Профиль ---
@app.post("/api/player/load")
def load_player(payload: PlayerLoad):
    conn = db.get_db_connection()
    row = conn.execute("SELECT * FROM players WHERE name = ?", (payload.name,)).fetchone()
    conn.close()
    if row:
        return {
            "coins": row["coins"],
            "quests_done": row["quests_done"],
            "selected_skin": row["selected_skin"],
            "unlocked_skins": row["unlocked_skins"],
            "last_daily": row["last_daily"],
            "streak": row["streak"]
        }
    return {"coins": 0, "quests_done": 0, "selected_skin": "default", "unlocked_skins": "default", "last_daily": "", "streak": 0}


@app.post("/api/player/save")
def save_player(payload: PlayerSave, request: Request):
    ip = request.client.host if request.client else "unknown"
    if not _check_rate_limit(ip):
        raise HTTPException(status_code=429, detail="Too many requests")

    clean_name = payload.name.strip()[:20] or "Игрок"
    conn = db.get_db_connection()
    conn.execute("""
        INSERT INTO players (name, coins, quests_done, selected_skin, unlocked_skins)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(name) DO UPDATE SET
            coins = excluded.coins,
            quests_done = excluded.quests_done,
            selected_skin = excluded.selected_skin,
            unlocked_skins = excluded.unlocked_skins
    """, (clean_name, payload.coins, payload.quests_done, payload.selected_skin, payload.unlocked_skins))
    conn.commit()
    conn.close()
    return {"status": "ok"}


@app.post("/api/player/daily")
def claim_daily(payload: PlayerLoad, request: Request):
    ip = request.client.host if request.client else "unknown"
    if not _check_rate_limit(ip):
        raise HTTPException(status_code=429, detail="Too many requests")

    clean_name = payload.name.strip()[:20] or "Игрок"
    today_str = date.today().isoformat()

    conn = db.get_db_connection()
    row = conn.execute("SELECT last_daily, streak, coins FROM players WHERE name = ?", (clean_name,)).fetchone()
    if not row:
        conn.execute("INSERT INTO players (name) VALUES (?)", (clean_name,))
        conn.commit()
        row = conn.execute("SELECT last_daily, streak, coins FROM players WHERE name = ?", (clean_name,)).fetchone()

    last_daily = row["last_daily"]
    streak = row["streak"]

    if last_daily == today_str:
        conn.close()
        return {"status": "already_claimed", "streak": streak}

    reward = 10 + (streak * 5)
    new_coins = row["coins"] + reward
    new_streak = streak + 1

    conn.execute("""
        UPDATE players SET last_daily = ?, streak = ?, coins = ? WHERE name = ?
    """, (today_str, new_streak, new_coins, clean_name))
    conn.commit()
    conn.close()

    return {"status": "success", "reward": reward, "streak": new_streak, "coins": new_coins}


# --- Мировой босс ---
def _ensure_world_boss(conn):
    """Гарантирует, что в БД есть запись для текущей недели."""
    week = get_week_key()
    row = conn.execute("SELECT * FROM world_boss WHERE id = 1").fetchone()
    if not row or row["week_key"] != week:
        conn.execute("""
            INSERT OR REPLACE INTO world_boss (id, week_key, max_hp, current_hp, killed_at, killed_by)
            VALUES (1, ?, ?, ?, '', '')
        """, (week, WORLD_BOSS_BASE_HP, WORLD_BOSS_BASE_HP))
        conn.commit()
        row = conn.execute("SELECT * FROM world_boss WHERE id = 1").fetchone()
    return row, week

@app.get("/api/exchange/rate")
def get_exchange_rate():
    # Считаем курс на основе текущей даты на сервере
    today_str = date.today().isoformat()
    h = hash(today_str) # В Python хэш строки может меняться между запусками, используем сумму кодов
    h = sum(ord(c) for c in today_str)
    rate = 4 + (h % 12)
    return {"rate": rate}

@app.get("/api/world-boss")
def get_world_boss(name: str = ""):
    conn = db.get_db_connection()
    row, week = _ensure_world_boss(conn)
    
    top = conn.execute("""
        SELECT player_name, damage FROM world_boss_damage
        WHERE week_key = ? AND damage > 0
        ORDER BY damage DESC LIMIT 5
    """, (week,)).fetchall()
    
    player_damage = 0
    reward_claimed = False
    if name.strip():
        dmg_row = conn.execute("""
            SELECT damage, reward_claimed FROM world_boss_damage
            WHERE week_key = ? AND player_name = ?
        """, (week, name.strip()[:20])).fetchone()
        if dmg_row:
            player_damage = dmg_row["damage"]
            reward_claimed = bool(dmg_row["reward_claimed"])
    
    conn.close()
    return {
        "week_key": row["week_key"],
        "max_hp": row["max_hp"],
        "current_hp": row["current_hp"],
        "killed": row["current_hp"] <= 0,
        "killed_by": row["killed_by"],
        "top_damage": [{"name": r["player_name"], "damage": r["damage"]} for r in top],
        "player_damage": player_damage,
        "reward_claimed": reward_claimed
    }


@app.post("/api/world-boss/damage")
def add_world_boss_damage(payload: WorldBossDamagePayload, request: Request):
    ip = request.client.host if request.client else "unknown"
    if not _check_rate_limit(ip):
        raise HTTPException(status_code=429, detail="Too many requests")
    if payload.damage < 0 or payload.damage > 50_000:
        raise HTTPException(status_code=400, detail="Invalid damage")
    
    clean_name = payload.name.strip()[:20] or "Аноним"
    
    conn = db.get_db_connection()
    row, week = _ensure_world_boss(conn)
    
    if row["current_hp"] <= 0:
        conn.close()
        return {"current_hp": 0, "damage_added": 0, "killed": True, "already_dead": True}
    
    new_hp = max(0, row["current_hp"] - payload.damage)
    killed_now = new_hp == 0
    killed_at = ""
    killed_by = ""
    if killed_now:
        killed_at = datetime.utcnow().isoformat()
        killed_by = clean_name
    
    conn.execute("""
        UPDATE world_boss SET current_hp = ?, killed_at = ?, killed_by = ? WHERE id = 1
    """, (new_hp, killed_at, killed_by))
    
    conn.execute("""
        INSERT INTO world_boss_damage (week_key, player_name, damage, reward_claimed)
        VALUES (?, ?, ?, 0)
        ON CONFLICT(week_key, player_name) DO UPDATE SET damage = damage + excluded.damage
    """, (week, clean_name, payload.damage))
    
    conn.commit()
    conn.close()
    
    return {
        "current_hp": new_hp,
        "damage_added": payload.damage,
        "killed": killed_now,
        "killed_by": killed_by
    }


@app.post("/api/world-boss/claim")
def claim_world_boss_reward(payload: WorldBossClaimPayload):
    clean_name = payload.name.strip()[:20] or "Аноним"
    
    conn = db.get_db_connection()
    row, week = _ensure_world_boss(conn)
    
    if row["current_hp"] > 0:
        conn.close()
        return {"status": "boss_alive"}
    
    dmg_row = conn.execute("""
        SELECT damage, reward_claimed FROM world_boss_damage
        WHERE week_key = ? AND player_name = ?
    """, (week, clean_name)).fetchone()
    
    if not dmg_row or dmg_row["damage"] <= 0:
        conn.close()
        return {"status": "no_participation"}
    
    if dmg_row["reward_claimed"] == 1:
        conn.close()
        return {"status": "already_claimed"}
    
    player_row = conn.execute("SELECT coins FROM players WHERE name = ?", (clean_name,)).fetchone()
    if player_row:
        new_coins = player_row["coins"] + WORLD_BOSS_REWARD_COINS
        conn.execute("UPDATE players SET coins = ? WHERE name = ?", (new_coins, clean_name))
    else:
        new_coins = WORLD_BOSS_REWARD_COINS
        conn.execute("INSERT INTO players (name, coins) VALUES (?, ?)", (clean_name, new_coins))
    
    conn.execute("""
        UPDATE world_boss_damage SET reward_claimed = 1
        WHERE week_key = ? AND player_name = ?
    """, (week, clean_name))
    conn.commit()
    conn.close()
    
    return {
        "status": "success",
        "reward_coins": WORLD_BOSS_REWARD_COINS,
        "reward_dna": WORLD_BOSS_REWARD_DNA,
        "damage_dealt": dmg_row["damage"],
        "new_coins": new_coins
    }