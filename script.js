// --- DOM ---
const player = document.querySelector('.player');
const obstaclesContainer = document.getElementById('obstacles');
const coinsContainer = document.getElementById('coins-container');
const bossContainer = document.getElementById('boss-container');
const powerupsContainer = document.getElementById('powerups-container');
const cloudsContainer = document.getElementById('clouds');
const trailContainer = document.getElementById('trail-container');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const coinsDisplay = document.getElementById('coins-display');
const dnaDisplay = document.getElementById('dna-display');
const loopBadge = document.getElementById('loop-badge');
const godBadge = document.getElementById('god-badge');
const livesDisplay = document.getElementById('lives-display');
const eventBanner = document.getElementById('event-banner');
const gameContainer = document.querySelector('.game-container');
const petDrone = document.getElementById('pet-drone');
const petDog = document.getElementById('pet-dog');
const questListUI = document.getElementById('quest-list');
const bossHpContainer = document.getElementById('boss-hp-container');
const bossHpFill = document.getElementById('boss-hp-fill');
const bossName = document.getElementById('boss-name');
const comboDisplay = document.getElementById('combo-display');
const activeBuffsUI = document.getElementById('active-buffs');
const activeArtifactsUI = document.getElementById('active-artifacts');
const gameMenu = document.getElementById('game-menu');
const menuTitle = document.getElementById('menu-title');
const menuText = document.getElementById('menu-text');
const startBtn = document.getElementById('start-btn');
const startBiomeSelect = document.getElementById('start-biome-select');
const skillModal = document.getElementById('skill-modal');
const skinsModal = document.getElementById('skins-modal');
const dailyChallengeBtn = document.getElementById('daily-challenge-btn');
const dailyBadge = document.getElementById('daily-badge');
const godModeBtn = document.getElementById('god-mode-btn');
const skillBtn = document.getElementById('skill-btn');
const skinsBtn = document.getElementById('skins-btn');
const skinsGrid = document.getElementById('skins-grid');
const closeBtns = document.querySelectorAll('.close-modal-btn');
const leaderboardList = document.getElementById('leaderboard-list');
const buyGlassesBtn = document.getElementById('buy-glasses-btn');
const buyShoesBtn = document.getElementById('buy-shoes-btn');
const buyMagnetBtn = document.getElementById('buy-magnet-btn');
const buyPetBtn = document.getElementById('buy-pet-btn');
const buyDogBtn = document.getElementById('buy-dog-btn');
const mobileJumpBtn = document.getElementById('mobile-jump-btn');
const muteBtn = document.getElementById('mute-btn');
const playerNameInput = document.getElementById('player-name-input');
const saveRecordBtn = document.getElementById('save-record-btn');
const authModal = document.getElementById('auth-modal');
const authNameInput = document.getElementById('auth-name-input');
const authPasswordInput = document.getElementById('auth-password-input');
const authErrorEl = document.getElementById('auth-error');
const authLoginBtn = document.getElementById('auth-login-btn');
const authRegisterBtn = document.getElementById('auth-register-btn');
const playerBadge = document.getElementById('player-badge');
const playerBadgeName = document.getElementById('player-badge-name');
const logoutBtn = document.getElementById('logout-btn');

const rouletteBtn = document.getElementById('roulette-btn');
const rouletteModal = document.getElementById('roulette-modal');
const rouletteSpinBtn = document.getElementById('roulette-spin-btn');
const rouletteResult = document.getElementById('roulette-result');
const rouletteSlots = [document.getElementById('slot-1'), document.getElementById('slot-2'), document.getElementById('slot-3')];
const trailBtn = document.getElementById('trail-btn');
const trailModal = document.getElementById('trail-modal');
const trailGrid = document.getElementById('trail-grid');

const exchangeBtn = document.getElementById('exchange-btn');
const exchangeModal = document.getElementById('exchange-modal');
const exchangeRateDisplay = document.getElementById('exchange-rate-display');
const exchangeCoinsEl = document.getElementById('exchange-coins');
const exchangeDnaEl = document.getElementById('exchange-dna');
const exchangeBuyBtn = document.getElementById('exchange-buy-btn');
const exchangeSellBtn = document.getElementById('exchange-sell-btn');

const petsBtn = document.getElementById('pets-btn');
const petsModal = document.getElementById('pets-modal');
const dogCard = document.getElementById('dog-card');
const dogLevelDisplay = document.getElementById('dog-level-display');
const dogStatsDisplay = document.getElementById('dog-stats-display');
const dogUpgradeBtn = document.getElementById('dog-upgrade-btn');
const droneCard = document.getElementById('drone-card');
const droneLevelDisplay = document.getElementById('drone-level-display');
const droneStatsDisplay = document.getElementById('drone-stats-display');
const droneUpgradeBtn = document.getElementById('drone-upgrade-btn');

// Мировой босс
const worldBossBtn = document.getElementById('world-boss-btn');
const worldBossModal = document.getElementById('world-boss-modal');
const worldBossTitle = document.getElementById('world-boss-title');
const worldBossHpFill = document.getElementById('world-boss-hp-fill');
const worldBossHpText = document.getElementById('world-boss-hp-text');
const worldBossStatus = document.getElementById('world-boss-status');
const worldBossYourDamage = document.getElementById('world-boss-your-damage');
const worldBossTopList = document.getElementById('world-boss-top-list');
const worldBossClaimBtn = document.getElementById('world-boss-claim-btn');
const worldBossRefreshBtn = document.getElementById('world-boss-refresh-btn');
const inGameWorldBossBar = document.getElementById('world-boss-bar');
const inGameWorldBossFill = document.getElementById('world-boss-fill');

const storyModal = document.getElementById('story-modal');
const storyTitle = document.getElementById('story-title');
const storyText = document.getElementById('story-text');
const storyNextBtn = document.getElementById('story-next-btn');

const artifactModal = document.getElementById('artifact-modal');
const artifactGrid = document.getElementById('artifact-grid');
const altarModal = document.getElementById('altar-modal');
const altarAcceptBtn = document.getElementById('altar-accept-btn');
const altarDeclineBtn = document.getElementById('altar-decline-btn');

const API_BASE = (() => {
  const override = new URLSearchParams(location.search).get('api');
  if (override) return override.replace(/\/+$/, '');
  // При локальной разработке страницу обычно отдают с localhost —
  // тогда по умолчанию идём в локальный backend, а не в прод.
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    return 'http://127.0.0.1:8000';
  }
  return 'https://dino-game-backend-summer-tide-6155.fly.dev';
})();

// --- АККАУНТ И АВТОРИЗАЦИЯ ---
let authToken = localStorage.getItem('dino_auth_token') || '';
let authName = localStorage.getItem('dino_auth_name') || '';
let activeRunId = null;
let runCoinsStart = 0;
let runBossesKilled = 0;
let isRunFinalizing = false;

async function apiFetch(path, options = {}) {
  const opts = { ...options };
  const headers = new Headers(opts.headers || {});
  if (opts.body && typeof opts.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`);
  opts.headers = headers;

  const response = await fetch(`${API_BASE}${path}`, opts);
  if (
    response.status === 401 &&
    authToken &&
    !path.startsWith('/api/auth/login') &&
    !path.startsWith('/api/auth/register')
  ) {
    expireSession();
  }
  return response;
}

function expireSession() {
  authToken = '';
  authName = '';
  playerName = '';
  localStorage.removeItem('dino_auth_token');
  localStorage.removeItem('dino_auth_name');
  activeRunId = null;
  updateAuthUI();
  showAuthModal('Сессия истекла. Войдите снова.');
}

function updateAuthUI() {
  if (playerName) {
    playerBadge.style.display = 'flex';
    playerBadgeName.textContent = playerName;
  } else {
    playerBadge.style.display = 'none';
    playerBadgeName.textContent = '';
  }
  playerNameInput.style.display = 'none';
  saveRecordBtn.style.display = 'none';
}

function showAuthModal(message) {
  authErrorEl.textContent = message || '';
  authModal.style.display = 'block';
  authNameInput.value = authName || authNameInput.value || '';
  setTimeout(() => {
    if (authModal.style.display === 'block') {
      (authNameInput.value ? authPasswordInput : authNameInput).focus();
    }
  }, 50);
}

function hideAuthModal() {
  authModal.style.display = 'none';
  authErrorEl.textContent = '';
}

function setAuthBusy(busy) {
  authLoginBtn.disabled = busy;
  authRegisterBtn.disabled = busy;
  authLoginBtn.textContent = busy ? '...' : 'ВОЙТИ';
  authRegisterBtn.textContent = busy ? '...' : 'РЕГИСТРАЦИЯ';
}

function authErrorMessage(status, data) {
  const detail = data && data.detail;
  const text = Array.isArray(detail)
    ? detail.map(item => item.msg || '').join('; ')
    : (typeof detail === 'string' ? detail : '');
  if (status === 409 || text.includes('already taken')) {
    return 'Это имя уже занято. Войдите или выберите другое.';
  }
  if (status === 401 || text.includes('Invalid name or password')) {
    return 'Неверное имя или пароль.';
  }
  if (status === 429) return 'Слишком много попыток. Подождите минуту.';
  if (text.includes('Password must be')) return 'Пароль должен быть от 8 до 128 символов.';
  if (text.includes('Invalid player name')) return 'Недопустимое имя. Можно буквы, цифры, пробел, _ и -.';
  return text || `Ошибка ${status}`;
}

const CLIENT_PROGRESS_KEYS = [
  'dino_coins', 'dino_dna', 'dino_unlocked_skins', 'dino_selected_skin',
  'dino_trails_unlocked', 'dino_active_trail',
  'dino_glasses', 'dino_glasses_active', 'dino_shoes', 'dino_shoes_active',
  'dino_magnet', 'dino_magnet_active', 'dino_pet', 'dino_pet_active',
  'dino_dog', 'dino_dog_active', 'dino_dog_level', 'dino_drone_level',
  'dino_unlocked_biome', 'dino_highscore', 'dino_daily_hs', 'dino_god_mode',
  'dino_casino_stats', 'dino_seen_intro',
  'skill_f_dmg', 'skill_f_hp', 'skill_a_jump', 'skill_a_magnet',
  'skill_l_coin', 'skill_l_event'
];

function resetClientProgress() {
  CLIENT_PROGRESS_KEYS.forEach(key => localStorage.removeItem(key));
}

// Привязывает локальный прогресс (ДНК, шлейфы, навыки) к аккаунту.
// При смене имени прогресс сбрасывается, при первом входе — сохраняется.
function adoptAccount(profile, fallbackName) {
  const name = String((profile && profile.name) || fallbackName || authName || '').trim();
  if (!name) return false;

  const owner = localStorage.getItem('dino_local_owner') || '';
  const switched = Boolean(owner && owner !== name);
  if (switched) resetClientProgress();

  localStorage.setItem('dino_local_owner', name);
  localStorage.setItem('dino_auth_name', name);
  localStorage.setItem('dino_player_name', name);
  authName = name;
  playerName = name;

  if (profile) applyServerProfile(profile);
  updateAuthUI();
  updateNameUI();
  return switched;
}

async function handleAuthSuccess(data, fallbackName) {
  if (!data || !data.token || !data.profile) {
    throw new Error('INVALID_AUTH_RESPONSE');
  }
  authToken = data.token;
  localStorage.setItem('dino_auth_token', authToken);
  const switched = adoptAccount(data.profile, fallbackName);
  hideAuthModal();
  if (switched) {
    // Локальные переменные (ДНК, питомцы, навыки) уже описывают старый
    // аккаунт — перезагружаем страницу, чтобы прочитать новые значения.
    location.reload();
    return;
  }
  playSFX('buy');
  showToast(`✅ Аккаунт: ${escapeHTML(playerName)}`);
  loadWorldBoss();
  loadExchangeRate();
  loadLeaderboard();
}

async function submitAuth(mode) {
  const name = authNameInput.value.trim();
  const password = authPasswordInput.value;
  authErrorEl.textContent = '';

  if (!name) { authErrorEl.textContent = 'Введите имя игрока.'; return; }
  if (mode === 'register' && !/^[\p{L}\p{N}_ \-]{1,20}$/u.test(name)) {
    authErrorEl.textContent = 'Недопустимое имя. Можно буквы, цифры, пробел, _ и -.';
    return;
  }
  if (!password) { authErrorEl.textContent = 'Введите пароль.'; return; }
  if (mode === 'register' && (password.length < 8 || password.length > 128)) {
    authErrorEl.textContent = 'Пароль должен быть от 8 до 128 символов.';
    return;
  }

  setAuthBusy(true);
  try {
    const r = await apiFetch(`/api/auth/${mode}`, {
      method: 'POST',
      body: JSON.stringify({ name, password })
    });
    const data = await r.json().catch(() => null);
    if (!r.ok) {
      authErrorEl.textContent = authErrorMessage(r.status, data);
      return;
    }
    authPasswordInput.value = '';
    await handleAuthSuccess(data, name);
  } catch (e) {
    console.error('Auth failed', e);
    authErrorEl.textContent = 'Сервер недоступен. Попробуйте ещё раз.';
  } finally {
    setAuthBusy(false);
  }
}

async function initAuth() {
  updateAuthUI();
  if (!authToken) {
    showAuthModal();
    return;
  }
  try {
    const r = await apiFetch('/api/auth/me');
    if (!r.ok) {
      if (r.status !== 401) showAuthModal('Не удалось загрузить аккаунт.');
      return;
    }
    const profile = await r.json().catch(() => null);
    if (!profile || typeof profile !== 'object') {
      showAuthModal('Сервер вернул некорректный профиль.');
      return;
    }
    const switched = adoptAccount(profile, authName);
    hideAuthModal();
    if (switched) {
      location.reload();
      return;
    }
    loadWorldBoss();
    loadExchangeRate();
    loadLeaderboard();
  } catch (e) {
    console.error('Session restore failed', e);
    showAuthModal('Сервер недоступен. Проверьте подключение.');
  }
}

async function logout() {
  try {
    if (authToken) await apiFetch('/api/auth/logout', { method: 'POST' });
  } catch (e) {
    console.error('Logout failed', e);
  }
  authToken = '';
  authName = '';
  playerName = '';
  activeRunId = null;
  localStorage.removeItem('dino_auth_token');
  localStorage.removeItem('dino_auth_name');
  localStorage.removeItem('dino_player_name');
  updateAuthUI();
  updateNameUI();
  showAuthModal();
  showToast('🚪 Вы вышли из аккаунта');
}

authLoginBtn.onclick = () => submitAuth('login');
authRegisterBtn.onclick = () => submitAuth('register');
authPasswordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitAuth('login');
});
authNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') authPasswordInput.focus();
});
logoutBtn.onclick = () => logout();

// --- МИРОВОЙ БОСС ---
let currentWorldBossState = null;
let pendingWorldBossDamage = 0;
let lastWorldBossFlush = Date.now();

async function loadWorldBoss() {
  if (!authToken) return;
  try {
    const r = await apiFetch('/api/world-boss');
    if (!r.ok) throw new Error("Server error");
    const d = await r.json();
    currentWorldBossState = d;
    updateWorldBossUI();
  } catch(e) {
    console.error('World boss load failed', e);
    if (worldBossStatus) worldBossStatus.innerHTML = '<span style="color:#ff2a2a">Сервер недоступен ❌</span>';
  }
}

function updateWorldBossUI() {
  if (!currentWorldBossState) return;
  if (isGameRunning && !currentWorldBossState.killed && inGameWorldBossBar) {
    inGameWorldBossBar.style.display = 'block';
    const pct = currentWorldBossState.max_hp > 0
      ? (currentWorldBossState.current_hp / currentWorldBossState.max_hp * 100)
      : 0;
    inGameWorldBossFill.style.width = pct + '%';
  } else if (inGameWorldBossBar) {
    inGameWorldBossBar.style.display = 'none';
  }
  if (worldBossModal.style.display === 'block') {
    renderWorldBossModal();
  }
}

function renderWorldBossModal() {
  const s = currentWorldBossState;
  if (!s) return;
  worldBossTitle.textContent = `🌍 МИРОВОЙ БОСС (${s.week_key})`;
  const pct = s.max_hp > 0 ? (s.current_hp / s.max_hp * 100) : 0;
  worldBossHpFill.style.width = pct + '%';
  worldBossHpText.textContent = `${s.current_hp.toLocaleString()} / ${s.max_hp.toLocaleString()} HP`;
  
  let statusHtml = '';
  if (s.killed) {
    statusHtml = `🎉 <span style="color:#00ff88">БОСС ПОБЕЖДЁН!</span><br><span style="color:#aaa; font-size:11px;">Убил: ${escapeHTML(s.killed_by || '—')}</span>`;
    if (s.reward_claimed) {
      statusHtml += `<br><span style="color:#ffd700; font-size:11px;">✅ Награда уже получена</span>`;
    }
  } else {
    statusHtml = `<span style="color:#ff00ff">⚔️ Играйте и наносите урон!</span><br><span style="color:#aaa; font-size:11px;">1 очко в игре = 1 урон</span>`;
  }
  worldBossStatus.innerHTML = statusHtml;
  
  worldBossYourDamage.textContent = (s.player_damage || 0).toLocaleString();
  
  if (s.top_damage && s.top_damage.length > 0) {
    let html = '';
    s.top_damage.forEach((e, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
      html += `<div class="wb-top-row"><span class="wb-top-rank">${medal}</span><span class="wb-top-name">${escapeHTML(e.name)}</span><span class="wb-top-damage">${e.damage.toLocaleString()}</span></div>`;
    });
    worldBossTopList.innerHTML = html;
  } else {
    worldBossTopList.innerHTML = '<div style="color:#888; text-align:center;">Пока никто не атаковал</div>';
  }
  
  if (s.killed && s.player_damage > 0 && !s.reward_claimed && playerName) {
    worldBossClaimBtn.style.display = 'inline-block';
  } else {
    worldBossClaimBtn.style.display = 'none';
  }
}

let worldBossFlushChain = Promise.resolve();

// Все отправки урона выполняются по очереди: иначе финальная отправка
// могла бы обогнать предыдущую и попасть уже после закрытия забега.
function flushWorldBossDamage() {
  worldBossFlushChain = worldBossFlushChain.then(
    () => doFlushWorldBossDamage(),
    () => doFlushWorldBossDamage()
  );
  return worldBossFlushChain;
}

async function doFlushWorldBossDamage() {
  if (pendingWorldBossDamage <= 0 || !authToken || !activeRunId || !playerName || !currentWorldBossState || currentWorldBossState.killed) {
    if (pendingWorldBossDamage > 0 && (!currentWorldBossState || currentWorldBossState.killed)) {
      pendingWorldBossDamage = 0;
    }
    return;
  }
  const dmg = Math.floor(pendingWorldBossDamage);
  if (dmg <= 0) return;
  pendingWorldBossDamage = 0;
  lastWorldBossFlush = Date.now();
  try {
    const r = await apiFetch('/api/world-boss/damage', {
      method: 'POST',
      body: JSON.stringify({ name: playerName, damage: dmg, run_id: activeRunId })
    });
    if (!r.ok) {
      // Забег уже завершён/просрочен — оставшийся урон начислить нельзя.
      if (r.status === 400) return;
      pendingWorldBossDamage += dmg;
      return;
    }
    const d = await r.json();
    if (d.current_hp !== undefined && currentWorldBossState) {
      const wasKilled = currentWorldBossState.killed;
      currentWorldBossState.current_hp = d.current_hp;
      currentWorldBossState.killed = d.killed;
      if (d.killed && !wasKilled) {
        currentWorldBossState.killed_by = d.killed_by || playerName;
        showToast(`🎉 ВЫ НАНЕСЛИ ПОСЛЕДНИЙ УДАР!\nБосс убит. Награда в меню!`, true);
      }
      updateWorldBossUI();
    }
  } catch(e) {
    pendingWorldBossDamage += dmg;
  }
}

async function claimWorldBossReward() {
  if (!playerName) { showAuthModal(); return; }
  try {
    const d = await enqueueProfileSync(async () => {
      const r = await apiFetch('/api/world-boss/claim', {
        method: 'POST',
        body: JSON.stringify({ name: playerName })
      });
      const data = await r.json();
      if (data.status === 'success' && typeof data.new_coins === 'number') {
        // Сервер уже начислил монеты — берём его баланс.
        applyServerProfile({ coins: data.new_coins });
      }
      return data;
    });

    if (d.status === 'success') {
      dna += d.reward_dna || 0;
      localStorage.setItem('dino_dna', dna);
      dnaDisplay.textContent = `🧬 ${dna}`;
      playSFX('buy');
      showToast(`🎁 НАГРАДА ПОЛУЧЕНА!\n+${d.reward_coins} 🪙 · +${d.reward_dna} 🧬`, true);
      loadWorldBoss();
      updateCasinoCoinsDisplay();
    } else if (d.status === 'already_claimed') {
      showToast('✅ Вы уже получили награду');
    } else if (d.status === 'no_participation') {
      showToast('⚠️ Вы не участвовали в этой неделе');
    } else if (d.status === 'boss_alive') {
      showToast('⚔️ Босс ещё жив!');
    }
  } catch(e) {
    showToast('❌ Ошибка сети');
  }
}

worldBossBtn.onclick = () => {
  playSFX('click');
  worldBossModal.style.display = 'block';
  worldBossStatus.innerHTML = 'Загрузка...';
  loadWorldBoss().then(() => {
    renderWorldBossModal();
  });
};

worldBossRefreshBtn.onclick = () => {
  playSFX('click');
  worldBossStatus.innerHTML = 'Загрузка...';
  loadWorldBoss();
};

worldBossClaimBtn.onclick = () => claimWorldBossReward();

// --- ПИТОМЦЫ ---
let dogLevel = parseInt(localStorage.getItem('dino_dog_level')) || 1;
let droneLevel = parseInt(localStorage.getItem('dino_drone_level')) || 1;

const PET_UPGRADE_COSTS = { 2: 20, 3: 40, 4: 60, 5: 100 };
const DOG_STATS = ['', 'Собирает монеты', 'Радиус сбора +66%', 'Лай: отпугивает птиц', 'Радиус сбора +133%', '🔥 Цербер: сжигает врагов'];
const DRONE_STATS = ['', 'Стреляет по боссам', '+30% скорость стрельбы', 'Веер из 3 пуль', 'Урон по боссам x1.5', '⚡ Лазер (0.45 урона)'];

let dogBarkTimer = 0;
let dogFireTimer = 0;
let droneLaserTimer = 0;

function updatePetsUI() {
  dogLevelDisplay.textContent = `Ур. ${dogLevel}`;
  if (!hasDog) {
    dogCard.classList.add('pet-locked');
    dogStatsDisplay.innerHTML = '<div style="color:#888;">Сначала купите<br>в магазине<br>(300 🪙)</div>';
    dogUpgradeBtn.disabled = true;
    dogUpgradeBtn.textContent = 'НЕ КУПЛЕН';
  } else if (dogLevel >= 5) {
    dogCard.classList.remove('pet-locked');
    let html = '';
    for (let i = 1; i <= 5; i++) html += `<div style="color:#00ff88">✓ Lv.${i}: ${DOG_STATS[i]}</div>`;
    dogStatsDisplay.innerHTML = html;
    dogUpgradeBtn.disabled = true;
    dogUpgradeBtn.textContent = 'МАКС. УРОВЕНЬ';
  } else {
    dogCard.classList.remove('pet-locked');
    let html = '';
    for (let i = 1; i <= dogLevel; i++) html += `<div style="color:#00ff88">✓ Lv.${i}: ${DOG_STATS[i]}</div>`;
    html += `<div style="color:#ffd700; margin-top:5px;">▶ Lv.${dogLevel+1}: ${DOG_STATS[dogLevel+1]}</div>`;
    dogStatsDisplay.innerHTML = html;
    const cost = PET_UPGRADE_COSTS[dogLevel + 1];
    dogUpgradeBtn.disabled = dna < cost;
    dogUpgradeBtn.textContent = `УЛУЧШИТЬ (${cost} 🧬)`;
  }
  
  droneLevelDisplay.textContent = `Ур. ${droneLevel}`;
  if (!hasPet) {
    droneCard.classList.add('pet-locked');
    droneStatsDisplay.innerHTML = '<div style="color:#888;">Сначала купите<br>в магазине<br>(200 🪙)</div>';
    droneUpgradeBtn.disabled = true;
    droneUpgradeBtn.textContent = 'НЕ КУПЛЕН';
  } else if (droneLevel >= 5) {
    droneCard.classList.remove('pet-locked');
    let html = '';
    for (let i = 1; i <= 5; i++) html += `<div style="color:#00ff88">✓ Lv.${i}: ${DRONE_STATS[i]}</div>`;
    droneStatsDisplay.innerHTML = html;
    droneUpgradeBtn.disabled = true;
    droneUpgradeBtn.textContent = 'МАКС. УРОВЕНЬ';
  } else {
    droneCard.classList.remove('pet-locked');
    let html = '';
    for (let i = 1; i <= droneLevel; i++) html += `<div style="color:#00ff88">✓ Lv.${i}: ${DRONE_STATS[i]}</div>`;
    html += `<div style="color:#ffd700; margin-top:5px;">▶ Lv.${droneLevel+1}: ${DRONE_STATS[droneLevel+1]}</div>`;
    droneStatsDisplay.innerHTML = html;
    const cost = PET_UPGRADE_COSTS[droneLevel + 1];
    droneUpgradeBtn.disabled = dna < cost;
    droneUpgradeBtn.textContent = `УЛУЧШИТЬ (${cost} 🧬)`;
  }
}

function upgradePet(type) {
  let currentLevel = type === 'dog' ? dogLevel : droneLevel;
  if (currentLevel >= 5) return;
  const cost = PET_UPGRADE_COSTS[currentLevel + 1];
  if (dna < cost) { showToast('⚠️ Не хватает ДНК'); return; }
  dna -= cost;
  localStorage.setItem('dino_dna', dna);
  dnaDisplay.textContent = `🧬 ${dna}`;
  if (type === 'dog') {
    dogLevel++;
    localStorage.setItem('dino_dog_level', dogLevel);
    showToast(`🐕 Собачка прокачана до Lv.${dogLevel}!`);
  } else {
    droneLevel++;
    localStorage.setItem('dino_drone_level', droneLevel);
    showToast(`🛸 Дрон прокачан до Lv.${droneLevel}!`);
  }
  playSFX('buy');
  updatePetsUI();
  saveProfileToServer();
}

dogUpgradeBtn.onclick = () => upgradePet('dog');
droneUpgradeBtn.onclick = () => upgradePet('drone');

petsBtn.onclick = () => {
  playSFX('click');
  updatePetsUI();
  petsModal.style.display = 'block';
};

// --- БЕССМЕРТИЕ ---
let isGodMode = localStorage.getItem('dino_god_mode') === 'true';

function updateGodModeUI() {
  if (isGodMode) {
    godModeBtn.textContent = '👻 БЕССМЕРТИЕ: ВКЛ';
    godModeBtn.classList.add('on');
    godBadge.style.display = 'inline-block';
    godBadge.textContent = '👻';
    player.classList.add('god-mode-active');
  } else {
    godModeBtn.textContent = '💀 БЕССМЕРТИЕ: ВЫКЛ';
    godModeBtn.classList.remove('on');
    godBadge.style.display = 'none';
    player.classList.remove('god-mode-active');
  }
}

godModeBtn.onclick = () => {
  isGodMode = !isGodMode;
  localStorage.setItem('dino_god_mode', isGodMode);
  playSFX('click');
  updateGodModeUI();
  showToast(isGodMode ? '👻 БЕССМЕРТИЕ ВКЛЮЧЕНО' : '💀 БЕССМЕРТИЕ ВЫКЛЮЧЕНО');
};

// --- ШЛЕЙФЫ ---
const TRAILS = [
  { id: '', icon: '🚫', name: 'Без шлейфа' },
  { id: 'fire', icon: '🔥', name: 'Огонь' },
  { id: 'neon', icon: '💠', name: 'Неон' },
  { id: 'gold', icon: '⭐', name: 'Золото' },
  { id: 'rainbow', icon: '🌈', name: 'Радуга', legendary: true }
];

let unlockedTrails = JSON.parse(localStorage.getItem('dino_trails_unlocked') || '[]');
let activeTrail = localStorage.getItem('dino_active_trail') || '';

function setActiveTrail(id) {
  activeTrail = id;
  localStorage.setItem('dino_active_trail', id);
}

function renderTrailPicker() {
  trailGrid.innerHTML = '';
  TRAILS.forEach(t => {
    const isUnlocked = t.id === '' || unlockedTrails.includes(t.id);
    const isActive = activeTrail === t.id;
    const card = document.createElement('div');
    card.className = `trail-card ${isActive ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`;
    card.innerHTML = `<div class="trail-icon">${t.icon}</div><div class="trail-name">${t.name}</div>`;
    if (isUnlocked) {
      card.onclick = () => {
        playSFX('click');
        setActiveTrail(t.id);
        renderTrailPicker();
      };
    } else {
      card.innerHTML += `<div style="font-size:9px;color:#888;margin-top:4px;">🔒 Рулетка</div>`;
    }
    trailGrid.appendChild(card);
  });
}

trailBtn.onclick = () => {
  playSFX('click');
  renderTrailPicker();
  trailModal.style.display = 'block';
};

// --- РУЛЕТКА ---
// Таблица используется только для «мелькания» слотов.
// Реальный приз выбирает сервер в /api/casino/roulette.
const ROULETTE_PRIZES = [
  { id: 'coins_30', icon: '🪙', label: '+30 🪙', weight: 30, type: 'coins', value: 30 },
  { id: 'coins_75', icon: '💰', label: '+75 🪙', weight: 20, type: 'coins', value: 75 },
  { id: 'coins_150', icon: '💎', label: '+150 🪙', weight: 5, type: 'coins', value: 150 },
  { id: 'dna_10', icon: '🧬', label: '+10 🧬', weight: 20, type: 'dna', value: 10 },
  { id: 'dna_30', icon: '🧪', label: '+30 🧬', weight: 5, type: 'dna', value: 30 },
  { id: 'skin_raptor', icon: '🦅', label: 'Раптор', weight: 5, type: 'skin', value: 'raptor' },
  { id: 'skin_ptero', icon: '🦇', label: 'Птеродактиль', weight: 2, type: 'skin', value: 'ptero' },
  { id: 'trail_fire', icon: '🔥', label: 'Огонь', weight: 5, type: 'trail', value: 'fire' },
  { id: 'trail_neon', icon: '💠', label: 'Неон', weight: 5, type: 'trail', value: 'neon' },
  { id: 'trail_gold', icon: '⭐', label: 'Золото', weight: 3, type: 'trail', value: 'gold' }
];

const ROULETTE_COST = 50;
let isRouletteSpinning = false;

async function spinRoulette() {
  if (isRouletteSpinning) return;
  if (!playerName) { showAuthModal(); return; }
  if (coins < ROULETTE_COST) { showToast(`⚠️ Нужно ${ROULETTE_COST} 🪙`); return; }

  isRouletteSpinning = true;
  rouletteSpinBtn.disabled = true;
  rouletteSpinBtn.textContent = 'КРУТИМ...';
  rouletteResult.style.display = 'none';
  rouletteSlots.forEach(slot => { slot.classList.add('spinning'); slot.classList.remove('win'); });

  let data;
  try {
    data = await enqueueProfileSync(async () => {
      const d = await postCasino('/api/casino/roulette', {});
      // Сервер уже списал ставку и начислил приз. Показываем его баланс.
      applyServerProfile(d, { invalidateSaves: true });
      return d;
    });
  } catch (e) {
    rouletteSlots.forEach(slot => { slot.classList.remove('spinning'); slot.textContent = '🎁'; });
    rouletteSpinBtn.disabled = false;
    rouletteSpinBtn.textContent = `КРУТИТЬ (${ROULETTE_COST} 🪙)`;
    isRouletteSpinning = false;
    showToast(`❌ ${casinoErrorText(e)}`);
    if (e && e.status === 400) loadProfileFromServer();
    return;
  }

  const winner = data.prize;
  let tickCount = 0;
  const totalTicks = 40;
  const interval = setInterval(() => {
    tickCount++;
    rouletteSlots.forEach(slot => {
      const randomPrize = ROULETTE_PRIZES[Math.floor(Math.random() * ROULETTE_PRIZES.length)];
      slot.textContent = randomPrize.icon;
    });
    if (tickCount >= totalTicks) {
      clearInterval(interval);
      rouletteSlots.forEach(slot => {
        slot.classList.remove('spinning');
        slot.classList.add('win');
        slot.textContent = winner.icon;
      });
      playSFX('buy');
      setTimeout(() => {
        applyCasinoPrize(data, rouletteResult);
        setTimeout(() => {
          isRouletteSpinning = false;
          rouletteSpinBtn.disabled = false;
          rouletteSpinBtn.textContent = `КРУТИТЬ (${ROULETTE_COST} 🪙)`;
          rouletteSlots.forEach(slot => slot.classList.remove('win'));
        }, 1500);
      }, 500);
    }
  }, 60);
}
rouletteSpinBtn.onclick = () => spinRoulette();

// Общий обработчик приза, полученного с сервера.
// Монеты уже начислены сервером и пришли в data.coins.
// Здесь применяются только локальные ресурсы: ДНК, шлейфы, косметика.
function applyCasinoPrize(data, resultEl = rouletteResult) {
  const prize = data && data.prize;
  if (!prize) return;

  let resultText = '';
  let color = '#ffd700';
  let borderColor = '#ffd700';

  if (prize.type === 'coins') {
    casinoStats.won += data.coins_won || 0;
    resultText = `🎉 ВЫИГРЫШ: ${prize.label}`;
    if (prize.clamped) resultText += ` (начислено ${prize.credited} 🪙)`;
  } else if (prize.type === 'dna') {
    const value = parseInt(prize.value, 10) || 0;
    dna += value;
    localStorage.setItem('dino_dna', dna);
    dnaDisplay.textContent = `🧬 ${dna}`;
    casinoStats.won += value * 5;
    resultText = `🎉 ВЫИГРЫШ: ${prize.label}`;
  } else if (prize.type === 'skin') {
    if (prize.already_owned) {
      const compensation = data.coins_won || prize.compensation || 0;
      casinoStats.won += compensation;
      resultText = `🎉 Скин "${prize.label}" уже был. Компенсация: +${compensation} 🪙`;
    } else {
      resultText = `🎉 ВЫИГРЫШ: Скин "${prize.label}" (активирован!)`;
    }
    updatePlayerSkin();
    renderSkins();
  } else if (prize.type === 'trail') {
    if (prize.value && !unlockedTrails.includes(prize.value)) {
      unlockedTrails.push(prize.value);
      localStorage.setItem('dino_trails_unlocked', JSON.stringify(unlockedTrails));
    }
    if (prize.value) setActiveTrail(prize.value);
    resultText = prize.value === 'rainbow'
      ? '🌈 ДЖЕКПОТ! Легендарный шлейф «Радуга» активирован!'
      : `🎉 ВЫИГРЫШ: Шлейф "${prize.label}" (активирован!)`;
    if (prize.value === 'rainbow') { color = '#ff00ff'; borderColor = '#ff00ff'; }
  } else {
    resultText = prize.label || 'Без выигрыша';
    color = '#ff2a2a';
    borderColor = '#ff2a2a';
  }

  saveCasinoStats();
  if (resultEl) {
    resultEl.textContent = resultText;
    resultEl.style.display = 'block';
    resultEl.style.color = color;
    resultEl.style.borderColor = borderColor;
  }

  playSFX(prize.type === 'none' ? 'death' : 'buy');
  updateShopUI();
  updateCasinoStatsDisplay();
}

// ==========================================
// КАЗИНО «DINO LUCK» — 4 ИГРЫ
// ==========================================

const casinoTabs = document.querySelectorAll('.casino-tab-btn');
const casinoPanels = document.querySelectorAll('.casino-panel');
const casinoCoinsDisplay = document.getElementById('casino-coins-display');
const casinoWageredEl = document.getElementById('casino-wagered');
const casinoWonEl = document.getElementById('casino-won');

// Монетка
const coinFlipDisplay = document.getElementById('coin-flip-display');
const coinFlipHeadsBtn = document.getElementById('coinflip-heads-btn');
const coinFlipTailsBtn = document.getElementById('coinflip-tails-btn');
const coinFlipResult = document.getElementById('coinflip-result');
let isCoinflipSpinning = false;

// Кости
const diceDisplay = document.getElementById('dice-display');
const diceGrid = document.getElementById('dice-grid');
const diceRollBtn = document.getElementById('dice-roll-btn');
const diceResult = document.getElementById('dice-result');
let selectedDiceValue = null;
let isDiceRolling = false;

// Джекпот
const jackpotSlot1 = document.getElementById('jackpot-slot-1');
const jackpotSlot2 = document.getElementById('jackpot-slot-2');
const jackpotSlot3 = document.getElementById('jackpot-slot-3');
const jackpotSpinBtn = document.getElementById('jackpot-spin-btn');
const jackpotResult = document.getElementById('jackpot-result');
let isJackpotSpinning = false;

// Статистика
let casinoStats = JSON.parse(localStorage.getItem('dino_casino_stats') || '{"wagered":0,"won":0,"biggest":0}');
function saveCasinoStats() { localStorage.setItem('dino_casino_stats', JSON.stringify(casinoStats)); }

function switchCasinoTab(tabId) {
    casinoTabs.forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
    casinoPanels.forEach(p => {
        const isActive = p.dataset.panel === tabId;
        p.style.display = isActive ? 'block' : 'none';
        p.classList.toggle('active', isActive);
    });
    updateCasinoCoinsDisplay();
}

function updateCasinoCoinsDisplay() {
    if (casinoCoinsDisplay) casinoCoinsDisplay.textContent = coins;
    if (coinFlipHeadsBtn) coinFlipHeadsBtn.disabled = coins < 25 || isCoinflipSpinning;
    if (coinFlipTailsBtn) coinFlipTailsBtn.disabled = coins < 25 || isCoinflipSpinning;
    if (diceRollBtn) diceRollBtn.disabled = coins < 10 || selectedDiceValue === null || isDiceRolling;
    if (jackpotSpinBtn) jackpotSpinBtn.disabled = coins < 150 || isJackpotSpinning;
}

function updateCasinoStatsDisplay() {
    if (casinoWageredEl) casinoWageredEl.textContent = `Поставлено: ${casinoStats.wagered} 🪙`;
    if (casinoWonEl) casinoWonEl.textContent = `Выиграно: ${casinoStats.won} 🪙`;
    updateCasinoCoinsDisplay();
}

casinoTabs.forEach(btn => {
    btn.onclick = () => { playSFX('click'); switchCasinoTab(btn.dataset.tab); };
});

// --- 🪙 МОНЕТКА ---
const COINFLIP_COST = 25;

async function playCoinFlip(choice) {
    if (isCoinflipSpinning) return;
    if (!playerName) { showAuthModal(); return; }
    if (coins < COINFLIP_COST) { showToast(`⚠️ Нужно ${COINFLIP_COST} 🪙`); return; }

    isCoinflipSpinning = true;
    coinFlipHeadsBtn.disabled = true;
    coinFlipTailsBtn.disabled = true;
    coinFlipResult.style.display = 'none';
    coinFlipDisplay.textContent = '⏳';
    coinFlipDisplay.style.animation = 'spinFlip 0.6s ease-out';

    let data;
    try {
        data = await enqueueProfileSync(async () => {
            const d = await postCasino('/api/casino/coinflip', { choice });
            applyServerProfile(d, { invalidateSaves: true });
            return d;
        });
    } catch (e) {
        coinFlipDisplay.style.animation = 'none';
        coinFlipDisplay.textContent = '🪙';
        isCoinflipSpinning = false;
        updateCasinoCoinsDisplay();
        showToast(`❌ ${casinoErrorText(e)}`);
        if (e && e.status === 400) loadProfileFromServer();
        return;
    }

    casinoStats.wagered += data.bet;

    const side = data.result && data.result.side;
    const won = side === choice;

    setTimeout(() => {
        coinFlipDisplay.style.animation = 'none';
        coinFlipDisplay.textContent = side === 'heads' ? '👑' : '🪙';

        if (won) {
            casinoStats.won += data.coins_won;
            coinFlipResult.textContent = `🎉 УГАДАЛ! +${data.coins_won} 🪙`;
            coinFlipResult.style.color = '#00ff88';
            coinFlipResult.style.borderColor = '#00ff88';
            playSFX('buy');
        } else {
            coinFlipResult.textContent = `😢 Не угадал. -${data.bet} 🪙`;
            coinFlipResult.style.color = '#ff2a2a';
            coinFlipResult.style.borderColor = '#ff2a2a';
            playSFX('death');
        }
        coinFlipResult.style.display = 'block';
        saveCasinoStats();
        isCoinflipSpinning = false;
        updateCasinoStatsDisplay();
    }, 600);
}

coinFlipHeadsBtn.onclick = () => playCoinFlip('heads');
coinFlipTailsBtn.onclick = () => playCoinFlip('tails');

// --- 🎲 КОСТИ ---
const DICE_COST = 10;

diceGrid.querySelectorAll('.dice-btn').forEach(btn => {
    btn.onclick = () => {
        if (isDiceRolling) return;
        selectedDiceValue = parseInt(btn.dataset.value);
        diceGrid.querySelectorAll('.dice-btn').forEach(b => b.classList.toggle('selected', b === btn));
        updateCasinoCoinsDisplay();
        playSFX('click');
    };
});

diceRollBtn.onclick = async () => {
    if (isDiceRolling || selectedDiceValue === null) return;
    if (!playerName) { showAuthModal(); return; }
    if (coins < DICE_COST) { showToast(`⚠️ Нужно ${DICE_COST} 🪙`); return; }

    const chosen = selectedDiceValue;
    isDiceRolling = true;
    updateCasinoCoinsDisplay();
    diceResult.style.display = 'none';
    diceDisplay.style.transform = 'none';

    let data;
    try {
        data = await enqueueProfileSync(async () => {
            const d = await postCasino('/api/casino/dice', { value: chosen });
            applyServerProfile(d, { invalidateSaves: true });
            return d;
        });
    } catch (e) {
        isDiceRolling = false;
        updateCasinoCoinsDisplay();
        showToast(`❌ ${casinoErrorText(e)}`);
        if (e && e.status === 400) loadProfileFromServer();
        return;
    }

    casinoStats.wagered += data.bet;

    const rolled = data.result && data.result.rolled;
    const won = rolled === chosen;

    let ticks = 0;
    const interval = setInterval(() => {
        diceDisplay.textContent = '🎲';
        diceDisplay.style.transform = `rotate(${Math.random() * 360}deg) scale(${0.9 + Math.random() * 0.3})`;
        ticks++;
        if (ticks > 15) {
            clearInterval(interval);
            diceDisplay.style.transform = 'none';
            diceDisplay.textContent = ['⚀','⚁','⚂','⚃','⚄','⚅'][rolled - 1];

            if (won) {
                casinoStats.won += data.coins_won;
                diceResult.textContent = `🎉 УГАДАЛ ${rolled}! +${data.coins_won} 🪙`;
                diceResult.style.color = '#00ff88';
                diceResult.style.borderColor = '#00ff88';
                playSFX('buy');
            } else {
                diceResult.textContent = `😢 Выпало ${rolled}. -${data.bet} 🪙`;
                diceResult.style.color = '#ff2a2a';
                diceResult.style.borderColor = '#ff2a2a';
                playSFX('death');
            }
            diceResult.style.display = 'block';
            saveCasinoStats();
            isDiceRolling = false;
            updateCasinoStatsDisplay();
        }
    }, 60);
};

// --- 💎 ДЖЕКПОТ ---
const JACKPOT_COST = 150;

// Таблица используется только для «мелькания» слотов.
// Реальный приз выбирает сервер в /api/casino/jackpot.
const JACKPOT_PRIZES = [
    { icon:'🪙', label:'+100 🪙',        weight:30, type:'coins', value:100 },
    { icon:'🪙', label:'+300 🪙',        weight:15, type:'coins', value:300 },
    { icon:'💰', label:'+750 🪙',        weight:6,  type:'coins', value:750 },
    { icon:'🧬', label:'+50 🧬',         weight:24, type:'dna',   value:50  },
    { icon:'🧪', label:'+150 🧬',        weight:10, type:'dna',   value:150 },
    { icon:'🔥', label:'Шлейф Огонь',     weight:5,  type:'trail', value:'fire' },
    { icon:'💠', label:'Шлейф Неон',      weight:5,  type:'trail', value:'neon' },
    { icon:'⭐', label:'Шлейф Золото',    weight:3,  type:'trail', value:'gold' },
    { icon:'🌈', label:'ЛЕГЕНДАРНЫЙ Шлейф', weight:1, type:'trail', value:'rainbow' },
    { icon:'💎', label:'ДЖЕКПОТ! +2000 🪙', weight:1, type:'coins', value:2000 }
];

jackpotSpinBtn.onclick = async () => {
    if (isJackpotSpinning) return;
    if (!playerName) { showAuthModal(); return; }
    if (coins < JACKPOT_COST) { showToast(`⚠️ Нужно ${JACKPOT_COST} 🪙`); return; }

    isJackpotSpinning = true;
    jackpotSpinBtn.disabled = true;
    jackpotSpinBtn.textContent = 'КРУТИМ...';
    jackpotResult.style.display = 'none';

    let data;
    try {
        data = await enqueueProfileSync(async () => {
            const d = await postCasino('/api/casino/jackpot', {});
            applyServerProfile(d, { invalidateSaves: true });
            return d;
        });
    } catch (e) {
        isJackpotSpinning = false;
        jackpotSpinBtn.disabled = false;
        jackpotSpinBtn.textContent = `КРУТИТЬ (${JACKPOT_COST} 🪙)`;
        showToast(`❌ ${casinoErrorText(e)}`);
        if (e && e.status === 400) loadProfileFromServer();
        return;
    }

    casinoStats.wagered += data.bet;

    const winner = data.prize;
    const slots = [jackpotSlot1, jackpotSlot2, jackpotSlot3];
    slots.forEach(s => { s.classList.add('spinning'); s.classList.remove('win'); });

    let ticks = 0;
    const interval = setInterval(() => {
        ticks++;
        slots.forEach(s => {
            const rnd = JACKPOT_PRIZES[Math.floor(Math.random() * JACKPOT_PRIZES.length)];
            s.textContent = rnd.icon;
        });
        if (ticks >= 50) {
            clearInterval(interval);
            slots.forEach(s => { s.classList.remove('spinning'); s.classList.add('win'); s.textContent = winner.icon; });
            playSFX('buy');
            applyCasinoPrize(data, jackpotResult);

            setTimeout(() => {
                isJackpotSpinning = false;
                jackpotSpinBtn.textContent = `КРУТИТЬ (${JACKPOT_COST} 🪙)`;
                updateCasinoStatsDisplay();
            }, 1500);
        }
    }, 50);
};

// --- ОТКРЫТИЕ КАЗИНО ---
rouletteBtn.onclick = () => {
    playSFX('click');
    // Перед игрой подтягиваем авторитетный баланс с сервера.
    loadProfileFromServer();
    rouletteResult.style.display = 'none';
    rouletteSlots.forEach(slot => { slot.textContent = '🎁'; slot.classList.remove('win', 'spinning'); });
    jackpotSlot1.textContent = '💎'; jackpotSlot2.textContent = '💎'; jackpotSlot3.textContent = '💎';
    jackpotResult.style.display = 'none';
    coinFlipResult.style.display = 'none';
    coinFlipDisplay.textContent = '🪙';
    diceResult.style.display = 'none';
    diceDisplay.textContent = '🎲';
    selectedDiceValue = null;
    diceGrid.querySelectorAll('.dice-btn').forEach(b => b.classList.remove('selected'));
    
    updateCasinoStatsDisplay();
    switchCasinoTab('roulette');
    rouletteModal.style.display = 'block';
};

// --- БИРЖА ДНК ---
let serverExchangeRate = null;
let exchangeBuyPending = false;

async function loadExchangeRate() {
  try {
    const r = await fetch(`${API_BASE}/api/exchange/rate`);
    const d = await r.json().catch(() => null);
    if (r.ok && d && typeof d.rate === 'number') {
      serverExchangeRate = d.rate;
      updateExchangeUI();
    }
  } catch (e) {
    console.error('Exchange rate load failed', e);
  }
}

function updateExchangeUI() {
  const rate = serverExchangeRate;
  const buyCost = rate ? rate * 10 : null;
  exchangeRateDisplay.innerHTML = rate
    ? `Курс: 1 🧬 = <strong style="color:#ffd700">${rate}</strong> 🪙`
    : 'Курс: загрузка...';
  exchangeBuyBtn.innerHTML = buyCost ? `КУПИТЬ 10 🧬 (${buyCost} 🪙)` : 'КУПИТЬ 10 🧬';
  exchangeSellBtn.innerHTML = 'ПРОДАЖА ОТКЛЮЧЕНА';
  exchangeCoinsEl.textContent = coins;
  exchangeDnaEl.textContent = dna;
  exchangeBuyBtn.disabled = !buyCost || exchangeBuyPending || coins < buyCost;
  exchangeBuyBtn.style.opacity = exchangeBuyBtn.disabled ? '0.4' : '1';
  exchangeSellBtn.disabled = true;
  exchangeSellBtn.style.opacity = '0.4';
}

exchangeBtn.onclick = () => {
  playSFX('click');
  updateExchangeUI();
  exchangeModal.style.display = 'block';
  loadExchangeRate();
};

exchangeBuyBtn.onclick = async () => {
  if (exchangeBuyPending) return;
  if (!playerName) { showAuthModal(); return; }
  if (!serverExchangeRate) { showToast('⚠️ Курс ещё не загружен'); return; }
  const cost = serverExchangeRate * 10;
  if (coins < cost) { showToast('⚠️ Не хватает монет'); return; }

  exchangeBuyPending = true;
  updateExchangeUI();
  try {
    const d = await enqueueProfileSync(async () => {
      const r = await apiFetch('/api/exchange/buy', {
        method: 'POST',
        body: JSON.stringify({ name: playerName })
      });
      const data = await r.json().catch(() => null);
      if (!r.ok) {
        const e = new Error(data && data.detail ? data.detail : `HTTP ${r.status}`);
        e.status = r.status;
        throw e;
      }
      return data;
    });

    dna += d.dna_gained || 10;
    localStorage.setItem('dino_dna', dna);
    applyServerProfile(d, { invalidateSaves: true });
    dnaDisplay.textContent = `🧬 ${dna}`;
    playSFX('buy');
    showToast(`💱 КУПЛЕНО 10 🧬 за ${d.cost} 🪙`);
  } catch (e) {
    showToast(`❌ ${casinoErrorText(e)}`);
    if (e && e.status === 400) loadProfileFromServer();
  } finally {
    exchangeBuyPending = false;
    updateExchangeUI();
    updateShopUI();
    updateCasinoCoinsDisplay();
  }
};

exchangeSellBtn.onclick = () => {
  showToast('⚠️ Продажа ДНК отключена: сервер не может проверить клиентскую ДНК');
};

// --- СПАВН ЧАСТИЦЫ ШЛЕЙФА ---
let trailSpawnTimer = 0;

function spawnTrailParticle() {
  if (!activeTrail) return;
  if (!isGameRunning) return;
  const p = document.createElement('div');
  p.className = `trail-particle ${activeTrail}`;
  const px = player.offsetLeft + player.offsetWidth * 0.3;
  const py = yPosition + 20;
  p.style.left = px + 'px';
  p.style.bottom = py + 'px';
  trailContainer.appendChild(p);
  setTimeout(() => p.remove(), 800);
}

function escapeHTML(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

const origRandom = Math.random;
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  return h;
}
function setDailySeed(seed) {
  if (seed === null) Math.random = origRandom;
  else Math.random = mulberry32(seed);
}

// --- АРТЕФАКТЫ ---
const ARTIFACTS = [
  { id: 'vampire', icon: '🩸', name: 'Вампиризм', desc: 'Каждые 1000 очков восстанавливают 1 жизнь (макс 3).' },
  { id: 'glass_cannon', icon: '💥', name: 'Стеклянная пушка', desc: 'Урон по боссам x3, но у вас остается только 1 сердце.' },
  { id: 'black_hole', icon: '🧲', name: 'Черная дыра', desc: 'Магнит тянет монеты со всего экрана, монеты дают x2.' },
  { id: 'chrono', icon: '⚡', name: 'Хроносдвиг', desc: 'При получении урона время замедляется на 2 секунды.' },
  { id: 'berserk', icon: '🔥', name: 'Берсерк', desc: 'Скорость игры +20%, но монеты падают в 2 раза чаще.' }
];
let playerArtifacts = [];
let hasGlassCannon = false;
let timeWarpTimer = 0;

// --- LOOP ---
let loopCount = 1;
let pendingLoopTransition = false;

function getLoopBaseScore() {
  return (loopCount - 1) * 1500;
}

function updateLoopBadge() {
  if (loopCount > 1) {
    loopBadge.textContent = `♾️ x${loopCount}`;
    loopBadge.style.display = 'inline-block';
  } else {
    loopBadge.style.display = 'none';
  }
}

// --- СЮЖЕТ ---
const storyData = [
  { title: "ГЛАВА 1: ПУСТЫНЯ (НАЧАЛО)", text: "Помнишь старые добрые времена? Тогда ты был просто пиксельным динозавриком, ждущим, когда же появится Wi-Fi. Ты прыгал через кактусы в бесконечной черно-белой пустыне... Но однажды сеть отключилась навсегда, и всё изменилось. Теперь это не просто игра — это реальность. Твой путь начинается там, где всё началось." },
  { title: "ГЛАВА 2: ДЖУНГЛИ (ЭВОЛЮЦИЯ)", text: "Победив первого босса, ты чувствуешь небывалую силу. Эволюция пошла вверх! Из простого 2D-спрайта ты превратился в полноценного RPG-героя. В джунглях ты находишь заброшенные сервера Google. Местные птицы летают так же низко, как в старой игре, но теперь у них есть HP." },
  { title: "ГЛАВА 3: ЛЕДНИКИ (ВРЕМЯ ЗАМЕРЛО)", text: "Ты попадаешь в Ледники Вечности. Здесь время застыло, как зависший браузер. Ты вспоминаешь, как бесконечно бежал по экрану, пока не наступал Game Over. Теперь у тебя есть сердца, монеты и возможность дать отпор. Ледяной ветер не остановит твою эволюцию." },
  { title: "ГЛАВА 4: ВУЛКАН (ERROR 404)", text: "Вулкан Огненных Ошибок. Именно здесь сгорают сервера, когда интернет падает. Ты встречаешь старых врагов — Птеродактилей из классической игры. Но теперь ты можешь не только уворачиваться от них, но и прыгать им на голову! Пора показать им, чему ты научился." },
  { title: "ГЛАВА 5: КИБЕРПАНК (ФИНАЛ)", text: "Киберпанк. Нейросети захватили мир. Злой ИИ, создавший лабиринты из кактусов и бесконечные пустыни, ждет тебя. Пора вернуть управление интернетом и переписать код игры!" },
  { title: "ПОБЕДА! (НОВЫЙ РЕКОРД)", text: "Ты победил ИИ! Интернет восстановлен, но ты больше не тот маленький пиксельный динозаврик. Ты — настоящая легенда RPG. Готов ли ты отправиться в новое путешествие, когда Wi-Fi снова упадет?" }
];

let pendingStoryTier = 0;
let hasSeenIntro = false;

function showStory(tier) {
  if (tier >= storyData.length) tier = storyData.length - 1;
  pendingStoryTier = tier;
  storyTitle.innerHTML = storyData[tier].title;
  storyText.innerHTML = storyData[tier].text;
  storyModal.style.display = 'block';
  isGameRunning = false;
  bgMusic.pause();
}

function showLoopStory() {
  pendingStoryTier = 0;
  storyTitle.innerHTML = `♾️ ПЕТЛЯ ${loopCount}`;
  storyText.innerHTML = `Все 5 биомов пройдены! Но <strong>Ядро ДНК</strong> снова нестабильно.<br><br>Мир перезапускается:<br>⚡ Скорость <strong>+${((loopCount-1)*15)}%</strong><br>💀 HP боссов <strong>+${((loopCount-1)*50)}%</strong><br>🪙 Монеты <strong>x${(1 + (loopCount-1) * 0.25).toFixed(2)}</strong><br><br><em>Твои артефакты остаются с тобой.<br>Готов к новой петле?</em>`;
  storyModal.style.display = 'block';
  isGameRunning = false;
  bgMusic.pause();
}

storyNextBtn.onclick = () => {
  playSFX('click');
  storyModal.style.display = 'none';
  if (pendingLoopTransition) {
    pendingLoopTransition = false;
    startNewLoop();
  } else if (pendingStoryTier >= storyData.length - 1) endGame();
  else startNextBiome(pendingStoryTier);
};

function startNextBiome(tier) {
  currentBiomeTier = tier;
  nextBossScore = getLoopBaseScore() + (currentBiomeTier + 1) * 300;
  gameContainer.className = `game-container biome-${['desert','jungle','ice','volcano','cyber'][currentBiomeTier] || 'cyber'}`;
  if (currentBiomeTier > unlockedBiome && currentBiomeTier <= 4) { 
    unlockedBiome = currentBiomeTier; 
    localStorage.setItem('dino_unlocked_biome', unlockedBiome); 
    updateShopUI(); 
  }
  clearEntities();
  yPosition = 0; yVelocity = 0; isGrounded = true;
  player.style.bottom = '0px';
  spawnObstacleTimer = 0; spawnCoinTimer = 0; spawnPowerupTimer = 0;
  spawnAltarTimer = 0;
  dogBarkTimer = 0; dogFireTimer = 0; droneLaserTimer = 0;
  invincibleUntil = Date.now() + 2000;
  nextEventTime = Date.now() + 60000; 
  playBiomeMusic(currentBiomeTier);
  isGameRunning = true;
  gameLoop();
}

function startNewLoop() {
  currentBiomeTier = 0;
  nextBossScore = getLoopBaseScore() + 300;
  gameContainer.className = 'game-container biome-desert';
  clearEntities();
  yPosition = 0; yVelocity = 0; isGrounded = true;
  player.style.bottom = '0px';
  spawnObstacleTimer = 0; spawnCoinTimer = 0; spawnPowerupTimer = 0;
  spawnAltarTimer = 0;
  dogBarkTimer = 0; dogFireTimer = 0; droneLaserTimer = 0;
  coinCap = 5;
  currentEvent = null;
  eventBanner.style.display = 'none';
  nextEventTime = Date.now() + 60000;
  lastEventType = null;
  invincibleUntil = Date.now() + 2000;
  hasShield = false; hasDoubleJump = false;
  shieldTimer = 0; megaJumpTimer = 0;
  activeBuffsUI.innerHTML = '';
  isOverdrive = false;
  gameContainer.classList.remove('overdrive');
  resetCombo();
  petDog.style.display = activeDog ? 'block' : 'none';
  dogX = 50; dogY = 0;
  playBiomeMusic(0);
  updateLoopBadge();
  isGameRunning = true;
  gameLoop();
}

function showArtifactSelection() {
  artifactGrid.innerHTML = '';
  let available = [...ARTIFACTS].filter(a => !playerArtifacts.includes(a.id));
  if (available.length === 0) available = ARTIFACTS;
  available.sort(() => 0.5 - Math.random());
  let choices = available.slice(0, 3);
  choices.forEach(art => {
    const card = document.createElement('div');
    card.className = 'artifact-card';
    card.innerHTML = `<div class="artifact-icon">${art.icon}</div><div class="artifact-name">${art.name}</div><div class="artifact-desc">${art.desc}</div>`;
    card.onclick = () => {
      playSFX('buy');
      applyArtifact(art);
      artifactModal.style.display = 'none';
      if (pendingLoopTransition) showLoopStory();
      else showStory(pendingStoryTier);
    };
    artifactGrid.appendChild(card);
  });
  artifactModal.style.display = 'block';
  isGameRunning = false;
}

function applyArtifact(art) {
  playerArtifacts.push(art.id);
  if (art.id === 'glass_cannon') {
    hasGlassCannon = true;
    if (!isGodMode) {
      currentHP = 1;
      maxHP = 1;
      if (livesDisplay) { livesDisplay.innerHTML = '❤️'; livesDisplay.style.display = 'none'; }
    }
  }
  activeArtifactsUI.innerHTML = '';
  playerArtifacts.forEach(id => {
    const a = ARTIFACTS.find(x => x.id === id);
    const icon = document.createElement('div');
    icon.textContent = a.icon;
    icon.title = a.name;
    activeArtifactsUI.appendChild(icon);
  });
}

let altarEntity = null;
let spawnAltarTimer = 0;

function spawnAltar() {
  if (altarEntity) return;
  const a = document.createElement('div');
  a.className = 'altar';
  let ax = gameContainer.offsetWidth;
  a.style.left = ax + 'px';
  powerupsContainer.appendChild(a);
  altarEntity = { el: a, x: ax, y: 0, w: 50, h: 50 };
}

altarAcceptBtn.onclick = () => {
  playSFX('buy');
  altarModal.style.display = 'none';
  if (isGodMode) {
    showToast('👻 Бессмертие защитило вас от смерти');
  } else if (!hasGlassCannon) {
    currentHP--;
    if (currentHP <= 0) { livesDisplay.innerHTML = ''; endGame(); return; }
    livesDisplay.innerHTML = '❤️'.repeat(currentHP);
  } else {
    currentHP = 1; maxHP = 1; livesDisplay.innerHTML = '❤️';
  }
  for(let i=0; i<3; i++) {
    let available = [...ARTIFACTS].filter(a => !playerArtifacts.includes(a.id));
    if (available.length === 0) available = ARTIFACTS;
    available.sort(() => 0.5 - Math.random());
    applyArtifact(available[0]);
  }
  showToast("☠️ СДЕЛКА ЗАКЛЮЧЕНА!\nПолучено 3 артефакта.");
  isGameRunning = true;
  gameLoop();
};

altarDeclineBtn.onclick = () => {
  playSFX('click');
  altarModal.style.display = 'none';
  isGameRunning = true;
  gameLoop();
};

// --- ЗВУК ---
let audioCtx, isMuted = false;
const bgMusic = new Audio(); bgMusic.loop = true; bgMusic.volume = 0.4;
const musicTracks = { 0:'music_desert.mp3',1:'music_jungle.mp3',2:'music_ice.mp3',3:'music_volcano.mp3',4:'music_cyber.mp3' };
function initAudio(){ if(!audioCtx) audioCtx=new(window.AudioContext||window.webkitAudioContext)(); if(audioCtx.state==='suspended') audioCtx.resume(); }
function playTone(f1,f2,d,t){ if(isMuted||!audioCtx) return; const o=audioCtx.createOscillator(),g=audioCtx.createGain(); o.type=t; o.frequency.setValueAtTime(f1,audioCtx.currentTime); if(f2)o.frequency.exponentialRampToValueAtTime(f2,audioCtx.currentTime+d); g.gain.setValueAtTime(0.15,audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+d); o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime+d); }
function playSFX(a){ initAudio(); if(isMuted)return;
  if(a==='jump') playTone(150,300,.15,'square');
  if(a==='coin'){ playTone(800,1000,.1,'sine'); setTimeout(()=>playTone(1200,1500,.1,'sine'),50); }
  if(a==='death') playTone(300,50,.5,'sawtooth');
  if(a==='click') playTone(600,600,.05,'square');
  if(a==='buy'){ playTone(400,600,.1,'square'); setTimeout(()=>playTone(600,800,.1,'square'),100); }
  if(a==='boss_hit') playTone(200,400,.1,'sawtooth');
}
function playBiomeMusic(tier){ if(isMuted)return; const t=musicTracks[tier]; if(bgMusic.src.indexOf(t)===-1&&t){bgMusic.src=t;bgMusic.play().catch(e=>console.log(e));} else if(bgMusic.paused&&t){bgMusic.play().catch(e=>console.log(e));} }

muteBtn.onclick = () => {
  isMuted = !isMuted;
  muteBtn.textContent = isMuted ? '🔇' : '🔊';
  if (isMuted) { bgMusic.pause(); }
  else if (isGameRunning) { bgMusic.play().catch(()=>{}); }
  playSFX('click');
};

// --- ГЛОБАЛЬНОЕ СОСТОЯНИЕ ---
let score=0, isGameRunning=false;
let animationFrameId, currentBiomeTier=0;
let coins=parseInt(localStorage.getItem('dino_coins'))||0;
let dna=parseInt(localStorage.getItem('dino_dna'))||0;
let unlockedBiome=parseInt(localStorage.getItem('dino_unlocked_biome'))||0;
let isDailyMode=false;
let hasShield=false;
let hasDoubleJump=false;
let shieldTimer=0;
let megaJumpTimer=0;
let playerName = '';
let comboCount = 0, comboTimer = 0, comboMultiplier = 1;
let isOverdrive = false;
let overdriveTimer = 0;
let overdriveCharged = true;
let weatherParticles = [], weatherSpawnTimer = 0;

let skill_f_dmg = localStorage.getItem('skill_f_dmg')==='true';
let skill_f_hp = localStorage.getItem('skill_f_hp')==='true';
let skill_a_jump = localStorage.getItem('skill_a_jump')==='true';
let skill_a_magnet = localStorage.getItem('skill_a_magnet')==='true';
let skill_l_coin = localStorage.getItem('skill_l_coin')==='true';
let skill_l_event = localStorage.getItem('skill_l_event')==='true';

let hasGlasses=localStorage.getItem('dino_glasses')==='true';
let hasShoes=localStorage.getItem('dino_shoes')==='true';
let hasMagnet=localStorage.getItem('dino_magnet')==='true';
let hasPet=localStorage.getItem('dino_pet')==='true';
let hasDog=localStorage.getItem('dino_dog')==='true';
let activeGlasses=hasGlasses && (localStorage.getItem('dino_glasses_active')!=='false');
let activeShoes=hasShoes && (localStorage.getItem('dino_shoes_active')!=='false');
let activeMagnet=hasMagnet && (localStorage.getItem('dino_magnet_active')!=='false');
let activePet=hasPet && (localStorage.getItem('dino_pet_active')!=='false');
let activeDog=hasDog && (localStorage.getItem('dino_dog_active')!=='false');

let selectedSkin=localStorage.getItem('dino_selected_skin')||'default';
if (selectedSkin === 'trike') { selectedSkin = 'default'; localStorage.setItem('dino_selected_skin', 'default'); }
let unlockedSkins=JSON.parse(localStorage.getItem('dino_unlocked_skins'))||['default'];
unlockedSkins = unlockedSkins.filter(s => s !== 'trike');

const skinList=[
  {id:'default', icon:'🦖', name:'Динозавр', price:0, hp:1, jumpMul:1, desc:'Базовый'},
  {id:'raptor', icon:'🦅', name:'Раптор', price:100, hp:1, jumpMul:1, desc:'Двойной прыжок'},
  {id:'ptero', icon:'🦇', name:'Птеродактиль', price:200, hp:1, jumpMul:1.35, desc:'Прыжок x1.35'}
];

let isBossActive=false;
let bossHP=0, maxBossHP=3;
let bossTime=0, bossShootTimer=0;
let bossElement=null;
let bX = 0, bY = 0;
let nextBossScore=300;

let petX=100, petY=100, dogX=50, dogY=0;
let droneShootTimer=0;

let currentHP=1, maxHP=1;
let invincibleUntil=0;
let yPosition=0, yVelocity=0, isGrounded=true;
let jumpCount=0;
let spawnObstacleTimer=0, spawnCoinTimer=0, spawnPowerupTimer=0;
let nextEventTime=0, currentEvent=null, lastEventType=null;

let obstacleEntities = [];
let coinEntities = [];
let powerupsOnScreen = [];
let bossProjectileEntities = [];
let droneProjectileEntities = [];

let coinCap = 5;

const HITBOX_X = 65; 
const HITBOX_W = 50;
const HITBOX_H = 50;

let quests=[
  {id:'jump', text:'Прыгни 10 раз', target:10, current:0, reward:5, done:false},
  {id:'coin', text:'Собери 15 монет', target:15, current:0, reward:10, done:false},
  {id:'score', text:'Набери 500 очков', target:500, current:0, reward:20, done:false},
  {id:'boss', text:'Убей 1 Босса', target:1, current:0, reward:50, done:false}
];

let highScore=parseInt(localStorage.getItem('dino_highscore'))||0;
highScoreDisplay.textContent=`HI ${String(highScore).padStart(5,'0')}`;
coinsDisplay.textContent=`🪙 ${coins}`;
dnaDisplay.textContent=`🧬 ${dna}`;

function checkAABB(x1, y1, w1, h1, x2, y2, w2, h2) {
  const pad = window.innerWidth < 900 ? 3 : 6; 
  return !(x1 + pad > x2 + w2 - pad || x1 + w1 - pad < x2 + pad || y1 + pad > y2 + h2 - pad || y1 + h1 - pad < y2 + pad);
}

function clearEntities() {
  obstacleEntities.forEach(e => e.el.remove()); obstacleEntities = [];
  coinEntities.forEach(e => e.el.remove()); coinEntities = [];
  powerupsOnScreen.forEach(e => e.el.remove()); powerupsOnScreen = [];
  bossProjectileEntities.forEach(e => e.el.remove()); bossProjectileEntities = [];
  droneProjectileEntities.forEach(e => e.el.remove()); droneProjectileEntities = [];
  if (altarEntity) { altarEntity.el.remove(); altarEntity = null; }
}

function showToast(msg, isBoss=false){
  const t=document.createElement('div');
  t.innerHTML=msg;
  t.style.cssText=`position:absolute;top:20%;left:50%;transform:translate(-50%,0);background:rgba(10,10,20,0.95);border:2px solid ${isBoss?'#00ffff':'#ffd700'};border-radius:10px;padding:15px 25px;color:${isBoss?'#00ffff':'#ffd700'};font-family:'Share Tech Mono';font-size:16px;font-weight:bold;text-align:center;z-index:1000;box-shadow:0 0 30px ${isBoss?'rgba(0,255,255,0.5)':'rgba(255,215,0,0.5)'};transition:opacity 0.5s,transform 0.5s;pointer-events:none;white-space:pre-wrap;`;
  gameContainer.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transform='translate(-50%,-20px)';}, 2000);
  setTimeout(()=>t.remove(), 2500);
}

async function loadLeaderboard(){
  try{
    const r=await fetch(`${API_BASE}/api/leaderboard`);
    const d=await r.json();
    leaderboardList.innerHTML='';
    if (!Array.isArray(d) || !d.length) {
      leaderboardList.textContent = 'Пока никто не играл';
      return;
    }
    d.slice(0,5).forEach((e,i)=>{
      const row = document.createElement('div');
      row.style.cssText='margin:3px 0;';
      const num = document.createTextNode(`${i+1}. `);
      const nameSpan = document.createElement('span');
      nameSpan.style.color = '#fff';
      nameSpan.textContent = e.name;
      const scoreSpan = document.createElement('span');
      scoreSpan.style.cssText='color:#00ff88;font-weight:bold';
      scoreSpan.textContent = e.score;
      row.append(num, nameSpan, document.createTextNode(' — '), scoreSpan);
      leaderboardList.appendChild(row);
    });
  } catch {
    leaderboardList.innerHTML='<span style="color:#ff2a2a">Сервер недоступен ❌</span>';
  }
}
// /api/score больше не обновляет рекорд: он приходит только из
// /api/run/finish после серверной проверки забега.
let profileSaveSeq = 0;
let profileSaveAppliedSeq = 0;

// Все операции, меняющие серверный баланс (save и казино), выполняются
// строго по очереди. Иначе старый /save мог бы прийти на сервер после
// выигрыша в казино и перезаписать баланс устаревшим значением.
let profileSyncQueue = Promise.resolve();
function enqueueProfileSync(task) {
  const run = profileSyncQueue.then(task, task);
  profileSyncQueue = run.catch(() => {});
  return run;
}

// Применяет профиль, полученный от сервера. Сервер — источник истины
// по монетам и скинам; локальные ДНК/шлейфы он не трогает.
function applyServerProfile(d, opts = {}) {
  if (!d || typeof d.coins !== 'number') return false;

  coins = d.coins;
  localStorage.setItem('dino_coins', coins);

  if (typeof d.name === 'string' && d.name) {
    playerName = d.name;
    authName = d.name;
    localStorage.setItem('dino_player_name', playerName);
    localStorage.setItem('dino_auth_name', authName);
    updateAuthUI();
  }

  // Скины — серверная валюта: локальный список заменяем серверным, а не
  // дополняем, чтобы старые локальные «подарки» не оставались навсегда.
  if (d.unlocked_skins) {
    try {
      const arr = JSON.parse(d.unlocked_skins);
      if (Array.isArray(arr)) {
        const valid = arr.filter(s => s === 'default' || s === 'raptor' || s === 'ptero');
        unlockedSkins = Array.from(new Set(['default', ...valid]));
        localStorage.setItem('dino_unlocked_skins', JSON.stringify(unlockedSkins));
      }
    } catch {}
  }
  if (!unlockedSkins.includes(selectedSkin)) selectedSkin = 'default';
  if (d.selected_skin && unlockedSkins.includes(d.selected_skin)) {
    selectedSkin = d.selected_skin;
  }
  localStorage.setItem('dino_selected_skin', selectedSkin);

  if (opts.invalidateSaves) {
    // Любые ответы /save, отправленные до действия казино, уже устарели.
    profileSaveAppliedSeq = Math.max(profileSaveAppliedSeq, profileSaveSeq);
  }

  coinsDisplay.textContent = `🪙 ${coins}`;
  updateShopUI();
  renderSkins();
  updatePlayerSkin();
  updateCasinoCoinsDisplay();
  return true;
}

async function loadProfileFromServer(){
  if (!playerName) return;
  return enqueueProfileSync(async () => {
    try {
      const r = await apiFetch('/api/player/load', {
        method: 'POST',
        body: JSON.stringify({ name: playerName })
      });
      const d = await r.json().catch(() => null);
      if (!r.ok) { console.error('Profile load failed', r.status, d); return; }
      if (!d || typeof d.coins !== 'number') { console.error('Profile load: invalid server response', d); return; }

      // Сервер — единственный источник истины по балансу.
      applyServerProfile(d);
    } catch(e) { console.error('Profile load failed', e); }
  });
}

async function saveProfileToServer(){
  if (!playerName) return;
  // Во время забега монеты ещё не подтверждены сервером: их начислит
  // /api/run/finish. Промежуточное сохранение только сбросило бы баланс.
  if (isGameRunning) return;
  return enqueueProfileSync(async () => {
    const seq = ++profileSaveSeq;
    try {
      const r = await apiFetch('/api/player/save', {
        method: 'POST',
        body: JSON.stringify({
          name: playerName,
          quests_done: quests.filter(q => q.done).length,
          selected_skin: selectedSkin
        })
      });
      const d = await r.json().catch(() => null);
      if (!r.ok) { console.error('Profile save failed', r.status, d); return; }
      if (!d || typeof d.coins !== 'number') { console.error('Profile save: invalid server response', d); return; }

      // Не даём более старому ответу перезаписать более новый баланс.
      if (seq < profileSaveAppliedSeq) return;
      profileSaveAppliedSeq = seq;

      // Сервер — источник истины по монетам и скинам.
      applyServerProfile(d);
    } catch(e) { console.error('Profile save failed', e); }
  });
}

// Запрос к серверному казино. Клиент не присылает ни ставку, ни приз.
async function postCasino(path, body) {
  if (!playerName) {
    const e = new Error('NO_NAME');
    e.code = 'NO_NAME';
    throw e;
  }
  const r = await apiFetch(path, {
    method: 'POST',
    body: JSON.stringify({ name: playerName, ...body })
  });
  const d = await r.json().catch(() => null);
  if (!r.ok) {
    const e = new Error(d && d.detail ? d.detail : `HTTP ${r.status}`);
    e.status = r.status;
    throw e;
  }
  if (!d || typeof d.coins !== 'number' || !d.prize) {
    const e = new Error('INVALID_RESPONSE');
    throw e;
  }
  return d;
}

function casinoErrorText(e) {
  if (e && e.code === 'NO_NAME') return 'Сначала войдите в аккаунт';
  const message = e && e.message ? e.message : '';
  if (message.includes('Not enough coins')) return 'Не хватает монет';
  if (message.includes('Too many requests')) return 'Слишком часто. Подождите пару секунд';
  if (message.includes('Invalid choice') || message.includes('Invalid dice value')) return 'Некорректный выбор';
  return 'Сервер недоступен. Попробуйте ещё раз';
}
async function claimDailyReward(){
  if (!playerName) { showAuthModal(); return; }
  try {
    const d = await enqueueProfileSync(async () => {
      const r = await apiFetch('/api/player/daily', {
        method: 'POST',
        body: JSON.stringify({ name: playerName })
      });
      const data = await r.json();
      if (data.status === 'success' && typeof data.coins === 'number') {
        applyServerProfile({ coins: data.coins });
      }
      return data;
    });
    if (d.status === 'already_claimed') { showToast(`🔥 Награда уже получена сегодня\nСерия: ${d.streak} 🔥`); }
    else if (d.status === 'success') { playSFX('buy'); showToast(`🔥 ЕЖЕДНЕВНАЯ НАГРАДА!\n+${d.reward} 🪙\nСерия: ${d.streak} 🔥`); }
  } catch(e) { showToast('❌ Сервер недоступен'); }
}

function updateNameUI(){
  // Имя и рекорд теперь принадлежат аккаунту. Старые поля скрыты,
  // чтобы не было второго, небезопасного способа «сохранить имя».
  playerNameInput.style.display = 'none';
  saveRecordBtn.style.display = 'none';
  updateAuthUI();
}

function getClassStats(){
  const c = skinList.find(s=>s.id===selectedSkin) || skinList[0];
  let hp = c.hp; if (skill_f_hp) hp += 1;
  let jumpMul = c.jumpMul; if (skill_a_jump) jumpMul *= 1.2;
  return { hp, jumpMul, classId: c.id };
}
function updatePlayerSkin(){
  player.classList.remove('skin-raptor','skin-ptero');
  player.style.backgroundImage = ""; 
  if (selectedSkin==='default') player.style.backgroundImage="url('player.png')";
  else if (selectedSkin==='raptor') player.classList.add('skin-raptor');
  else if (selectedSkin==='ptero') player.classList.add('skin-ptero');
}
let skinBuyPending = false;
function renderSkins(){
  skinsGrid.innerHTML='';
  skinList.forEach(skin=>{
    const isUnlocked = unlockedSkins.includes(skin.id);
    const card=document.createElement('div'); card.className=`skin-card ${selectedSkin===skin.id?'active':''}`;
    let priceHtml = isUnlocked ? '' : `<span style="font-size:11px;color:#ffd700;margin-top:5px;">🔒 ${skin.price}</span>`;
    card.innerHTML=`<span class="skin-icon">${skin.icon}</span><span class="skin-name">${skin.name}</span><small style="font-size:9px;color:#888;margin-top:3px">${skin.desc}</small>${priceHtml}`;
    card.onclick= async ()=>{
      playSFX('click');
      if (isUnlocked){
        selectedSkin=skin.id; updatePlayerSkin(); renderSkins();
        localStorage.setItem('dino_selected_skin', selectedSkin);
        saveProfileToServer();
        return;
      }
      if (!playerName) { showAuthModal(); return; }
      if (skinBuyPending) return;
      if (coins < skin.price) { showToast('⚠️ Не хватает монет'); return; }

      skinBuyPending = true;
      try {
        const d = await enqueueProfileSync(async () => {
          const r = await apiFetch('/api/shop/buy-skin', {
            method: 'POST',
            body: JSON.stringify({ name: playerName, skin: skin.id })
          });
          const data = await r.json().catch(() => null);
          if (!r.ok) {
            const e = new Error(data && data.detail ? data.detail : `HTTP ${r.status}`);
            e.status = r.status;
            throw e;
          }
          return data;
        });

        // Сервер сам списал монеты, открыл и выбрал скин.
        applyServerProfile(d, { invalidateSaves: true });
        if (d.status !== 'already_owned') {
          playSFX('buy');
          showToast(`✅ Скин открыт: ${skin.name}`);
        }
      } catch (e) {
        showToast(`❌ ${casinoErrorText(e)}`);
        if (e && e.status === 400) loadProfileFromServer();
      } finally {
        skinBuyPending = false;
        updateCasinoCoinsDisplay();
      }
    };
    skinsGrid.appendChild(card);
  });
}

const skillDefs = { f_dmg: { cost:30, name:'Урон x2' }, f_hp: { cost:50, name:'+1 жизнь' }, a_jump: { cost:30, name:'Прыжок+' }, a_magnet: { cost:50, name:'Магнит+' }, l_coin: { cost:30, name:'Монеты x2' }, l_event: { cost:50, name:'Удача' } };
function renderSkills(){
  document.querySelectorAll('.skill-btn').forEach(btn=>{
    const id=btn.dataset.id; const purchased = localStorage.getItem('skill_'+id)==='true'; const def = skillDefs[id];
    if (purchased){ btn.disabled=true; btn.classList.add('purchased'); btn.innerHTML=`✅ ${def.name}<br><small>КУПЛЕНО</small>`; }
    else { btn.disabled = dna < def.cost; btn.innerHTML=`${def.name}<br><small>${def.cost} 🧬</small>`; }
  });
}
document.querySelectorAll('.skill-btn').forEach(btn=>{
  btn.onclick = ()=>{
    const id=btn.dataset.id; const def=skillDefs[id];
    if (dna>=def.cost && localStorage.getItem('skill_'+id)!=='true'){
      dna -= def.cost; localStorage.setItem('dino_dna', dna); localStorage.setItem('skill_'+id, 'true');
      if (id==='f_dmg') skill_f_dmg=true; if (id==='f_hp') skill_f_hp=true; if (id==='a_jump') skill_a_jump=true; if (id==='a_magnet') skill_a_magnet=true; if (id==='l_coin') skill_l_coin=true; if (id==='l_event') skill_l_event=true;
      playSFX('buy'); dnaDisplay.textContent=`🧬 ${dna}`; renderSkills();
    }
  };
});
skillBtn.onclick = ()=>{ playSFX('click'); renderSkills(); skillModal.style.display='block'; };

function updateShopUI(){
  coinsDisplay.textContent=`🪙 ${coins}`; dnaDisplay.textContent=`🧬 ${dna}`;
  [['glasses',buyGlassesBtn,15,activeGlasses,hasGlasses],['shoes',buyShoesBtn,30,activeShoes,hasShoes],['magnet',buyMagnetBtn,50,activeMagnet,hasMagnet],['pet',buyPetBtn,200,activePet,hasPet],['dog',buyDogBtn,300,activeDog,hasDog]].forEach(([id,btn,price,active,owned])=>{
    if (!owned){ btn.querySelector('.price').textContent=`🪙 ${price}`; btn.classList.remove('inactive'); }
    else { btn.querySelector('.price').textContent = active?'ВКЛ':'ВЫКЛ'; btn.classList.toggle('inactive', !active); }
  });
  for(let i=0;i<=unlockedBiome;i++){ if(startBiomeSelect.options[i]) startBiomeSelect.options[i].disabled=false; }
  petDrone.style.display = activePet ? 'block':'none'; petDog.style.display = activeDog ? 'block':'none';
}
function setupShopBtn(btn, key, price){
  btn.onclick = async ()=>{
    let has = localStorage.getItem('dino_'+key)==='true';
    let active = has && localStorage.getItem('dino_'+key+'_active')!=='false';
    if (!has) {
      if (!playerName) { showAuthModal(); return; }
      if (coins < price) {
        showToast('⚠️ Не хватает монет');
        return;
      }
      if (btn.dataset.busy === '1') return;
      btn.dataset.busy = '1';
      try {
        // Владение расходником остаётся локальным, но монеты списывает сервер.
        const d = await enqueueProfileSync(async () => {
          const r = await apiFetch('/api/shop/buy-item', {
            method: 'POST',
            body: JSON.stringify({ name: playerName, item: key })
          });
          const data = await r.json().catch(() => null);
          if (!r.ok) {
            const e = new Error(data && data.detail ? data.detail : `HTTP ${r.status}`);
            e.status = r.status;
            throw e;
          }
          return data;
        });
        applyServerProfile(d, { invalidateSaves: true });
        localStorage.setItem('dino_'+key, 'true');
        localStorage.setItem('dino_'+key+'_active', 'true');
        playSFX('buy');
        has = true; active = true;
      } catch (e) {
        showToast(`❌ ${casinoErrorText(e)}`);
        if (e && e.status === 400) loadProfileFromServer();
        return;
      } finally {
        delete btn.dataset.busy;
      }
    } else {
      active = !active;
      localStorage.setItem('dino_'+key+'_active', active);
      playSFX('click');
    }
    if(key==='glasses'){ hasGlasses=has; activeGlasses=active; }
    if(key==='shoes'){ hasShoes=has; activeShoes=active; }
    if(key==='magnet'){ hasMagnet=has; activeMagnet=active; }
    if(key==='pet'){ hasPet=has; activePet=active; }
    if(key==='dog'){ hasDog=has; activeDog=active; }
    updateShopUI(); updateCasinoCoinsDisplay();
  };
}
setupShopBtn(buyGlassesBtn,'glasses',15); setupShopBtn(buyShoesBtn,'shoes',30); setupShopBtn(buyMagnetBtn,'magnet',50); setupShopBtn(buyPetBtn,'pet',200); setupShopBtn(buyDogBtn,'dog',300);

// ИСПРАВЛЕНО: Общий обработчик закрытия модалок
closeBtns.forEach(b=>b.onclick=()=>{ 
  playSFX('click'); 
  skillModal.style.display='none'; 
  skinsModal.style.display='none'; 
  trailModal.style.display='none'; 
  exchangeModal.style.display='none'; 
  petsModal.style.display='none'; 
  worldBossModal.style.display='none'; 
  const isCasinoBusy = isRouletteSpinning || isCoinflipSpinning || isDiceRolling || isJackpotSpinning;
  if (!isCasinoBusy) rouletteModal.style.display='none'; 
});

skinsBtn.onclick=()=>{ playSFX('click'); renderSkins(); skinsModal.style.display='block'; };

dailyChallengeBtn.onclick = () => {
  playSFX('click');
  if (!playerName) { showAuthModal(); return; }
  claimDailyReward();
  startGame(true);
};

function updateDog(){
  if (!activeDog) return;
  petDog.style.display = 'block';
  dogX += (100 - dogX) * 0.05; dogY += (10 - dogY) * 0.1;
  petDog.style.left = dogX + 'px'; petDog.style.bottom = dogY + 'px';
  const pickupSize = dogLevel >= 4 ? 70 : (dogLevel >= 2 ? 50 : 30);
  for (let i = coinEntities.length - 1; i >= 0; i--) {
    let c = coinEntities[i];
    if (checkAABB(dogX, dogY, pickupSize, pickupSize, c.x, c.y, c.w, c.h)) {
      c.el.remove(); coinEntities.splice(i, 1);
      playSFX('coin'); addCombo();
      let reward = Math.round((activeGlasses?2:1) * (skill_l_coin?2:1) * comboMultiplier * (playerArtifacts.includes('black_hole')?2:1) * (1 + (loopCount-1) * 0.25));
      coins += reward; coinsDisplay.textContent = `🪙 ${coins}`;
      const q = quests.find(x=>x.id==='coin'); if(q&&!q.done){q.current++; updateQuestProgress('coin'); checkQuestComplete('coin');}
    }
  }
}

function triggerRandomEvent(){
  if (currentEvent) return;
  const events = ['goldrush', 'frenzy', 'rush'];
  let availableEvents = events.filter(e => e !== lastEventType);
  if (availableEvents.length === 0) availableEvents = events;
  let type = availableEvents[Math.floor(Math.random() * availableEvents.length)];
  lastEventType = type; currentEvent = type;
  if (type === 'goldrush'){
    eventBanner.textContent = '🪙 ЗОЛОТАЯ ЛИХОРАДКА!'; eventBanner.style.color = '#ffd700'; eventBanner.style.display = 'block';
    const oldCap = coinCap;
    coinCap = 20;
    for(let i=0;i<15;i++){ setTimeout(()=>{ if (!isGameRunning) return; spawnCoin(); }, i*150); }
    setTimeout(()=>{ currentEvent=null; eventBanner.style.display='none'; coinCap = oldCap; nextEventTime = Date.now() + (skill_l_event ? 40000 : 80000); }, 4000);
  } else if (type === 'frenzy'){
    eventBanner.textContent = '⚡ БЕЗУМНАЯ СКОРОСТЬ!'; eventBanner.style.color = '#ff00ff'; eventBanner.style.display = 'block';
    setTimeout(()=>{ currentEvent=null; eventBanner.style.display='none'; nextEventTime = Date.now() + (skill_l_event ? 40000 : 80000); }, 5000);
  } else {
    eventBanner.textContent = '🌵 КАКТУСОВЫЙ БУМ!'; eventBanner.style.color = '#00ff88'; eventBanner.style.display = 'block';
    for(let i=0; i<5; i++) setTimeout(() => { if (!isGameRunning) return; spawnRushObstacle(); }, i * 1000);
    setTimeout(()=>{ currentEvent=null; eventBanner.style.display='none'; nextEventTime = Date.now() + (skill_l_event ? 40000 : 80000); }, 5000);
  }
}

function takeDamage(){
  if (Date.now() < invincibleUntil) return;
  if (isGodMode) { showToast('👻 БЕССМЕРТИЕ'); invincibleUntil = Date.now() + 500; return; }
  if (playerArtifacts.includes('chrono')) { timeWarpTimer = Date.now() + 2000; showToast('⚡ ВРЕМЯ ЗАМЕДЛЕНО!'); }
  if (hasShield){ hasShield=false; removeBuffIcon('shield'); playSFX('death'); gameContainer.classList.add('shake'); setTimeout(()=>gameContainer.classList.remove('shake'),300); invincibleUntil = Date.now()+1000; return; }
  currentHP--;
  if (livesDisplay) livesDisplay.innerHTML = '❤️'.repeat(Math.max(0, currentHP));
  if (currentHP<=0){ endGame(); return; }
  invincibleUntil = Date.now()+1500; playSFX('death'); gameContainer.classList.add('shake'); setTimeout(()=>gameContainer.classList.remove('shake'),300);
}

function addBuffIcon(type){
  if (activeBuffsUI.querySelector(`[data-buff-type="${type}"]`)) return;
  const el = document.createElement('div'); el.className = 'buff-icon'; el.dataset.buffType = type;
  el.textContent = type === 'shield' ? '🛡️' : '⚡'; el.style.color = type === 'shield' ? '#00ffff' : '#ff00ff';
  activeBuffsUI.appendChild(el);
}
function removeBuffIcon(type){ const el = activeBuffsUI.querySelector(`[data-buff-type="${type}"]`); if (el) el.remove(); }

function spawnPowerup(){
  if (powerupsOnScreen.length >= 2) return;
  const type = Math.random() < 0.5 ? 'shield' : 'megajump';
  const p = document.createElement('div'); p.className = `powerup ${type}`; p.textContent = type === 'shield' ? '🛡️' : '⚡';
  let px = gameContainer.offsetWidth; let py = (Math.floor(Math.random()*80)+40);
  p.style.left = px + 'px'; p.style.bottom = py + 'px';
  powerupsContainer.appendChild(p);
  powerupsOnScreen.push({ el: p, x: px, y: py, w: 34, h: 34, type: type });
}

const weatherTypeByBiome = ['sand', 'leaf', 'snow', 'spark', 'matrix'];
function spawnWeatherParticle(){
  const type = weatherTypeByBiome[currentBiomeTier] || 'snow';
  const p = document.createElement('div'); p.className = `weather-particle weather-${type}`;
  const startY = Math.random() * gameContainer.offsetHeight * 0.85;
  p.style.left = (gameContainer.offsetWidth + 10) + 'px'; p.style.top = startY + 'px';
  cloudsContainer.appendChild(p);
  const vx = 4 + Math.random() * 4; const vy = (type === 'snow') ? (1 + Math.random()) : (type === 'spark' ? -0.8 : 0);
  weatherParticles.push({el:p, x: gameContainer.offsetWidth + 10, y: startY, vx, vy});
}
function updateWeather(){
  weatherSpawnTimer++;
  const threshold = window.innerWidth < 900 ? 15 : 10; 
  if (weatherSpawnTimer > threshold) {
    spawnWeatherParticle();
    if (currentBiomeTier === 3 && Math.random() < 0.5) {
      const p = document.createElement('div'); p.className = 'weather-particle weather-ash';
      const sy = Math.random() * gameContainer.offsetHeight * 0.85;
      p.style.left = (gameContainer.offsetWidth + 10) + 'px'; p.style.top = sy + 'px';
      cloudsContainer.appendChild(p);
      weatherParticles.push({el:p, x: gameContainer.offsetWidth + 10, y: sy, vx: 2 + Math.random()*2, vy: 1.5 + Math.random()});
    }
    weatherSpawnTimer = 0;
  }
  for (let i = weatherParticles.length - 1; i >= 0; i--) {
    const p = weatherParticles[i];
    p.x -= p.vx; p.y += p.vy; p.el.style.left = p.x + 'px'; p.el.style.top = p.y + 'px';
    if (p.x < -30 || p.y > gameContainer.offsetHeight + 20 || p.y < -30) { p.el.remove(); weatherParticles.splice(i, 1); }
  }
}

function addCombo(){
  comboCount++; comboTimer = Date.now() + 2500;
  comboMultiplier = 1 + Math.floor(comboCount / 5) * 0.5;
  if (comboMultiplier >= 3.0 && !isOverdrive && overdriveCharged) {
    isOverdrive = true; overdriveCharged = false;
    overdriveTimer = Date.now() + 5000; 
    gameContainer.classList.add('overdrive');
    invincibleUntil = Date.now() + 5000; 
    showToast('🔥 ОВЕРДРАЙВ АКТИВИРОВАН!', true);
  }
  if (comboCount >= 3) {
    comboDisplay.style.display = 'block'; comboDisplay.textContent = `COMBO x${comboMultiplier.toFixed(1)}!`;
    comboDisplay.style.animation = 'none'; void comboDisplay.offsetWidth; comboDisplay.style.animation = 'pop 0.3s ease-out';
  }
}
function resetCombo(){ comboCount = 0; comboMultiplier = 1; comboDisplay.style.display = 'none'; overdriveCharged = true; }

function killBoss(){
  if (!bossElement) return;
  bossElement.remove(); bossElement=null;
  bossProjectileEntities.forEach(p=>p.el.remove()); bossProjectileEntities=[];
  droneProjectileEntities.forEach(p=>p.el.remove()); droneProjectileEntities=[];
  bossHpContainer.style.display='none'; isBossActive=false;
  runBossesKilled++;
  const bq = quests.find(q=>q.id==='boss'); if(bq){bq.current++; updateQuestProgress('boss'); checkQuestComplete('boss');}
  invincibleUntil = Date.now() + 2000;
  const bossCoinBonus = 30 * loopCount;
  coins += bossCoinBonus;
  coinsDisplay.textContent = `🪙 ${coins}`;
  localStorage.setItem('dino_coins', coins);
  if (currentHP <= 0) return;
  currentBiomeTier++; 
  if (currentBiomeTier > 4) {
    loopCount++;
    const loopBonusCoins = 200 * (loopCount - 1);
    const loopBonusDNA = 50 * (loopCount - 1);
    coins += loopBonusCoins; dna += loopBonusDNA;
    coinsDisplay.textContent = `🪙 ${coins}`; dnaDisplay.textContent = `🧬 ${dna}`;
    localStorage.setItem('dino_coins', coins); localStorage.setItem('dino_dna', dna);
    showToast(`🎉 ПЕТЛЯ ПРОЙДЕНА!\n+${loopBonusCoins} 🪙 · +${loopBonusDNA} 🧬`, true);
    updateLoopBadge();
    pendingLoopTransition = true;
    showArtifactSelection();
  } else {
    pendingStoryTier = currentBiomeTier;
    showArtifactSelection();
  }
}

function spawnBoss(){
  isBossActive=true; 
  const hpList=[3, 3, 5, 7, 9]; 
  let baseHP = hpList[currentBiomeTier] || 9; 
  let scaledHP = Math.ceil(baseHP * (1 + (loopCount-1) * 0.5));
  maxBossHP = hasGlassCannon ? Math.ceil(scaledHP / 3) : scaledHP;
  bossHP=maxBossHP;
  bossHpFill.style.width='100%'; bossHpContainer.style.display='block';
  if (altarEntity) { altarEntity.el.remove(); altarEntity = null; }
  obstacleEntities.forEach(e => e.el.remove());
  obstacleEntities = [];
  obstaclesContainer.innerHTML='';
  bossTime=0; bossShootTimer=0;
  bossElement=document.createElement('div'); bossElement.className='boss'; bossElement.style.left='100%';
  bossContainer.appendChild(bossElement); bossName.textContent=`БОСС БИОМА ${currentBiomeTier+1}${loopCount > 1 ? ' · ♾️ x' + loopCount : ''}`;
}

function updateBoss(timeScale = 1){
  if (!bossElement) return;
  bossTime += (0.015 + currentBiomeTier*0.005) * timeScale;
  const cx = (gameContainer.offsetWidth/2)-45; const amp = (gameContainer.offsetWidth/2)-100;
  bX = cx + Math.sin(bossTime)*amp; bY = 40 + Math.sin(bossTime)*10;
  bossElement.style.left = bX+'px'; bossElement.style.bottom = bY+'px';
  bossShootTimer += timeScale;
  let si = Math.max(40, 80-currentBiomeTier*10);
  if (currentBiomeTier === 1) si = 110; 
  const maxP = 2+currentBiomeTier;
  if (bossShootTimer>si && bossProjectileEntities.length<maxP){
    bossElement.classList.add('shooting'); setTimeout(()=>{ if(bossElement) bossElement.classList.remove('shooting'); }, 150);
    const tx = 90, ty = yPosition + 35; 
    const sp = 3 + currentBiomeTier*0.5;
    const fireProjectile = (sx, sy, vx, vy) => {
      const p=document.createElement('div'); p.className='boss-projectile';
      let width = 20, height = 20;
      if (currentBiomeTier === 3) { width = 30; height = 30; p.style.width = width+'px'; p.style.height = height+'px'; p.style.borderRadius = '5px'; p.style.backgroundColor = '#ff8c00'; p.style.boxShadow = '0 0 20px #ff8c00'; }
      p.style.left=sx+'px'; p.style.bottom=sy+'px'; bossContainer.appendChild(p);
      bossProjectileEntities.push({el:p,vx,vy,x:sx,y:sy,w:width,h:height});
    };
    if (currentBiomeTier === 0) { const sx=bX+45, sy=bY+45; const dx=tx-sx, dy=ty-sy; const d=Math.sqrt(dx*dx+dy*dy)||1; fireProjectile(sx, sy, (dx/d)*sp, (dy/d)*sp); } 
    else if (currentBiomeTier === 1) { const sx=bX+45, sy=bY+45; const dx=tx-sx, dy=ty-sy; const d=Math.sqrt(dx*dx+dy*dy)||1; const angle = Math.atan2(dy, dx); const jungleSp = 1.8; fireProjectile(sx, sy, Math.cos(angle)*jungleSp, Math.sin(angle)*jungleSp); fireProjectile(sx, sy, Math.cos(angle-0.4)*jungleSp, Math.sin(angle-0.4)*jungleSp); fireProjectile(sx, sy, Math.cos(angle+0.4)*jungleSp, Math.sin(angle+0.4)*jungleSp); }
    else if (currentBiomeTier === 2) { const sx=bX, sy=bY+20; fireProjectile(sx, sy, -6, 0); }
    else if (currentBiomeTier === 3) { fireProjectile(bX, 0, -7, 0); }
    else { const sx=bX+45, sy=bY+45; const dx=tx-sx, dy=ty-sy; const d=Math.sqrt(dx*dx+dy*dy)||1; const angle = Math.atan2(dy, dx); fireProjectile(sx, sy, Math.cos(angle)*sp, Math.sin(angle)*sp); fireProjectile(sx, sy, Math.cos(angle-0.3)*sp, Math.sin(angle-0.3)*sp); fireProjectile(sx, sy, Math.cos(angle+0.3)*sp, Math.sin(angle+0.3)*sp); }
    bossShootTimer=0;
  }
  for (let i=bossProjectileEntities.length-1;i>=0;i--){
    const p=bossProjectileEntities[i]; p.x+=p.vx*timeScale; p.y+=p.vy*timeScale;
    p.el.style.left=p.x+'px'; p.el.style.bottom=p.y+'px';
    if (checkAABB(HITBOX_X, yPosition + 10, HITBOX_W, HITBOX_H, p.x, p.y, p.w, p.h)){
      p.el.remove(); bossProjectileEntities.splice(i,1); takeDamage();
      if (!isGameRunning) return; continue;
    }
    if (p.y<-50||p.x<-50||p.x>gameContainer.offsetWidth+50){ p.el.remove(); bossProjectileEntities.splice(i,1); }
  }
  if (activePet){
    petDrone.style.display='block';
    const tx=80, ty=yPosition+80; petX += (tx-petX)*0.1; petY += (ty-petY)*0.1;
    petDrone.style.left=petX+'px'; petDrone.style.bottom=petY+'px';
    droneShootTimer += timeScale;
    const shootInterval = droneLevel >= 2 ? 84 : 120;
    if (droneShootTimer > shootInterval) {
      const bcx = bX + 45; const bcy = bY + 45;
      const dx = bcx - petX, dy = bcy - petY;
      const d = Math.sqrt(dx*dx + dy*dy) || 1;
      const baseAngle = Math.atan2(dy, dx);
      const offsets = droneLevel >= 3 ? [-0.2, 0, 0.2] : [0];
      offsets.forEach(off => {
        const rad = baseAngle + off;
        const pr2 = document.createElement('div'); pr2.className = 'drone-projectile';
        pr2.style.left = petX + 'px'; pr2.style.bottom = petY + 'px';
        bossContainer.appendChild(pr2);
        droneProjectileEntities.push({ el: pr2, vx: Math.cos(rad) * 5, vy: Math.sin(rad) * 5, x: petX, y: petY, w: 12, h: 12 });
      });
      droneShootTimer = 0;
    }
    for (let i=droneProjectileEntities.length-1;i>=0;i--){
      const p=droneProjectileEntities[i];
      p.x+=p.vx*timeScale; p.y+=p.vy*timeScale;
      p.el.style.left=p.x+'px'; p.el.style.bottom=p.y+'px';
      if (checkAABB(bX, bY, 90, 90, p.x, p.y, p.w, p.h)){
        p.el.remove(); droneProjectileEntities.splice(i,1);
        const dmg = droneLevel >= 4 ? 0.225 : 0.15;
        bossHP -= dmg;
        bossHpFill.style.width=(Math.max(0,bossHP)/maxBossHP*100)+'%'; playSFX('boss_hit');
        if (bossHP<=0){ killBoss(); return; }
      } else if (p.y<-50||p.x<-50||p.x>gameContainer.offsetWidth+50){ p.el.remove(); droneProjectileEntities.splice(i,1); }
    }
    if (droneLevel >= 5) {
      droneLaserTimer += timeScale;
      if (droneLaserTimer > 120) {
        droneLaserTimer = 0;
        bossHP -= 0.45;
        bossHpFill.style.width = (Math.max(0, bossHP) / maxBossHP * 100) + '%';
        playSFX('boss_hit');
        bossElement.style.filter = 'drop-shadow(0 0 60px #00ffff) drop-shadow(0 0 100px #00ffff) brightness(2)';
        petDrone.style.filter = 'drop-shadow(0 0 30px #00ffff) brightness(2)';
        setTimeout(() => { if (bossElement) bossElement.style.filter = ''; petDrone.style.filter = ''; }, 200);
        if (bossHP <= 0) { killBoss(); return; }
      }
    }
  }
  if (checkAABB(HITBOX_X, yPosition + 10, HITBOX_W, HITBOX_H, bX, bY, 90, 90)){
    if (yVelocity < 0 && (yPosition + 10) > (bY + 40)){
      bossHP--; bossHpFill.style.width=(Math.max(0,bossHP)/maxBossHP*100)+'%'; playSFX('boss_hit'); yVelocity = 12; invincibleUntil = Date.now() + 500; if (bossHP<=0) { killBoss(); return; }
    } else { takeDamage(); if (!isGameRunning) return; }
  }
}

function gameLoop(){
  if (!isGameRunning) return;
  let timeScale = 1;
  if (Date.now() < timeWarpTimer) timeScale = 0.5; 
  if (playerArtifacts.includes('vampire') && score > 0 && score % 10000 === 0 && currentHP < (hasGlassCannon ? 1 : 3)) {
      if (!hasGlassCannon) {
          currentHP++;
          if (livesDisplay) { livesDisplay.innerHTML = '❤️'.repeat(currentHP); livesDisplay.style.display = 'flex'; }
          showToast('🩸 ВАМПИРИЗМ: +1 ЖИЗНЬ!');
      }
  }
  if (isBossActive){ updateBoss(timeScale); } 
  else {
    score++; const cs = Math.floor(score/10); scoreDisplay.textContent = String(cs).padStart(5,'0');
    
    // МИРОВОЙ БОСС: очки → урон
    if (playerName && currentWorldBossState && !currentWorldBossState.killed) {
      pendingWorldBossDamage += 1;
      if (pendingWorldBossDamage >= 100 || (Date.now() - lastWorldBossFlush) > 5000) {
        flushWorldBossDamage();
      }
    }
    
    const sq = quests.find(q=>q.id==='score'); if (sq&&!sq.done){ sq.current=cs; if (cs>=sq.target) checkQuestComplete('score'); else updateQuestProgress('score'); }
    if (cs>=nextBossScore){ spawnBoss(); } else {
      let speed = window.innerWidth<900?3:4.5; 
      if (isDailyMode) speed *= 1.5;
      if (currentEvent==='frenzy') speed *= 1.4;
      if (playerArtifacts.includes('berserk')) speed *= 1.2; 
      speed *= timeScale; 
      speed *= (1 + (loopCount-1) * 0.15);
      spawnObstacleTimer++; if (spawnObstacleTimer>100){ spawnObstacle(); spawnObstacleTimer=0; }
      spawnCoinTimer++; 
      if (spawnCoinTimer > (150 + Math.random() * 150)) { spawnCoin(); spawnCoinTimer = 0; }
      spawnPowerupTimer++; if (spawnPowerupTimer>600){ spawnPowerup(); spawnPowerupTimer=0; }
      if (!altarEntity && !isBossActive) {
          spawnAltarTimer++;
          if (spawnAltarTimer > 1000) { spawnAltar(); spawnAltarTimer = 0; }
      }
      if (Date.now() > nextEventTime && !currentEvent){
        if (Math.random() < (skill_l_event ? 0.9 : 0.5)) triggerRandomEvent();
        else nextEventTime = Date.now() + 30000;
      }
      
      // Собачка Lv3 и Lv5
      if (activeDog && dogLevel >= 3) {
        dogBarkTimer += timeScale;
        if (dogBarkTimer > 300) {
          dogBarkTimer = 0;
          for (let i = 0; i < obstacleEntities.length; i++) {
            if (obstacleEntities[i].el.classList.contains('flying')) {
              const ob = obstacleEntities[i]; ob.el.remove(); obstacleEntities.splice(i, 1);
              petDog.style.filter = 'drop-shadow(0 0 20px #00ffff) brightness(2)';
              setTimeout(() => { petDog.style.filter = 'drop-shadow(0 0 5px #8B4513)'; }, 300);
              showToast('🐕 ГАВ! Птица отпугнута');
              break;
            }
          }
        }
      }
      if (activeDog && dogLevel >= 5) {
        dogFireTimer += timeScale;
        if (dogFireTimer > 180) {
          dogFireTimer = 0;
          for (let i = 0; i < obstacleEntities.length; i++) {
            const ob = obstacleEntities[i];
            if (ob.x > HITBOX_X + HITBOX_W && ob.x < HITBOX_X + 500 && !ob.el.classList.contains('flying')) {
              const fire = document.createElement('div');
              fire.className = 'trail-particle fire';
              fire.style.left = ob.x + 'px'; fire.style.bottom = '20px';
              trailContainer.appendChild(fire);
              setTimeout(() => fire.remove(), 700);
              ob.el.remove(); obstacleEntities.splice(i, 1);
              petDog.style.filter = 'drop-shadow(0 0 20px #ff2a2a) brightness(2)';
              setTimeout(() => { petDog.style.filter = 'drop-shadow(0 0 5px #8B4513)'; }, 300);
              showToast('🔥 ЦЕРБЕР СЖЁГ ВРАГА');
              break;
            }
          }
        }
      }
      
      for (let i=obstacleEntities.length-1; i>=0; i--) {
        let o = obstacleEntities[i]; o.x -= speed; o.el.style.left = o.x + 'px';
        if (checkAABB(HITBOX_X, yPosition + 10, HITBOX_W, HITBOX_H, o.x, o.y, o.w, o.h)) { 
            o.el.remove(); obstacleEntities.splice(i, 1); takeDamage(); 
            if(!isGameRunning) return; continue; 
        }
        if (o.isElite && o.x < -150) {
            for(let c=0; c<10; c++) { setTimeout(()=>spawnCoin(), c*50); }
            showToast('💰 ЭЛИТНЫЙ ВРАГ ПРОЙДЕН!');
        }
        if (o.x < -150) { o.el.remove(); obstacleEntities.splice(i, 1); }
      }
      if (altarEntity) {
          altarEntity.x -= speed;
          altarEntity.el.style.left = altarEntity.x + 'px';
          if (checkAABB(HITBOX_X, yPosition + 10, HITBOX_W, HITBOX_H, altarEntity.x, altarEntity.y, altarEntity.w, altarEntity.h)) {
              altarEntity.el.remove(); altarEntity = null; isGameRunning = false; altarModal.style.display = 'block';
          } else if (altarEntity && altarEntity.x < -100) { altarEntity.el.remove(); altarEntity = null; }
      }
      for (let i=coinEntities.length-1; i>=0; i--) {
        let c = coinEntities[i]; let cx = c.x - speed; let cy = c.y;
        if (activeMagnet){
          const dx = 90 - cx; const dy = (yPosition + 35) - cy;
          const range = (skill_a_magnet || playerArtifacts.includes('black_hole')) ? 800 : 300;
          if (Math.sqrt(dx*dx+dy*dy)<range){ cx+=dx*0.08; cy+=dy*0.08; }
        }
        c.x = cx; c.y = cy; c.el.style.left = c.x + 'px'; c.el.style.bottom = c.y + 'px';
        if (checkAABB(HITBOX_X, yPosition + 10, HITBOX_W, HITBOX_H, c.x, c.y, c.w, c.h)) {
          c.el.remove(); coinEntities.splice(i, 1); playSFX('coin'); addCombo();
          let mult = comboMultiplier;
          if (activeGlasses) mult *= 2;
          if (skill_l_coin) mult *= 2;
          if (playerArtifacts.includes('black_hole')) mult *= 2;
          const r = Math.round(mult * (1 + (loopCount-1) * 0.25));
          coins+=r; localStorage.setItem('dino_coins',coins); coinsDisplay.textContent=`🪙 ${coins}`;
          const q=quests.find(qq=>qq.id==='coin'); if(q&&!q.done){q.current++; updateQuestProgress('coin'); checkQuestComplete('coin');}
        } else if (c.x < -50) { c.el.remove(); coinEntities.splice(i, 1); }
      }
      for (let i=powerupsOnScreen.length-1; i>=0; i--) {
        const p = powerupsOnScreen[i]; p.x -= speed; p.el.style.left = p.x + 'px';
        if (checkAABB(HITBOX_X, yPosition + 10, HITBOX_W, HITBOX_H, p.x, p.y, p.w, p.h)) {
          if (p.type === 'shield') { hasShield = true; shieldTimer = Date.now() + 8000; addBuffIcon('shield'); }
          else { hasDoubleJump = true; megaJumpTimer = Date.now() + 8000; addBuffIcon('megajump'); }
          playSFX('buy'); p.el.remove(); powerupsOnScreen.splice(i, 1);
        } else if (p.x < -50) { p.el.remove(); powerupsOnScreen.splice(i, 1); }
      }
    }
    if (cs>highScore){ highScore=cs; highScoreDisplay.textContent=`HI ${String(highScore).padStart(5,'0')}`; }
  }
  if (hasShield && Date.now() > shieldTimer) { hasShield = false; removeBuffIcon('shield'); }
  if (hasDoubleJump && Date.now() > megaJumpTimer) { hasDoubleJump = false; removeBuffIcon('megajump'); }
  if (isOverdrive && Date.now() > overdriveTimer) { isOverdrive = false; gameContainer.classList.remove('overdrive'); }
  if (comboCount > 0 && Date.now() > comboTimer) resetCombo();
  updateDog(); updateWeather();
  trailSpawnTimer++;
  if (trailSpawnTimer >= 3) { spawnTrailParticle(); trailSpawnTimer = 0; }
  if (!isBossActive && activePet){
    petDrone.style.display='block';
    const tx=80, ty=yPosition+80; petX += (tx-petX)*0.1; petY += (ty-petY)*0.1;
    petDrone.style.left=petX+'px'; petDrone.style.bottom=petY+'px';
  }
  if (!isGrounded){
    yVelocity -= 0.5; yPosition += yVelocity;
    if (yPosition<=0){ yPosition=0; yVelocity=0; isGrounded=true; player.classList.add('running'); jumpCount=0; }
  }
  player.style.bottom = yPosition+'px';
  if (isGodMode) player.style.opacity = '1';
  else if (Date.now() < invincibleUntil) player.style.opacity = (Math.floor(Date.now()/100)%2)?'0.3':'1';
  else player.style.opacity = '1';
  animationFrameId = requestAnimationFrame(gameLoop);
}

function spawnObstacle(){
  if (gameContainer.offsetWidth===0) return;
  const o = document.createElement('div'); o.classList.add('obstacle');
  let w, h, flying = false;
  let isElite = Math.random() < 0.03; 
  if (isElite) o.classList.add('elite');
  if (Math.random()<0.2) { o.classList.add('flying'); w = 60; h = 45; flying = true; }
  else { h = (Math.floor(Math.random()*30)+50); w = Math.random()>0.6?55:35; o.style.height = h+'px'; o.style.width = w+'px'; }
  let ox = gameContainer.offsetWidth; let oy = flying ? 70 : 0;
  o.style.left = ox + 'px'; o.style.bottom = oy + 'px';
  obstaclesContainer.appendChild(o);
  obstacleEntities.push({ el: o, x: ox, y: oy, w: w, h: h, isElite: isElite });
}

function spawnRushObstacle(){
  if (gameContainer.offsetWidth===0) return;
  const o = document.createElement('div'); o.classList.add('obstacle');
  let h = (Math.floor(Math.random()*30)+50); 
  let w = Math.random()>0.6?55:35; 
  o.style.height = h+'px'; o.style.width = w+'px';
  let ox = gameContainer.offsetWidth; 
  o.style.left = ox + 'px'; o.style.bottom = '0px';
  obstaclesContainer.appendChild(o);
  obstacleEntities.push({ el: o, x: ox, y: 0, w: w, h: h, isElite: false });
}

function spawnCoin(){
  if (coinEntities.length >= coinCap) return;
  const c = document.createElement('div'); c.className = 'coin';
  let cx = gameContainer.offsetWidth - 40; let cy = (Math.floor(Math.random()*120)+50);
  c.style.left = cx + 'px'; c.style.bottom = cy + 'px';
  coinsContainer.appendChild(c);
  coinEntities.push({ el: c, x: cx, y: cy, w: 24, h: 24 });
}

function renderQuests(){
  questListUI.innerHTML='';
  quests.forEach(q=>{ const d=document.createElement('div'); d.dataset.questId = q.id; d.className=`quest-item ${q.done?'done':''}`; d.innerHTML=`${q.done?'✅':'⏳'} ${q.text} (${Math.min(q.current,q.target)}/${q.target})`; questListUI.appendChild(d); });
}
function updateQuestProgress(id){
  const q = quests.find(x=>x.id===id); if (!q) return;
  const el = questListUI.querySelector(`[data-quest-id="${id}"]`); if (!el) return;
  el.className = `quest-item ${q.done?'done':''}`; el.innerHTML = `${q.done?'✅':'⏳'} ${q.text} (${Math.min(q.current,q.target)}/${q.target})`;
}
function checkQuestComplete(id){
  const q=quests.find(x=>x.id===id);
  if (q&&!q.done&&q.current>=q.target){
    q.done=true; coins+=q.reward; localStorage.setItem('dino_coins',coins); coinsDisplay.textContent=`🪙 ${coins}`;
    playSFX('buy'); showToast(`🎉 КВЕСТ ВЫПОЛНЕН!\n${q.text}\n+${q.reward} 🪙`); updateShopUI(); saveProfileToServer();
  }
  updateQuestProgress(id);
}

function initRun(daily=false){
  isDailyMode = daily;
  isGameRunning = false;
  isBossActive = false;
  bossHpContainer.style.display='none';
  if (bossElement){ bossElement.remove(); bossElement=null; }
  clearEntities();
  gameMenu.style.display='none';
  obstaclesContainer.innerHTML=''; bossContainer.innerHTML=''; coinsContainer.innerHTML=''; powerupsContainer.innerHTML='';
  weatherParticles.forEach(p=>p.el.remove()); weatherParticles=[]; weatherSpawnTimer = 0;
  trailSpawnTimer = 0;
  dogBarkTimer = 0; dogFireTimer = 0; droneLaserTimer = 0;
  pendingWorldBossDamage = 0;
  lastWorldBossFlush = Date.now();
  
  if (daily) {
    const dateKey = new Date().toISOString().slice(0,10);
    setDailySeed(hashCode(dateKey));
  } else {
    setDailySeed(null);
  }
  if (dailyBadge) dailyBadge.style.display = daily ? 'inline' : 'none';
  loopCount = 1; pendingLoopTransition = false;
  updateLoopBadge();
  const stats = getClassStats(); maxHP = stats.hp; currentHP = stats.hp;
  livesDisplay.innerHTML = '❤️'.repeat(currentHP); livesDisplay.style.display = (maxHP>1 || isGodMode) ? 'flex':'none';
  score=0; yPosition=0; yVelocity=0; isGrounded=true; jumpCount=0;
  spawnObstacleTimer=0; spawnCoinTimer=0; spawnPowerupTimer=0; droneShootTimer=0;
  coinCap = 5;
  playerArtifacts = []; hasGlassCannon = false; timeWarpTimer = 0; activeArtifactsUI.innerHTML = ''; 
  isOverdrive = false; overdriveCharged = true; gameContainer.classList.remove('overdrive');
  altarEntity = null; spawnAltarTimer = 0;
  hasShield = false; hasDoubleJump = false; 
  shieldTimer = 0; megaJumpTimer = 0;
  activeBuffsUI.innerHTML = ''; resetCombo();
  petDog.style.display = activeDog?'block':'none'; dogX=50; dogY=0;
  currentEvent=null; eventBanner.style.display='none'; nextEventTime = Date.now() + 60000; lastEventType = null;
  quests.forEach(q=>{q.current=0;q.done=false;}); renderQuests();
  currentBiomeTier = daily?0:(parseInt(startBiomeSelect.value)||0);
  nextBossScore = getLoopBaseScore() + (currentBiomeTier+1)*300;
  gameContainer.className = `game-container biome-${['desert','jungle','ice','volcano','cyber'][currentBiomeTier]}`;
  playBiomeMusic(currentBiomeTier);
  updatePlayerSkin(); player.classList.add('running');
  updateGodModeUI();
  invincibleUntil = Date.now()+2000;
  highScore = parseInt(localStorage.getItem(daily?'dino_daily_hs':'dino_highscore'))||0;
  highScoreDisplay.textContent=`HI ${String(highScore).padStart(5,'0')}`;
  updateCasinoStatsDisplay();
}

function runErrorText(status, data) {
  const detail = data && data.detail;
  const text = Array.isArray(detail)
    ? detail.map(item => item.msg || '').join('; ')
    : (typeof detail === 'string' ? detail : '');
  if (status === 401) return 'Войдите в аккаунт';
  if (status === 429 || text.includes('Too many requests')) {
    return 'слишком часто, подождите пару секунд';
  }
  if (text.toLowerCase().includes('too short')) return 'забег короче 10 секунд';
  if (text.toLowerCase().includes('run expired')) return 'забег просрочен';
  return text || `ошибка ${status}`;
}

let runStartPending = false;
async function startGame(daily=false){
  initAudio();
  if (runStartPending || isRunFinalizing) return;
  if (!playerName) { showAuthModal(); return; }

  runStartPending = true;
  startBtn.disabled = true;
  try {
    const r = await apiFetch('/api/run/start', {
      method: 'POST',
      body: JSON.stringify({ name: playerName })
    });
    const d = await r.json().catch(() => null);
    if (!r.ok || !d || !d.run_id) {
      showToast(`❌ Не удалось начать забег: ${runErrorText(r.status, d)}`);
      return;
    }
    activeRunId = d.run_id;
    runCoinsStart = coins;
    runBossesKilled = 0;
  } catch (e) {
    console.error('Run start failed', e);
    showToast('❌ Сервер недоступен. Забег не начат.');
    return;
  } finally {
    runStartPending = false;
    startBtn.disabled = false;
  }

  initRun(daily);
  const startTier = parseInt(startBiomeSelect.value)||0;
  const showIntro = !daily && !hasSeenIntro && startTier === 0;
  if (showIntro) {
    hasSeenIntro = true;
    showStory(0);
  } else {
    isGameRunning = true;
    gameLoop();
  }
}

async function endGame(){
  if (!isGameRunning) return;
  isGameRunning=false;
  isRunFinalizing=true;
  cancelAnimationFrame(animationFrameId); bgMusic.pause(); playSFX('death');
  setDailySeed(null);
  bossHpContainer.style.display='none';
  if(bossElement){bossElement.remove();bossElement=null;}
  player.classList.remove('running');
  clearEntities();
  trailContainer.innerHTML = '';

  const cs = Math.floor(score/10); const dr = Math.floor(cs/50);
  const loops = loopCount;
  const questsDone = quests.filter(q=>q.done).length;
  const bossesKilled = runBossesKilled;
  const runId = activeRunId;
  const coinsEarned = Math.max(0, coins - runCoinsStart);

  dna += dr; localStorage.setItem('dino_dna', dna);
  if (cs>highScore){ highScore=cs; localStorage.setItem(isDailyMode?'dino_daily_hs':'dino_highscore', highScore); }

  menuTitle.textContent='GAME OVER';
  menuText.innerHTML = `Счёт: ${cs}<br>Достигнута петля: ♾️ x${loops}<br>Получено ДНК: 🧬 +${dr}<br><span style="color:#aaa;font-size:11px;">Начисляем награду...</span>`;
  startBtn.textContent='ИГРАТЬ СНОВА';
  startBtn.disabled = true;
  gameMenu.style.display='flex'; updateShopUI(); updatePlayerSkin(); updateNameUI();

  // Урон боссу начисляется до закрытия забега, иначе сервер его отклонит.
  if (pendingWorldBossDamage > 0) {
    try { await flushWorldBossDamage(); } catch(e) { console.error('Boss damage flush failed', e); }
  }

  let finishResult = null;
  let finishError = '';
  if (playerName && runId) {
    try {
      const r = await apiFetch('/api/run/finish', {
        method: 'POST',
        body: JSON.stringify({
          name: playerName,
          run_id: runId,
          score: cs,
          coins_earned: coinsEarned,
          quests_completed: questsDone,
          bosses_killed: bossesKilled,
          loops: loops
        })
      });
      const d = await r.json().catch(() => null);
      if (r.ok && d) {
        finishResult = d;
        applyServerProfile(d);
        loadLeaderboard();
      } else {
        finishError = runErrorText(r.status, d);
      }
    } catch (e) {
      console.error('Run finish failed', e);
      finishError = 'сервер недоступен';
    }
  }
  activeRunId = null;

  let rewardHtml = '';
  if (finishResult) {
    const awarded = typeof finishResult.coins_awarded === 'number' ? finishResult.coins_awarded : 0;
    rewardHtml = `<br>Монеты: 🪙 +${awarded}`;
    if (finishResult.clamped) {
      rewardHtml += ` <span style="color:#ffd700;font-size:11px;">(ограничено сервером)</span>`;
    }
    if (finishResult.score_clamped) {
      rewardHtml += `<br><span style="color:#ffd700;font-size:11px;">Счёт ограничен сервером по времени забега</span>`;
    }
  } else if (finishError) {
    rewardHtml = `<br><span style="color:#ff2a2a;font-size:11px;">Награда не начислена: ${escapeHTML(finishError)}</span>`;
  }

  menuText.innerHTML = `Счёт: ${cs}<br>Достигнута петля: ♾️ x${loops}<br>Получено ДНК: 🧬 +${dr}${rewardHtml}`;
  startBtn.disabled = false;
  if (finishResult && finishResult.clamped) {
    showToast('⚠️ Награда ограничена сервером (лимит монет за время забега)');
  }
  if (finishError) {
    showToast(`⚠️ ${finishError}`);
  }
  isRunFinalizing = false;
}

function doJump(){
  if (!isGameRunning) return;
  const stats = getClassStats(); const baseJump = activeShoes?14:12; const jumpForce = baseJump * stats.jumpMul;
  if (isGrounded){
    playSFX('jump'); yVelocity = jumpForce; isGrounded=false; jumpCount=1;
    const q=quests.find(x=>x.id==='jump'); if(q&&!q.done){q.current++; updateQuestProgress('jump'); checkQuestComplete('jump');}
  } else if ((selectedSkin==='raptor'||hasDoubleJump) && jumpCount===1){
    playSFX('jump'); yVelocity = jumpForce*0.85; jumpCount=2;
    const q=quests.find(x=>x.id==='jump'); if(q&&!q.done){q.current++; updateQuestProgress('jump'); checkQuestComplete('jump');}
  }
}
function handleKeyDown(e){
  if (e.target.tagName==='INPUT') return;
  if (e.code==='Space'||e.key==='ArrowUp'){ e.preventDefault(); if(!isGameRunning) startGame(false); else doJump(); }
}
mobileJumpBtn.addEventListener('touchstart',(e)=>{e.preventDefault(); if(!isGameRunning) startGame(false); else doJump();});
startBtn.onclick = ()=>startGame(false);
window.addEventListener('keydown', handleKeyDown);

updateShopUI(); renderQuests(); updatePlayerSkin(); renderSkills(); updateNameUI(); updateGodModeUI();
loadLeaderboard();
initAuth();