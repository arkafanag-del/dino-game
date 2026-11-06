import hashlib
import hmac
import json
import os
import re
import secrets
import time
from contextlib import asynccontextmanager
from datetime import date, datetime, timedelta, timezone
from threading import Lock
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict

import db

MAX_SCORE = 999_999
WORLD_BOSS_BASE_HP = 100_000
WORLD_BOSS_REWARD_COINS = 500
WORLD_BOSS_REWARD_DNA = 200
RATE_LIMIT_WINDOW = float(os.getenv("RATE_LIMIT_WINDOW", "10"))
RATE_LIMIT_MAX_REQUESTS = int(os.getenv("RATE_LIMIT_MAX_REQUESTS", "5"))
AUTH_RATE_LIMIT_WINDOW = int(os.getenv("AUTH_RATE_LIMIT_WINDOW", "60"))
AUTH_RATE_LIMIT_MAX_REQUESTS = int(os.getenv("AUTH_RATE_LIMIT_MAX_REQUESTS", "10"))
MAX_BODY_BYTES = int(os.getenv("MAX_BODY_BYTES", "16384"))
NAME_RE = re.compile(r"^[\w \-]{1,20}$", re.UNICODE)
SESSION_TTL_SECONDS = int(os.getenv("SESSION_TTL_SECONDS", str(30 * 24 * 60 * 60)))
# Слишком маленькое число итераций сделало бы подбор пароля дешёвым,
# но и слишком большое нельзя: _verify_password отвергает хэши выше
# MAX_PASSWORD_ITERATIONS, иначе аккаунт стал бы недоступен.
MIN_PASSWORD_ITERATIONS = 100_000
MAX_PASSWORD_ITERATIONS = 1_000_000
PASSWORD_ITERATIONS = min(
    MAX_PASSWORD_ITERATIONS,
    max(MIN_PASSWORD_ITERATIONS, int(os.getenv("PASSWORD_ITERATIONS", "200000"))),
)
MIN_RUN_SECONDS = int(os.getenv("MIN_RUN_SECONDS", "10"))
MIN_WORLD_BOSS_DAMAGE_FOR_REWARD = int(os.getenv("MIN_WORLD_BOSS_DAMAGE_FOR_REWARD", "1000"))
MAX_WORLD_BOSS_DPS = float(os.getenv("MAX_WORLD_BOSS_DPS", "100"))
# За прокси (Fly/Render) реальный IP приходит в заголовке. Доверяем ему
# только если приложение действительно стоит за доверенным прокси.
TRUST_PROXY_HEADERS = os.getenv("TRUST_PROXY_HEADERS", "0") == "1"

# --- Экономика ---
MAX_COINS = int(os.getenv("MAX_COINS", "10000000"))
MAX_COINS_PER_RUN = int(os.getenv("MAX_COINS_PER_RUN", "5000"))
MAX_COINS_PER_SECOND = float(os.getenv("MAX_COINS_PER_SECOND", "20"))
MAX_SCORE_PER_SECOND = float(os.getenv("MAX_SCORE_PER_SECOND", "12"))
MAX_RUN_SECONDS = int(os.getenv("MAX_RUN_SECONDS", str(2 * 60 * 60)))
MAX_DAILY_EARN = int(os.getenv("MAX_DAILY_EARN", "15000"))
MAX_WORLD_BOSS_DAMAGE = int(os.getenv("MAX_WORLD_BOSS_DAMAGE", "5000"))

# Старый клиент присылает абсолютный coins. Оставляем только учёт трат:
# увеличивать баланс через этот путь нельзя (иначе это печатный станок).
LEGACY_SAVE_ENABLED = os.getenv("LEGACY_SAVE_ENABLED", "0") == "1"

ALLOWED_SKINS = {"default", "raptor", "ptero"}
SKIN_PRICES = {"raptor": 100, "ptero": 200}
# Расходники магазина остаются клиентскими (владение хранится в браузере),
# но списание монет идёт через сервер, иначе покупка была бы бесплатной.
SHOP_ITEM_PRICES = {
    "glasses": 15,
    "shoes": 30,
    "magnet": 50,
    "pet": 200,
    "dog": 300,
}
EXCHANGE_DNA_UNIT = 10

# --- Казино ---
# Исходы генерируются только на сервере криптографически стойким RNG.
# Клиент присылает игру и свой выбор, но не результат и не размер выигрыша.
CASINO_COSTS = {
    "roulette": 50,
    "coinflip": 25,
    "dice": 10,
    "jackpot": 150,
}

ROULETTE_PRIZES = [
    {"id": "coins_30", "icon": "🪙", "label": "+30 🪙", "weight": 30, "type": "coins", "value": 30},
    {"id": "coins_75", "icon": "💰", "label": "+75 🪙", "weight": 20, "type": "coins", "value": 75},
    {"id": "coins_150", "icon": "💎", "label": "+150 🪙", "weight": 5, "type": "coins", "value": 150},
    {"id": "dna_10", "icon": "🧬", "label": "+10 🧬", "weight": 20, "type": "dna", "value": 10},
    {"id": "dna_30", "icon": "🧪", "label": "+30 🧬", "weight": 5, "type": "dna", "value": 30},
    {"id": "skin_raptor", "icon": "🦅", "label": "Раптор", "weight": 5, "type": "skin", "value": "raptor"},
    {"id": "skin_ptero", "icon": "🦇", "label": "Птеродактиль", "weight": 2, "type": "skin", "value": "ptero"},
    {"id": "trail_fire", "icon": "🔥", "label": "Огонь", "weight": 5, "type": "trail", "value": "fire"},
    {"id": "trail_neon", "icon": "💠", "label": "Неон", "weight": 5, "type": "trail", "value": "neon"},
    {"id": "trail_gold", "icon": "⭐", "label": "Золото", "weight": 3, "type": "trail", "value": "gold"},
]

# Старый клиентский джекпот был «печатным станком»: при цене 150
# ожидаемая выплата только монетами составляла 180. Здесь веса
# сбалансированы так, чтобы ожидаемая выплата монетами была 140.
JACKPOT_PRIZES = [
    {"id": "coins_100", "icon": "🪙", "label": "+100 🪙", "weight": 30, "type": "coins", "value": 100},
    {"id": "coins_300", "icon": "🪙", "label": "+300 🪙", "weight": 15, "type": "coins", "value": 300},
    {"id": "coins_750", "icon": "💰", "label": "+750 🪙", "weight": 6, "type": "coins", "value": 750},
    {"id": "dna_50", "icon": "🧬", "label": "+50 🧬", "weight": 24, "type": "dna", "value": 50},
    {"id": "dna_150", "icon": "🧪", "label": "+150 🧬", "weight": 10, "type": "dna", "value": 150},
    {"id": "trail_fire", "icon": "🔥", "label": "Шлейф Огонь", "weight": 5, "type": "trail", "value": "fire"},
    {"id": "trail_neon", "icon": "💠", "label": "Шлейф Неон", "weight": 5, "type": "trail", "value": "neon"},
    {"id": "trail_gold", "icon": "⭐", "label": "Шлейф Золото", "weight": 3, "type": "trail", "value": "gold"},
    {"id": "trail_rainbow", "icon": "🌈", "label": "ЛЕГЕНДАРНЫЙ Шлейф", "weight": 1, "type": "trail", "value": "rainbow"},
    {"id": "jackpot_2000", "icon": "💎", "label": "ДЖЕКПОТ! +2000 🪙", "weight": 1, "type": "coins", "value": 2000},
]

NO_PRIZE = {
    "id": "none",
    "icon": "❌",
    "label": "Без выигрыша",
    "weight": 0,
    "type": "none",
    "value": 0,
}

SKIN_DUPLICATE_COMPENSATION = 30

_rate_limit_store: dict[str, list[float]] = {}
_rate_limit_lock = Lock()
_rate_limit_last_prune = 0.0
# Записи старше самого длинного окна уже не влияют ни на один лимит.
_RATE_LIMIT_RETENTION = max(RATE_LIMIT_WINDOW, float(AUTH_RATE_LIMIT_WINDOW), 60.0)
# Жёсткий предел на число ключей: имя/IP присылает клиент, поэтому без
# предела словарь рос бы бесконечно (утечка памяти / DoS).
RATE_LIMIT_MAX_KEYS = max(1000, int(os.getenv("RATE_LIMIT_MAX_KEYS", "50000")))
RATE_LIMIT_PRUNE_INTERVAL = max(1.0, float(os.getenv("RATE_LIMIT_PRUNE_INTERVAL", "60")))


def _prune_rate_limit(now: float) -> None:
    global _rate_limit_last_prune
    for key in list(_rate_limit_store):
        entries = _rate_limit_store[key]
        entries[:] = [t for t in entries if now - t < _RATE_LIMIT_RETENTION]
        if not entries:
            del _rate_limit_store[key]
    _rate_limit_last_prune = now


def _client_ip(request: Request) -> str:
    if TRUST_PROXY_HEADERS:
        fly_ip = request.headers.get("fly-client-ip")
        if fly_ip:
            return fly_ip.strip()
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",", 1)[0].strip()
    return request.client.host if request.client else "unknown"


def _check_rate_limit(
    key: str,
    max_requests: int = RATE_LIMIT_MAX_REQUESTS,
    window: float = RATE_LIMIT_WINDOW,
) -> bool:
    with _rate_limit_lock:
        now = time.time()
        if (
            now - _rate_limit_last_prune >= RATE_LIMIT_PRUNE_INTERVAL
            or len(_rate_limit_store) >= RATE_LIMIT_MAX_KEYS
        ):
            _prune_rate_limit(now)
            # Если ключей всё ещё слишком много (много «живых» IP/имён),
            # освобождаем половину самых старых, чтобы память не росла.
            if len(_rate_limit_store) >= RATE_LIMIT_MAX_KEYS:
                for _ in range(len(_rate_limit_store) - RATE_LIMIT_MAX_KEYS // 2):
                    oldest = next(iter(_rate_limit_store))
                    del _rate_limit_store[oldest]

        entries = _rate_limit_store.get(key)
        if entries is None:
            entries = []
            _rate_limit_store[key] = entries
        entries[:] = [t for t in entries if now - t < window]
        if len(entries) >= max_requests:
            return False
        entries.append(now)
        return True


def _enforce_rate_limit(
    request: Request,
    scope: str,
    player_name: Optional[str] = None,
) -> None:
    ip = _client_ip(request)
    if not _check_rate_limit(f"{scope}:ip:{ip}"):
        raise HTTPException(status_code=429, detail="Too many requests")
    if player_name and not _check_rate_limit(
        f"{scope}:player:{player_name}",
        max_requests=RATE_LIMIT_MAX_REQUESTS * 2,
    ):
        raise HTTPException(status_code=429, detail="Too many requests")


def get_week_key() -> str:
    iso = date.today().isocalendar()
    return f"{iso.year}-W{iso.week:02d}"


def _today_str() -> str:
    return date.today().isoformat()


def _clean_name(name: str) -> str:
    return (name or "").strip()[:20]


def _validate_name(name: str) -> str:
    cleaned = (name or "").strip()
    if not NAME_RE.fullmatch(cleaned):
        raise HTTPException(status_code=400, detail="Invalid player name")
    return cleaned


def _require_same_name(requested: Optional[str], authenticated: str) -> None:
    if requested is not None and requested.strip() != authenticated:
        raise HTTPException(status_code=403, detail="Name mismatch")


def _hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS
    )
    return f"pbkdf2_sha256${PASSWORD_ITERATIONS}${salt.hex()}${digest.hex()}"


# Хэш-пустышка: логин несуществующего игрока должен занимать столько же
# времени, сколько логин существующего (защита от перебора имён).
_DUMMY_PASSWORD_HASH = _hash_password(secrets.token_urlsafe(16))


def _verify_password(password: str, stored: str) -> bool:
    try:
        algorithm, iterations_raw, salt_hex, digest_hex = stored.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        iterations = int(iterations_raw)
        if iterations < MIN_PASSWORD_ITERATIONS or iterations > MAX_PASSWORD_ITERATIONS:
            return False
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(digest_hex)
    except (AttributeError, ValueError):
        return False
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return hmac.compare_digest(digest, expected)


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _issue_session(conn, name: str) -> tuple[str, float]:
    token = secrets.token_urlsafe(32)
    now = time.time()
    expires_at = now + SESSION_TTL_SECONDS
    conn.execute("DELETE FROM sessions WHERE expires_at < ?", (now,))
    conn.execute(
        "INSERT INTO sessions (token_hash, player_name, created_at, expires_at) VALUES (?, ?, ?, ?)",
        (_hash_token(token), name, now, expires_at),
    )
    return token, expires_at


def get_current_player(request: Request) -> str:
    authorization = request.headers.get("authorization", "")
    scheme, _, token = authorization.partition(" ")
    token = token.strip()
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_hash = _hash_token(token)
    now = time.time()
    conn = db.get_db_connection()
    try:
        row = conn.execute(
            """SELECT s.player_name, s.expires_at
               FROM sessions s
               JOIN players p ON p.name = s.player_name
               WHERE s.token_hash = ?""",
            (token_hash,),
        ).fetchone()
    finally:
        conn.close()

    if not row or float(row["expires_at"] or 0) < now:
        if row:
            with db.transaction() as conn:
                conn.execute("DELETE FROM sessions WHERE token_hash = ?", (token_hash,))
        raise HTTPException(
            status_code=401,
            detail="Session expired or invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return row["player_name"]


def _get_player(conn, name: str):
    return conn.execute("SELECT * FROM players WHERE name = ?", (name,)).fetchone()


def _ensure_player(conn, name: str):
    now = time.time()
    conn.execute(
        "INSERT OR IGNORE INTO players (name, created_at, updated_at) VALUES (?, ?, ?)",
        (name, now, now),
    )
    return _get_player(conn, name)


def _parse_skins(raw: Optional[str]) -> list[str]:
    # Старые клиенты могли сохранить сюда строку произвольной длины.
    raw = (raw or "").strip()[:4096]
    if not raw:
        return ["default"]
    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return [str(x) for x in data if isinstance(x, str)]
    except (TypeError, ValueError):
        pass
    return [part.strip() for part in raw.split(",") if part.strip()] or ["default"]


def _sanitize_skins(raw: Optional[str]) -> str:
    skins = [s for s in _parse_skins(raw) if s in ALLOWED_SKINS]
    if "default" not in skins:
        skins.insert(0, "default")
    return json.dumps(sorted(set(skins)))


def _profile(row) -> dict:
    safe_skins = _sanitize_skins(row["unlocked_skins"])
    owned = set(_parse_skins(safe_skins))
    selected = row["selected_skin"] or "default"
    if selected not in owned:
        selected = "default"
    return {
        "name": row["name"],
        "coins": int(row["coins"] or 0),
        "quests_done": int(row["quests_done"] or 0),
        "selected_skin": selected,
        "unlocked_skins": safe_skins,
        "last_daily": row["last_daily"] or "",
        "streak": int(row["streak"] or 0),
        "daily_earned": int(row["daily_earned"] or 0),
        "daily_limit": MAX_DAILY_EARN,
    }


def _daily_state(row, today: str) -> int:
    if (row["daily_earned_date"] or "") == today:
        return int(row["daily_earned"] or 0)
    return 0


def _log_tx(conn, name: str, amount: int, balance_after: int, reason: str, meta: Optional[dict] = None):
    conn.execute(
        """INSERT INTO transactions (player_name, amount, balance_after, reason, meta, created_at)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (name, amount, balance_after, reason, json.dumps(meta or {}, ensure_ascii=False), time.time()),
    )


def _secure_weighted_choice(prizes: list[dict]) -> dict:
    """Криптографически стойкий выбор приза по весам."""
    total = sum(int(prize["weight"]) for prize in prizes)
    roll = secrets.randbelow(total)
    for prize in prizes:
        roll -= int(prize["weight"])
        if roll < 0:
            return prize
    return prizes[-1]


def _public_prize(prize: dict) -> dict:
    """Приз без служебного поля weight — его не нужно отдавать клиенту."""
    return {key: prize[key] for key in ("id", "icon", "label", "type", "value")}


def _settle_casino(
    conn,
    name: str,
    game: str,
    cost: int,
    prize: dict,
    now: float,
    result: Optional[dict] = None,
):
    """Атомарно списывает ставку и начисляет приз.

    Вызывается только внутри db.transaction() с BEGIN IMMEDIATE, поэтому
    два параллельных спина не могут одновременно прочитать один баланс
    и дважды потратить одни и те же монеты.
    """
    player = _ensure_player(conn, name)
    coins = int(player["coins"] or 0)
    if coins < cost:
        raise HTTPException(status_code=400, detail="Not enough coins")

    meta = {
        "game": game,
        "prize_id": prize["id"],
        "prize_type": prize["type"],
        "prize_value": prize["value"],
        "result": result or {},
    }

    balance = coins - cost
    _log_tx(conn, name, -cost, balance, "casino_bet", meta)

    public_prize = _public_prize(prize)
    awarded = 0

    if prize["type"] == "coins":
        nominal = int(prize["value"])
        awarded = max(0, min(nominal, MAX_COINS - balance))
        if awarded > 0:
            balance += awarded
            _log_tx(conn, name, awarded, balance, "casino_prize", {
                **meta,
                "coins_awarded": awarded,
            })
        if awarded < nominal:
            public_prize["clamped"] = True
            public_prize["credited"] = awarded

    elif prize["type"] == "skin":
        skin = str(prize["value"])
        owned = set(_parse_skins(_sanitize_skins(player["unlocked_skins"])))
        if skin in owned:
            # Скин уже есть — компенсация монетами, как в старом клиенте.
            awarded = max(0, min(SKIN_DUPLICATE_COMPENSATION, MAX_COINS - balance))
            balance += awarded
            public_prize["already_owned"] = True
            public_prize["compensation"] = awarded
            _log_tx(conn, name, awarded, balance, "casino_prize", {
                **meta,
                "duplicate_skin": True,
                "coins_awarded": awarded,
            })
        else:
            owned.add(skin)
            conn.execute(
                """UPDATE players
                   SET unlocked_skins = ?, selected_skin = ?, updated_at = ?
                   WHERE name = ?""",
                (json.dumps(sorted(owned)), skin, now, name),
            )
            _log_tx(conn, name, 0, balance, "casino_prize", {
                **meta,
                "skin_unlocked": skin,
            })

    else:
        # DNA и шлейфы пока живут на клиенте: сервер фиксирует исход,
        # а клиент применяет его к local state. Монеты сюда не входят.
        _log_tx(conn, name, 0, balance, "casino_prize", meta)

    conn.execute(
        "UPDATE players SET coins = ?, updated_at = ? WHERE name = ?",
        (balance, now, name),
    )
    return _get_player(conn, name), public_prize, awarded


def _legacy_spend_sync(conn, row, name: str, claimed_coins: int, now: float):
    """Старый режим: клиент присылает абсолютный баланс.

    Разрешаем только уменьшение баланса, чтобы траты не откатывались.
    Увеличение через этот путь запрещено: старый клиент не должен
    иметь возможность «дорисовать» себе монеты.
    """
    claimed = max(0, min(int(claimed_coins), MAX_COINS))
    server_coins = int(row["coins"] or 0)
    if claimed >= server_coins:
        return
    conn.execute(
        "UPDATE players SET coins = ?, updated_at = ? WHERE name = ?",
        (claimed, now, name),
    )
    _log_tx(conn, name, claimed - server_coins, claimed, "legacy_spend")


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    yield


app = FastAPI(lifespan=lifespan)


@app.middleware("http")
async def limit_request_body(request: Request, call_next):
    # Ограничиваем размер тела по Content-Length. Если заголовка нет и нет
    # Transfer-Encoding, тела у запроса нет (например, POST /logout),
    # поэтому такой запрос пропускаем. Chunked-тело без Content-Length
    # проверить до чтения нельзя — отклоняем.
    if request.method in {"POST", "PUT", "PATCH"}:
        content_length = request.headers.get("content-length")
        transfer_encoding = request.headers.get("transfer-encoding")
        if content_length is None:
            if transfer_encoding:
                return JSONResponse(
                    status_code=411,
                    content={"detail": "Content-Length required"},
                )
        else:
            if transfer_encoding:
                # Одновременные Content-Length и Transfer-Encoding — признак
                # попытки request smuggling; сервер не должен это принимать.
                return JSONResponse(
                    status_code=400,
                    content={"detail": "Ambiguous request framing"},
                )
            try:
                too_large = int(content_length) > MAX_BODY_BYTES
            except ValueError:
                return JSONResponse(status_code=400, content={"detail": "Invalid Content-Length"})
            if too_large:
                return JSONResponse(status_code=413, content={"detail": "Request body too large"})
    return await call_next(request)


CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "*").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)


class ScorePayload(BaseModel):
    name: str
    score: int


class PlayerLoad(BaseModel):
    name: str


class PlayerSave(BaseModel):
    name: str
    # coins принимается только для обратной совместимости и только
    # для учёта трат (уменьшения баланса). Увеличение запрещено.
    coins: Optional[int] = None
    quests_done: Optional[int] = None
    # None означает «клиент не выбирал скин»: нельзя сбрасывать
    # сохранённый выбор на default при каждом сохранении профиля.
    selected_skin: Optional[str] = None
    model_config = ConfigDict(extra="ignore")


class AuthRegister(BaseModel):
    name: str
    password: str


class AuthLogin(BaseModel):
    name: str
    password: str


class SkinBuyPayload(BaseModel):
    name: str
    skin: str


class ShopItemPayload(BaseModel):
    name: str
    item: str


class ExchangeBuyPayload(BaseModel):
    name: str


class CasinoBasePayload(BaseModel):
    name: str


class CasinoCoinflipPayload(CasinoBasePayload):
    choice: str


class CasinoDicePayload(CasinoBasePayload):
    value: int


class WorldBossDamagePayload(BaseModel):
    name: str
    damage: int
    run_id: str


class WorldBossClaimPayload(BaseModel):
    name: str


class RunStartPayload(BaseModel):
    name: str


class RunFinishPayload(BaseModel):
    name: str
    run_id: str
    score: int
    coins_earned: int
    quests_completed: int = 0
    bosses_killed: int = 0
    loops: int = 1


# --- Аутентификация ---
@app.post("/api/auth/register")
def register(payload: AuthRegister, request: Request):
    if not _check_rate_limit(
        f"auth:register:{_client_ip(request)}",
        max_requests=AUTH_RATE_LIMIT_MAX_REQUESTS,
        window=AUTH_RATE_LIMIT_WINDOW,
    ):
        raise HTTPException(status_code=429, detail="Too many requests")

    name = _validate_name(payload.name)
    password = payload.password or ""
    if len(password) < 8 or len(password) > 128:
        raise HTTPException(status_code=400, detail="Password must be 8-128 characters")

    now = time.time()
    password_hash = _hash_password(password)
    with db.transaction() as conn:
        cursor = conn.execute(
            """INSERT OR IGNORE INTO players (name, password_hash, created_at, updated_at)
               VALUES (?, ?, ?, ?)""",
            (name, password_hash, now, now),
        )
        if cursor.rowcount != 1:
            raise HTTPException(status_code=409, detail="Name already taken")
        token, expires_at = _issue_session(conn, name)
        row = _get_player(conn, name)

    return {"token": token, "expires_at": expires_at, "profile": _profile(row)}


@app.post("/api/auth/login")
def login(payload: AuthLogin, request: Request):
    if not _check_rate_limit(
        f"auth:login:{_client_ip(request)}",
        max_requests=AUTH_RATE_LIMIT_MAX_REQUESTS,
        window=AUTH_RATE_LIMIT_WINDOW,
    ):
        raise HTTPException(status_code=429, detail="Too many requests")

    # Логин не создаёт имя, поэтому допускаем старые имена,
    # которые могли не проходить новую валидацию.
    name = _clean_name(payload.name)
    if not _check_rate_limit(
        f"auth:login:name:{name}",
        max_requests=AUTH_RATE_LIMIT_MAX_REQUESTS,
        window=AUTH_RATE_LIMIT_WINDOW,
    ):
        raise HTTPException(status_code=429, detail="Too many requests")

    conn = db.get_db_connection()
    try:
        row = _get_player(conn, name)
    finally:
        conn.close()

    # Всегда выполняем PBKDF2, даже если имени нет: иначе по времени
    # ответа можно узнать, зарегистрирован ли игрок.
    stored_hash = (
        row["password_hash"]
        if row and row["password_hash"]
        else _DUMMY_PASSWORD_HASH
    )
    password_ok = _verify_password(payload.password or "", stored_hash)
    if not row or not row["password_hash"] or not password_ok:
        raise HTTPException(status_code=401, detail="Invalid name or password")

    with db.transaction() as conn:
        token, expires_at = _issue_session(conn, name)
        row = _get_player(conn, name)

    return {"token": token, "expires_at": expires_at, "profile": _profile(row)}


@app.post("/api/auth/logout")
def logout(request: Request, player_name: str = Depends(get_current_player)):
    authorization = request.headers.get("authorization", "")
    _, _, token = authorization.partition(" ")
    token = token.strip()
    if token:
        with db.transaction() as conn:
            conn.execute(
                "DELETE FROM sessions WHERE token_hash = ?",
                (_hash_token(token),),
            )
    return {"status": "ok"}


@app.get("/api/auth/me")
def auth_me(player_name: str = Depends(get_current_player)):
    conn = db.get_db_connection()
    try:
        row = _get_player(conn, name=player_name)
    finally:
        conn.close()
    if not row:
        raise HTTPException(status_code=401, detail="Player not found")
    return _profile(row)


# --- Рекорды ---
@app.get("/api/leaderboard")
def get_leaderboard(request: Request):
    _enforce_rate_limit(request, "leaderboard")
    conn = db.get_db_connection()
    try:
        rows = conn.execute("SELECT name, score FROM scores ORDER BY score DESC LIMIT 5").fetchall()
    finally:
        conn.close()
    return [{"name": row["name"], "score": row["score"]} for row in rows]


@app.post("/api/score")
def add_score(
    payload: ScorePayload,
    request: Request,
    player_name: str = Depends(get_current_player),
):
    _require_same_name(payload.name, player_name)
    _enforce_rate_limit(request, "score", player_name)

    # Рекорд обновляется только в /api/run/finish по проверенному сервером score.
    # Эндпоинт оставлен для совместимости и возвращает серверный рекорд.
    conn = db.get_db_connection()
    try:
        row = conn.execute("SELECT score FROM scores WHERE name = ?", (player_name,)).fetchone()
    finally:
        conn.close()
    return {"status": "ok", "score": int(row["score"]) if row else 0}


# --- Профиль ---
@app.post("/api/player/load")
def load_player(
    payload: PlayerLoad,
    request: Request,
    player_name: str = Depends(get_current_player),
):
    _require_same_name(payload.name, player_name)
    _enforce_rate_limit(request, "load", player_name)
    conn = db.get_db_connection()
    try:
        row = _get_player(conn, player_name)
    finally:
        conn.close()
    if row:
        return _profile(row)
    return {
        "name": player_name,
        "coins": 0,
        "quests_done": 0,
        "selected_skin": "default",
        "unlocked_skins": '["default"]',
        "last_daily": "",
        "streak": 0,
        "daily_earned": 0,
        "daily_limit": MAX_DAILY_EARN,
    }


@app.post("/api/player/save")
def save_player(
    payload: PlayerSave,
    request: Request,
    player_name: str = Depends(get_current_player),
):
    _require_same_name(payload.name, player_name)
    _enforce_rate_limit(request, "save", player_name)

    name = player_name
    requested_skin = (payload.selected_skin or "").strip()[:30]
    now = time.time()

    with db.transaction() as conn:
        row = _ensure_player(conn, name)

        # Косметика: клиент может только выбрать скин из уже открытых.
        # Открывать скины через save нельзя — только через магазин/казино.
        safe_skins = _sanitize_skins(row["unlocked_skins"])
        if safe_skins != (row["unlocked_skins"] or ""):
            conn.execute(
                "UPDATE players SET unlocked_skins = ?, updated_at = ? WHERE name = ?",
                (safe_skins, now, name),
            )
        owned = set(_parse_skins(safe_skins))
        if requested_skin and requested_skin in ALLOWED_SKINS and requested_skin in owned:
            conn.execute(
                "UPDATE players SET selected_skin = ?, updated_at = ? WHERE name = ?",
                (requested_skin, now, name),
            )

        # Старый клиент: только траты. Увеличение баланса здесь запрещено.
        if payload.coins is not None and LEGACY_SAVE_ENABLED:
            _legacy_spend_sync(conn, row, name, payload.coins, now)

        row = _get_player(conn, name)

    return {"status": "ok", **_profile(row)}


@app.post("/api/shop/buy-skin")
def buy_skin(
    payload: SkinBuyPayload,
    request: Request,
    player_name: str = Depends(get_current_player),
):
    _require_same_name(payload.name, player_name)
    _enforce_rate_limit(request, "shop", player_name)

    name = player_name
    skin = payload.skin.strip()
    if skin not in SKIN_PRICES:
        raise HTTPException(status_code=400, detail="Unknown skin")

    now = time.time()
    with db.transaction() as conn:
        row = _ensure_player(conn, name)
        owned = set(_parse_skins(_sanitize_skins(row["unlocked_skins"])))
        if skin in owned:
            return {"status": "already_owned", **_profile(row)}

        price = SKIN_PRICES[skin]
        coins = int(row["coins"] or 0)
        if coins < price:
            raise HTTPException(status_code=400, detail="Not enough coins")

        new_balance = coins - price
        new_skins = json.dumps(sorted(owned | {skin}))
        conn.execute(
            """UPDATE players
               SET coins = ?, unlocked_skins = ?, selected_skin = ?, updated_at = ?
               WHERE name = ?""",
            (new_balance, new_skins, skin, now, name),
        )
        _log_tx(conn, name, -price, new_balance, "shop_skin", {"skin": skin})
        row = _get_player(conn, name)

    return {"status": "ok", **_profile(row)}


@app.post("/api/shop/buy-item")
def buy_shop_item(
    payload: ShopItemPayload,
    request: Request,
    player_name: str = Depends(get_current_player),
):
    """Списывает монеты за клиентский расходник (очки, кроссовки и т.п.).

    Владение расходником остаётся в localStorage: сервер не хранит его,
    но и не позволяет получить покупку бесплатно — монеты списываются здесь.
    """
    _require_same_name(payload.name, player_name)
    _enforce_rate_limit(request, "shop", player_name)

    name = player_name
    item = payload.item.strip()
    price = SHOP_ITEM_PRICES.get(item)
    if price is None:
        raise HTTPException(status_code=400, detail="Unknown item")

    now = time.time()
    with db.transaction() as conn:
        row = _ensure_player(conn, name)
        coins = int(row["coins"] or 0)
        if coins < price:
            raise HTTPException(status_code=400, detail="Not enough coins")

        new_balance = coins - price
        conn.execute(
            "UPDATE players SET coins = ?, updated_at = ? WHERE name = ?",
            (new_balance, now, name),
        )
        _log_tx(conn, name, -price, new_balance, "shop_item", {"item": item})
        row = _get_player(conn, name)

    return {"status": "ok", "item": item, "price": price, **_profile(row)}


@app.post("/api/player/daily")
def claim_daily(
    payload: PlayerLoad,
    request: Request,
    player_name: str = Depends(get_current_player),
):
    _require_same_name(payload.name, player_name)
    _enforce_rate_limit(request, "daily", player_name)

    name = player_name
    today = _today_str()
    yesterday = (date.today() - timedelta(days=1)).isoformat()

    with db.transaction() as conn:
        row = _ensure_player(conn, name)
        if row["last_daily"] == today:
            return {"status": "already_claimed", "streak": int(row["streak"] or 0), "coins": int(row["coins"] or 0)}

        old_streak = int(row["streak"] or 0)
        new_streak = old_streak + 1 if row["last_daily"] == yesterday else 1
        reward = min(10 + (new_streak - 1) * 5, 100)
        coins_now = int(row["coins"] or 0)
        awarded = max(0, min(reward, MAX_COINS - coins_now))
        new_coins = coins_now + awarded

        conn.execute(
            """UPDATE players
               SET last_daily = ?, streak = ?, coins = ?, updated_at = ?
               WHERE name = ?""",
            (today, new_streak, new_coins, time.time(), name),
        )
        _log_tx(conn, name, awarded, new_coins, "daily", {
            "streak": new_streak,
            "requested": reward,
        })

    return {"status": "success", "reward": awarded, "streak": new_streak, "coins": new_coins}


# --- Казино ---
# Клиент не выбирает исход. Он лишь сообщает, какую игру и какой вариант
# (орёл/решка или грань кубика) он выбрал. Ставка, RNG и выплата — на сервере.
@app.post("/api/casino/roulette")
def casino_roulette(
    payload: CasinoBasePayload,
    request: Request,
    player_name: str = Depends(get_current_player),
):
    _require_same_name(payload.name, player_name)
    _enforce_rate_limit(request, "casino", player_name)

    name = player_name
    prize = _secure_weighted_choice(ROULETTE_PRIZES)
    now = time.time()

    with db.transaction() as conn:
        player, public_prize, awarded = _settle_casino(
            conn, name, "roulette", CASINO_COSTS["roulette"], prize, now,
            {"prize_id": prize["id"]},
        )

    return {
        "status": "ok",
        "game": "roulette",
        "bet": CASINO_COSTS["roulette"],
        "prize": public_prize,
        "coins_won": awarded,
        **_profile(player),
    }


@app.post("/api/casino/coinflip")
def casino_coinflip(
    payload: CasinoCoinflipPayload,
    request: Request,
    player_name: str = Depends(get_current_player),
):
    _require_same_name(payload.name, player_name)
    _enforce_rate_limit(request, "casino", player_name)

    choice = (payload.choice or "").strip().lower()
    if choice not in ("heads", "tails"):
        raise HTTPException(status_code=400, detail="Invalid choice")

    name = player_name
    side = "heads" if secrets.randbelow(2) == 0 else "tails"
    cost = CASINO_COSTS["coinflip"]

    if side == choice:
        prize = {
            "id": "coinflip_win",
            "icon": "👑" if side == "heads" else "🪙",
            "label": f"Победа: +{cost * 2} 🪙",
            "weight": 1,
            "type": "coins",
            "value": cost * 2,
        }
    else:
        prize = NO_PRIZE

    now = time.time()
    with db.transaction() as conn:
        player, public_prize, awarded = _settle_casino(
            conn, name, "coinflip", cost, prize, now, {"side": side},
        )

    return {
        "status": "ok",
        "game": "coinflip",
        "bet": cost,
        "prize": public_prize,
        "coins_won": awarded,
        "result": {"side": side},
        **_profile(player),
    }


@app.post("/api/casino/dice")
def casino_dice(
    payload: CasinoDicePayload,
    request: Request,
    player_name: str = Depends(get_current_player),
):
    _require_same_name(payload.name, player_name)
    _enforce_rate_limit(request, "casino", player_name)
    if payload.value < 1 or payload.value > 6:
        raise HTTPException(status_code=400, detail="Invalid dice value")

    name = player_name
    rolled = secrets.randbelow(6) + 1
    cost = CASINO_COSTS["dice"]

    if rolled == payload.value:
        prize = {
            "id": "dice_win",
            "icon": "🎲",
            "label": f"Победа: +{cost * 5} 🪙",
            "weight": 1,
            "type": "coins",
            "value": cost * 5,
        }
    else:
        prize = NO_PRIZE

    now = time.time()
    with db.transaction() as conn:
        player, public_prize, awarded = _settle_casino(
            conn, name, "dice", cost, prize, now, {"rolled": rolled},
        )

    return {
        "status": "ok",
        "game": "dice",
        "bet": cost,
        "prize": public_prize,
        "coins_won": awarded,
        "result": {"rolled": rolled},
        **_profile(player),
    }


@app.post("/api/casino/jackpot")
def casino_jackpot(
    payload: CasinoBasePayload,
    request: Request,
    player_name: str = Depends(get_current_player),
):
    _require_same_name(payload.name, player_name)
    _enforce_rate_limit(request, "casino", player_name)

    name = player_name
    prize = _secure_weighted_choice(JACKPOT_PRIZES)
    now = time.time()

    with db.transaction() as conn:
        player, public_prize, awarded = _settle_casino(
            conn, name, "jackpot", CASINO_COSTS["jackpot"], prize, now,
            {"prize_id": prize["id"]},
        )

    return {
        "status": "ok",
        "game": "jackpot",
        "bet": CASINO_COSTS["jackpot"],
        "prize": public_prize,
        "coins_won": awarded,
        **_profile(player),
    }


# --- Серверные забеги ---
# Новый клиент: startGame -> /api/run/start, endGame -> /api/run/finish.
# Сервер сам проверяет длительность, счёт и максимально допустимую награду.
@app.post("/api/run/start")
def start_run(
    payload: RunStartPayload,
    request: Request,
    player_name: str = Depends(get_current_player),
):
    _require_same_name(payload.name, player_name)
    _enforce_rate_limit(request, "run_start", player_name)

    name = player_name
    ip = _client_ip(request)
    now = time.time()
    run_id = secrets.token_urlsafe(24)

    with db.transaction() as conn:
        _ensure_player(conn, name)
        # Если игрок обновил страницу посреди забега, старый забег закрываем.
        conn.execute(
            "UPDATE runs SET status = 'abandoned', finished_at = ? WHERE player_name = ? AND status = 'active'",
            (now, name),
        )
        conn.execute(
            """INSERT INTO runs (run_id, player_name, started_at, status, client_ip)
               VALUES (?, ?, ?, 'active', ?)""",
            (run_id, name, now, ip),
        )

    return {"status": "ok", "run_id": run_id, "started_at": now, "max_duration": MAX_RUN_SECONDS}


@app.post("/api/run/finish")
def finish_run(
    payload: RunFinishPayload,
    request: Request,
    player_name: str = Depends(get_current_player),
):
    _require_same_name(payload.name, player_name)
    _enforce_rate_limit(request, "run_finish", player_name)

    name = player_name
    now = time.time()
    today = _today_str()
    expired = False
    too_short = False

    with db.transaction() as conn:
        player = _ensure_player(conn, name)
        run = conn.execute(
            "SELECT * FROM runs WHERE run_id = ? AND player_name = ?",
            (payload.run_id, name),
        ).fetchone()

        if not run:
            raise HTTPException(status_code=404, detail="Run not found")

        if run["status"] == "finished":
            return {
                "status": "ok",
                "already_finished": True,
                "coins_awarded": int(run["coins_awarded"] or 0),
                **_profile(player),
            }

        if run["status"] != "active":
            raise HTTPException(status_code=400, detail="Run is not active")

        elapsed = max(0.0, now - float(run["started_at"]))
        if elapsed > MAX_RUN_SECONDS:
            conn.execute(
                "UPDATE runs SET status = 'expired', finished_at = ? WHERE run_id = ?",
                (now, payload.run_id),
            )
            expired = True
        elif elapsed < MIN_RUN_SECONDS:
            conn.execute(
                "UPDATE runs SET status = 'abandoned', finished_at = ? WHERE run_id = ?",
                (now, payload.run_id),
            )
            too_short = True
        else:
            requested_score = max(0, int(payload.score))
            claimed = max(0, min(int(payload.coins_earned), MAX_COINS))
            quests = max(0, min(int(payload.quests_completed), 4))
            loops = max(1, min(int(payload.loops), 1000))
            bosses_killed = max(0, min(int(payload.bosses_killed), 10_000))

            # Счёт и награда ограничены только реальным временем забега.
            # Никаких клиентских бонусов «за квесты» или фиксированного
            # стартового запаса здесь нет: это были печатные станки.
            max_score = int(MAX_SCORE_PER_SECOND * elapsed)
            score = min(requested_score, MAX_SCORE, max_score)
            score_clamped = score < requested_score

            max_coins = min(
                MAX_COINS_PER_RUN,
                int(MAX_COINS_PER_SECOND * elapsed),
            )

            daily_earned = _daily_state(player, today)
            remaining_daily = max(0, MAX_DAILY_EARN - daily_earned)
            awarded = max(
                0,
                min(
                    claimed,
                    max_coins,
                    remaining_daily,
                    MAX_COINS - int(player["coins"] or 0),
                ),
            )
            new_balance = int(player["coins"] or 0) + awarded
            new_daily = daily_earned + awarded

            conn.execute(
                """UPDATE players
                   SET coins = ?, daily_earned = ?, daily_earned_date = ?, updated_at = ?
                   WHERE name = ?""",
                (new_balance, new_daily, today, now, name),
            )
            conn.execute(
                """UPDATE runs
                   SET finished_at = ?, score = ?, coins_claimed = ?, coins_awarded = ?,
                       quests_completed = ?, status = 'finished'
                   WHERE run_id = ?""",
                (now, score, claimed, awarded, quests, payload.run_id),
            )
            # Лидерборд обновляется только проверенным сервером счётом.
            conn.execute(
                """INSERT INTO scores (name, score) VALUES (?, ?)
                   ON CONFLICT(name) DO UPDATE SET score = MAX(scores.score, excluded.score)""",
                (name, score),
            )
            _log_tx(conn, name, awarded, new_balance, "run_reward", {
                "run_id": payload.run_id,
                "elapsed": round(elapsed, 3),
                "score": score,
                "claimed": claimed,
                "awarded": awarded,
                "max_coins": max_coins,
                "score_clamped": score_clamped,
                "bosses_killed": bosses_killed,
                "loops": loops,
            })
            player = _get_player(conn, name)

            return {
                "status": "ok",
                "coins_awarded": awarded,
                "claimed": claimed,
                "clamped": awarded < claimed,
                "score_clamped": score_clamped,
                **_profile(player),
            }

    if expired:
        raise HTTPException(status_code=400, detail="Run expired")
    if too_short:
        raise HTTPException(status_code=400, detail="Run too short")


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
        row = conn.execute("SELECT * FROM world_boss WHERE id = 1").fetchone()
    return row, week


def _exchange_rate() -> int:
    """Курс обмена ДНК фиксирован на сутки и считается только сервером."""
    today_str = date.today().isoformat()
    h = sum(ord(c) for c in today_str)
    return 4 + (h % 12)


@app.get("/api/exchange/rate")
def get_exchange_rate():
    rate = _exchange_rate()
    return {
        "rate": rate,
        "unit": EXCHANGE_DNA_UNIT,
        "cost": rate * EXCHANGE_DNA_UNIT,
    }


@app.post("/api/exchange/buy")
def buy_exchange_dna(
    payload: ExchangeBuyPayload,
    request: Request,
    player_name: str = Depends(get_current_player),
):
    """Покупает клиентскую ДНК за серверные монеты.

    ДНК остаётся клиентской валютой, поэтому начисляет её клиент, но
    стоимость всегда считает сервер — иначе обмен был бы бесплатным.
    """
    _require_same_name(payload.name, player_name)
    _enforce_rate_limit(request, "exchange", player_name)

    name = player_name
    rate = _exchange_rate()
    cost = rate * EXCHANGE_DNA_UNIT
    now = time.time()

    with db.transaction() as conn:
        row = _ensure_player(conn, name)
        coins = int(row["coins"] or 0)
        if coins < cost:
            raise HTTPException(status_code=400, detail="Not enough coins")

        new_balance = coins - cost
        conn.execute(
            "UPDATE players SET coins = ?, updated_at = ? WHERE name = ?",
            (new_balance, now, name),
        )
        _log_tx(conn, name, -cost, new_balance, "exchange_buy", {
            "rate": rate,
            "dna": EXCHANGE_DNA_UNIT,
        })
        row = _get_player(conn, name)

    return {
        "status": "ok",
        "rate": rate,
        "unit": EXCHANGE_DNA_UNIT,
        "cost": cost,
        "dna_gained": EXCHANGE_DNA_UNIT,
        **_profile(row),
    }


@app.get("/api/world-boss")
def get_world_boss(
    request: Request,
    player_name: str = Depends(get_current_player),
):
    _enforce_rate_limit(request, "world_boss", player_name)
    week = get_week_key()
    conn = db.get_db_connection()
    try:
        row = conn.execute("SELECT * FROM world_boss WHERE id = 1").fetchone()
    finally:
        conn.close()
    if not row or row["week_key"] != week:
        with db.transaction() as conn:
            row, week = _ensure_world_boss(conn)

    conn = db.get_db_connection()
    try:
        top = conn.execute("""
            SELECT player_name, damage FROM world_boss_damage
            WHERE week_key = ? AND damage > 0
            ORDER BY damage DESC LIMIT 5
        """, (week,)).fetchall()
        dmg_row = conn.execute("""
            SELECT damage, reward_claimed FROM world_boss_damage
            WHERE week_key = ? AND player_name = ?
        """, (week, player_name)).fetchone()
    finally:
        conn.close()

    return {
        "week_key": row["week_key"],
        "max_hp": row["max_hp"],
        "current_hp": row["current_hp"],
        "killed": row["current_hp"] <= 0,
        "killed_by": row["killed_by"],
        "top_damage": [{"name": r["player_name"], "damage": r["damage"]} for r in top],
        "player_damage": int(dmg_row["damage"] or 0) if dmg_row else 0,
        "reward_claimed": bool(dmg_row["reward_claimed"]) if dmg_row else False,
    }


@app.post("/api/world-boss/damage")
def add_world_boss_damage(
    payload: WorldBossDamagePayload,
    request: Request,
    player_name: str = Depends(get_current_player),
):
    _require_same_name(payload.name, player_name)
    _enforce_rate_limit(request, "world_boss_damage", player_name)
    if payload.damage < 0 or payload.damage > MAX_WORLD_BOSS_DAMAGE:
        raise HTTPException(status_code=400, detail="Invalid damage")

    clean_name = player_name
    now = time.time()

    with db.transaction() as conn:
        # Урон можно наносить только в рамках активного серверного забега.
        run = conn.execute(
            """SELECT started_at, status, boss_damage FROM runs
               WHERE run_id = ? AND player_name = ?""",
            (payload.run_id, clean_name),
        ).fetchone()
        if not run or run["status"] != "active":
            raise HTTPException(status_code=400, detail="Active run required")
        elapsed = max(0.0, now - float(run["started_at"]))
        if elapsed > MAX_RUN_SECONDS:
            raise HTTPException(status_code=400, detail="Run expired")

        # Урон тоже ограничен реальным временем забега: клиент не может
        # за один запрос снять боссу произвольное количество HP.
        max_damage_for_run = int(MAX_WORLD_BOSS_DPS * elapsed)
        damage_budget = max(0, max_damage_for_run - int(run["boss_damage"] or 0))
        allowed_damage = min(payload.damage, damage_budget)

        row, week = _ensure_world_boss(conn)

        if row["current_hp"] <= 0:
            return {"current_hp": 0, "damage_added": 0, "killed": True, "already_dead": True}
        if allowed_damage <= 0:
            return {
                "current_hp": int(row["current_hp"]),
                "damage_added": 0,
                "killed": False,
                "limit_reached": True,
            }

        current_hp = int(row["current_hp"])
        # В зачёт и в статистику идёт только реально снятое HP: «оверкилл»
        # не должен раздувать урон игрока в недельном рейтинге.
        applied_damage = min(allowed_damage, current_hp)
        new_hp = current_hp - applied_damage
        killed_now = new_hp == 0
        killed_at = ""
        killed_by = ""
        if killed_now:
            killed_at = datetime.now(timezone.utc).isoformat()
            killed_by = clean_name

        conn.execute("""
            UPDATE world_boss SET current_hp = ?, killed_at = ?, killed_by = ? WHERE id = 1
        """, (new_hp, killed_at, killed_by))
        conn.execute(
            "UPDATE runs SET boss_damage = boss_damage + ? WHERE run_id = ?",
            (applied_damage, payload.run_id),
        )

        conn.execute("""
            INSERT INTO world_boss_damage (week_key, player_name, damage, reward_claimed)
            VALUES (?, ?, ?, 0)
            ON CONFLICT(week_key, player_name)
            DO UPDATE SET damage = COALESCE(world_boss_damage.damage, 0) + excluded.damage
        """, (week, clean_name, applied_damage))

        return {
            "current_hp": new_hp,
            "damage_added": applied_damage,
            "clamped": applied_damage < payload.damage,
            "killed": killed_now,
            "killed_by": killed_by,
        }


@app.post("/api/world-boss/claim")
def claim_world_boss_reward(
    payload: WorldBossClaimPayload,
    request: Request,
    player_name: str = Depends(get_current_player),
):
    _require_same_name(payload.name, player_name)
    _enforce_rate_limit(request, "world_boss_claim", player_name)

    clean_name = player_name

    with db.transaction() as conn:
        row, week = _ensure_world_boss(conn)

        if row["current_hp"] > 0:
            return {"status": "boss_alive"}

        dmg_row = conn.execute("""
            SELECT damage, reward_claimed FROM world_boss_damage
            WHERE week_key = ? AND player_name = ?
        """, (week, clean_name)).fetchone()

        damage_dealt = int(dmg_row["damage"] or 0) if dmg_row else 0
        if damage_dealt < MIN_WORLD_BOSS_DAMAGE_FOR_REWARD:
            return {
                "status": "not_enough_damage",
                "required_damage": MIN_WORLD_BOSS_DAMAGE_FOR_REWARD,
                "damage_dealt": damage_dealt,
            }

        # Атомарно «забираем» награду. Два одновременных запроса
        # не смогут начислить её дважды.
        updated = conn.execute("""
            UPDATE world_boss_damage SET reward_claimed = 1
            WHERE week_key = ? AND player_name = ? AND reward_claimed = 0
        """, (week, clean_name))
        if updated.rowcount != 1:
            return {"status": "already_claimed"}

        player = _ensure_player(conn, clean_name)
        coins_now = int(player["coins"] or 0)
        awarded = max(0, min(WORLD_BOSS_REWARD_COINS, MAX_COINS - coins_now))
        new_coins = coins_now + awarded
        conn.execute(
            "UPDATE players SET coins = ?, updated_at = ? WHERE name = ?",
            (new_coins, time.time(), clean_name),
        )
        _log_tx(conn, clean_name, awarded, new_coins, "world_boss", {
            "week": week,
            "requested": WORLD_BOSS_REWARD_COINS,
        })

    return {
        "status": "success",
        "reward_coins": awarded,
        "reward_dna": WORLD_BOSS_REWARD_DNA,
        "damage_dealt": damage_dealt,
        "new_coins": new_coins,
    }
