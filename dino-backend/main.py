from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
from datetime import datetime, date
import db

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

# --- Рекорды ---
@app.get("/api/leaderboard")
def get_leaderboard():
    conn = db.get_db_connection()
    rows = conn.execute("SELECT name, score FROM scores ORDER BY score DESC LIMIT 5").fetchall()
    conn.close()
    return [{"name": row["name"], "score": row["score"]} for row in rows]

@app.post("/api/score")
def add_score(payload: ScorePayload):
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
def save_player(payload: PlayerSave):
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

# --- Ежедневная награда ---
@app.post("/api/player/daily")
def claim_daily(payload: PlayerLoad):
    clean_name = payload.name.strip()[:20] or "Игрок"
    today_str = date.today().isoformat()
    
    conn = db.get_db_connection()
    row = conn.execute("SELECT last_daily, streak, coins FROM players WHERE name = ?", (clean_name,)).fetchone()
    
    # ЕСЛИ ИГРОКА НЕТ - СОЗДАЕМ ЕГО
    if not row:
        conn.execute("INSERT INTO players (name) VALUES (?)", (clean_name,))
        conn.commit()
        row = conn.execute("SELECT last_daily, streak, coins FROM players WHERE name = ?", (clean_name,)).fetchone()
        
    last_daily = row["last_daily"]
    streak = row["streak"]
    
    if last_daily == today_str:
        return {"status": "already_claimed", "streak": streak}
        
    # Начисляем награду
    reward = 10 + (streak * 5)
    new_coins = row["coins"] + reward
    new_streak = streak + 1
    
    conn.execute("""
        UPDATE players SET last_daily = ?, streak = ?, coins = ? WHERE name = ?
    """, (today_str, new_streak, new_coins, clean_name))
    conn.commit()
    conn.close()
    
    return {"status": "success", "reward": reward, "streak": new_streak, "coins": new_coins}