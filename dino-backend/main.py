from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
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

# Новые модели для RPG
class PlayerLoad(BaseModel):
    name: str

class PlayerSave(BaseModel):
    name: str
    coins: int
    quests_done: int

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

# Загрузка профиля игрока
@app.post("/api/player/load")
def load_player(payload: PlayerLoad):
    conn = db.get_db_connection()
    row = conn.execute("SELECT coins, quests_done FROM players WHERE name = ?", (payload.name,)).fetchone()
    conn.close()
    if row:
        return {"coins": row["coins"], "quests_done": row["quests_done"]}
    return {"coins": 0, "quests_done": 0} # Если новый игрок

# Сохранение прогресса
@app.post("/api/player/save")
def save_player(payload: PlayerSave):
    clean_name = payload.name.strip()[:20] or "Игрок"
    conn = db.get_db_connection()
    conn.execute("""
        INSERT INTO players (name, coins, quests_done) VALUES (?, ?, ?)
        ON CONFLICT(name) DO UPDATE SET 
            coins = excluded.coins, 
            quests_done = excluded.quests_done
    """, (clean_name, payload.coins, payload.quests_done))
    conn.commit()
    conn.close()
    return {"status": "ok"}