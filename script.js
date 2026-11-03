const player = document.querySelector('.player');
const obstaclesContainer = document.getElementById('obstacles');
const cloudsContainer = document.getElementById('clouds');
const coinsContainer = document.getElementById('coins-container');
const particlesContainer = document.getElementById('particles-container');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const coinsDisplay = document.getElementById('coins-display');
const gameContainer = document.querySelector('.game-container');
const shopContainer = document.querySelector('.shop-container');
const questListUI = document.getElementById('quest-list');

const buyGlassesBtn = document.getElementById('buy-glasses-btn');
const buyShoesBtn = document.getElementById('buy-shoes-btn');
const buyMagnetBtn = document.getElementById('buy-magnet-btn');

const gameMenu = document.getElementById('game-menu');
const menuTitle = document.getElementById('menu-title');
const menuText = document.getElementById('menu-text');
const startBtn = document.getElementById('start-btn');
const leaderboardList = document.getElementById('leaderboard-list');
const nameInput = document.getElementById('player-name-input');

// Мобильные кнопки
const mobileJumpBtn = document.getElementById('mobile-jump-btn');
const mobileDuckBtn = document.getElementById('mobile-duck-btn');

const API_BASE = 'https://dino-game-backend-summer-tide-6155.fly.dev';

let score = 0;
let isGameRunning = false;
let lastScore = 0;
let isDucking = false;
let animationFrameId;
let currentBiomeTier = -1;

let coins = 0;
let hasGlasses = false, hasShoes = false, hasMagnet = false;
const glassesPrice = 15, shoesPrice = 30, magnetPrice = 50;

let runJumps = 0;
let runCoins = 0;

let quests = [
    { id: 'jump', text: 'Прыгни 5 раз', target: 5, current: 0, reward: 5, done: false },
    { id: 'coin', text: 'Собери 10 монет', target: 10, current: 0, reward: 10, done: false }
];

let yPosition = 0, yVelocity = 0, isGrounded = true;
const gravity = 0.5;
let currentJumpForce = 11;

let spawnObstacleTimer = 0, spawnCoinTimer = 0, spawnCloudTimer = 0;

let highScore = parseInt(localStorage.getItem('dino_highscore'), 10) || 0;
highScoreDisplay.textContent = `HI ${String(highScore).padStart(5, '0')}`;

function escapeHtml(s) { 
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); 
}

// --- БЭКЕНД ---
async function loadOnlineLeaderboard() {
    try {
        const res = await fetch(`${API_BASE}/api/leaderboard`);
        const data = await res.json();
        leaderboardList.innerHTML = data.length ? '' : 'Пока никто не играл';
        data.forEach((entry, i) => {
            const row = document.createElement('div');
            row.style.cssText = "margin:5px 0;";
            row.innerHTML = `${i+1}. <span style="color:#fff;">${escapeHtml(entry.name)}</span> — <span style="color:#00ff88; font-weight:bold;">${entry.score}</span>`;
            leaderboardList.appendChild(row);
        });
    } catch { leaderboardList.innerHTML = '<span style="color:#ff2a2a;">Сервер недоступен ❌</span>'; }
}

async function sendScoreToBackend(playerName, playerScore) {
    try {
        await fetch(`${API_BASE}/api/score`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name: playerName, score: playerScore })
        });
        loadOnlineLeaderboard();
    } catch (e) { console.error(e); }
}

async function loadPlayerProfile(name) {
    try {
        const res = await fetch(`${API_BASE}/api/player/load`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name: name })
        });
        const data = await res.json();
        coins = data.coins;
        coinsDisplay.textContent = `🪙 ${coins}`;
    } catch (e) { console.error('Ошибка загрузки профиля', e); }
}

async function savePlayerProfile(name) {
    if (!name || name === 'Аноним') return;
    try {
        await fetch(`${API_BASE}/api/player/save`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name: name, coins: coins, quests_done: 0 })
        });
    } catch (e) { console.error('Ошибка сохранения профиля', e); }
}

// --- КВЕСТЫ ---
function renderQuests() {
    questListUI.innerHTML = '';
    quests.forEach(q => {
        const div = document.createElement('div');
        div.className = `quest-item ${q.done ? 'done' : ''}`;
        div.innerHTML = `${q.done ? '✅' : '⏳'} ${q.text} (${q.current}/${q.target})`;
        questListUI.appendChild(div);
    });
}

function updateQuest(id) {
    const q = quests.find(x => x.id === id);
    if (q && !q.done) {
        q.current++;
        if (q.current >= q.target) {
            q.done = true;
            coins += q.reward;
            coinsDisplay.textContent = `🪙 ${coins}`;
            const name = localStorage.getItem('dino_playername') || 'Игрок';
            savePlayerProfile(name); 
        }
        renderQuests();
    }
}

// --- БИОМЫ ---
function updateBiome(scoreVal) {
    gameContainer.className = 'game-container'; 
    if (scoreVal < 300) gameContainer.classList.add('biome-desert');
    else if (scoreVal < 600) gameContainer.classList.add('biome-jungle');
    else if (scoreVal < 1000) gameContainer.classList.add('biome-ice');
    else gameContainer.classList.add('biome-volcano');
}

// --- СПАВН ---
function spawnCloud() { /* ... */ 
    const cloud = document.createElement('div');
    cloud.classList.add('cloud');
    cloud.style.width = Math.random() * 40 + 30 + 'px';
    cloud.style.height = (parseFloat(cloud.style.width) / 3) + 'px';
    cloud.style.top = Math.random() * 100 + 20 + 'px';
    cloud.style.left = '100vw'; // Используем vw для мобилок
    cloudsContainer.appendChild(cloud);
}

function spawnObstacle() {
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    const isFlying = Math.random() < 0.3; 
    if (isFlying) {
        obstacle.classList.add('flying');
    } else {
        obstacle.style.height = Math.floor(Math.random() * 25) + 40 + 'px';
        obstacle.style.width = Math.random() > 0.6 ? '45px' : '25px';
    }
    obstacle.style.left = '100vw'; // Используем vw
    obstaclesContainer.appendChild(obstacle);
}

function spawnCoin() {
    const coin = document.createElement('div');
    coin.classList.add('coin');
    coin.style.bottom = Math.floor(Math.random() * 120) + 50 + 'px'; 
    coin.style.left = '100vw'; // Используем vw
    coinsContainer.appendChild(coin);
}

function createParticles(x, y) {
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const size = Math.random() * 8 + 4;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = (x + 10 + Math.random() * 20) + 'px';
        particle.style.bottom = (y + Math.random() * 10) + 'px';
        particlesContainer.appendChild(particle);
        setTimeout(() => particle.remove(), 500);
    }
}

// --- УПРАВЛЕНИЕ ---
function doJump() {
    if (isGrounded && isGameRunning && !isDucking) {
        yVelocity = currentJumpForce;
        isGrounded = false;
        player.classList.remove('running');
        
        const rect = player.getBoundingClientRect();
        const gameRect = gameContainer.getBoundingClientRect();
        createParticles(rect.left - gameRect.left, 0);

        runJumps++;
        updateQuest('jump');
    }
}

function startDucking() {
    if (isGameRunning && !isDucking) {
        isDucking = true;
        player.classList.add('ducking');
        if (!isGrounded) { yVelocity = -12; }
    }
}

function endDucking() {
    isDucking = false;
    player.classList.remove('ducking');
}

function handleKeyDown(event) {
    if (event.target.tagName === 'INPUT') return;
    if (event.code === 'Space' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!isGameRunning) startGame();
        else doJump();
    }
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        startDucking();
    }
}

function handleKeyUp(event) {
    if (event.key === 'ArrowDown') {
        endDucking();
    }
}

// --- МОБИЛЬНОЕ УПРАВЛЕНИЕ (Touch события) ---
mobileJumpBtn.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Отменяем стандартное поведение Safari
    if (!isGameRunning) startGame();
    else doJump();
});

mobileDuckBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDucking();
});

mobileDuckBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    endDucking();
});

// --- МАГАЗИН ---
buyGlassesBtn.onclick = () => {
    if (coins >= glassesPrice && !hasGlasses) {
        coins -= glassesPrice; hasGlasses = true;
        coinsDisplay.textContent = `🪙 ${coins}`;
        buyGlassesBtn.disabled = true; buyGlassesBtn.querySelector('.price').textContent = "КУПЛЕНО";
        savePlayerProfile(localStorage.getItem('dino_playername') || 'Игрок');
    }
};

buyShoesBtn.onclick = () => {
    if (coins >= shoesPrice && !hasShoes) {
        coins -= shoesPrice; hasShoes = true;
        currentJumpForce = 14;
        coinsDisplay.textContent = `🪙 ${coins}`;
        buyShoesBtn.disabled = true; buyShoesBtn.querySelector('.price').textContent = "КУПЛЕНО";
        savePlayerProfile(localStorage.getItem('dino_playername') || 'Игрок');
    }
};

buyMagnetBtn.onclick = () => {
    if (coins >= magnetPrice && !hasMagnet) {
        coins -= magnetPrice; hasMagnet = true;
        coinsDisplay.textContent = `🪙 ${coins}`;
        buyMagnetBtn.disabled = true; buyMagnetBtn.querySelector('.price').textContent = "КУПЛЕНО";
        savePlayerProfile(localStorage.getItem('dino_playername') || 'Игрок');
    }
};

// --- ИГРОВОЙ ЦИКЛ ---
function gameLoop() {
    if (!isGameRunning) return;

    if (!isGrounded) {
        yVelocity -= gravity;
        yPosition += yVelocity;
        if (yPosition <= 0) {
            yPosition = 0; yVelocity = 0; isGrounded = true;
            player.classList.add('running');
            const rect = player.getBoundingClientRect();
            const gameRect = gameContainer.getBoundingClientRect();
            createParticles(rect.left - gameRect.left, 0);
        }
    }
    player.style.bottom = yPosition + 'px';

    score += 1;
    const currentScore = Math.floor(score / 10);
    scoreDisplay.textContent = String(currentScore).padStart(5, '0');

    const tier = Math.floor(currentScore / 300);
    if (tier !== currentBiomeTier) {
        updateBiome(currentScore);
        currentBiomeTier = tier;
    }

    if (currentScore > highScore) {
        highScore = currentScore;
        highScoreDisplay.textContent = `HI ${String(highScore).padStart(5, '0')}`;
    }

    spawnObstacleTimer++; if (spawnObstacleTimer > 130) { spawnObstacle(); spawnObstacleTimer = 0; }
    spawnCoinTimer++; if (spawnCoinTimer > 80) { spawnCoin(); spawnCoinTimer = 0; }
    spawnCloudTimer++; if (spawnCloudTimer > 300) { spawnCloud(); spawnCloudTimer = 0; }

    // ВАЖНО: На мобилках скорость движения объектов привязана к ширине экрана (vw)
    const speedModifier = window.innerWidth < 900 ? 1.5 : 4.5; // На телефоне объекты движутся чуть быстрее в пикселях

    const obstacles = document.querySelectorAll('.obstacle');
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        let currentLeft = parseFloat(obs.style.left);
        
        // Переводим vw в пиксели для расчета
        const pxLeft = (currentLeft / 100) * window.innerWidth - speedModifier;
        obs.style.left = (pxLeft / window.innerWidth) * 100 + 'vw';
        
        // Проверка столкновения
        if (checkCollision(player, obs)) {
            endGame();
            return;
        }
        if (pxLeft < -100) obs.remove();
    }

    const coinElements = document.querySelectorAll('.coin');
    coinElements.forEach(coin => {
        let currentLeft = parseFloat(coin.style.left);
        let currentBottom = parseFloat(coin.style.bottom);
        
        const pxLeft = (currentLeft / 100) * window.innerWidth - (speedModifier - 0.5);
        coin.style.left = (pxLeft / window.innerWidth) * 100 + 'vw';

        if (hasMagnet) {
            const coinRect = coin.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();
            const distX = playerRect.left - coinRect.left;
            const distY = playerRect.top - coinRect.top;
            if (distX < 250 && distX > 0 && Math.abs(distY) < 150) {
                // Притяжение
                coin.style.left = ((pxLeft + distX * 0.1) / window.innerWidth) * 100 + 'vw';
                coin.style.bottom = (currentBottom + distY * 0.1) + 'px';
            }
        }

        if (checkCollision(player, coin)) {
            coin.remove();
            coins += hasGlasses ? 2 : 1;
            coinsDisplay.textContent = `🪙 ${coins}`;
            runCoins++;
            updateQuest('coin');
        } else if (pxLeft < -50) {
            coin.remove();
        }
    });

    const clouds = document.querySelectorAll('.cloud');
    clouds.forEach(cloud => {
        let currentLeft = parseFloat(cloud.style.left);
        const pxLeft = (currentLeft / 100) * window.innerWidth - 1;
        cloud.style.left = (pxLeft / window.innerWidth) * 100 + 'vw';
        if (pxLeft < -100) cloud.remove();
    });

    animationFrameId = requestAnimationFrame(gameLoop);
}

function checkCollision(obj1, obj2) {
    const r1 = obj1.getBoundingClientRect();
    const r2 = obj2.getBoundingClientRect();
    // Уменьшаем отступ на мобилках для более точного хитбокса
    const padding = window.innerWidth < 900 ? 8 : 12;
    return !(
        r1.right - padding < r2.left + padding || 
        r1.left + padding > r2.right - padding ||
        r1.bottom - padding < r2.top + padding || 
        r1.top + padding > r2.bottom - padding
    );
}

// --- СТАРТ И ФИНАЛ ---
function startGame() {
    const playerName = (nameInput.value.trim() || 'Аноним').slice(0, 20);
    localStorage.setItem('dino_playername', playerName);

    if (lastScore > 0) sendScoreToBackend(playerName, lastScore);

    isGameRunning = true; isDucking = false;
    gameMenu.style.display = 'none'; shopContainer.style.display = 'flex';

    obstaclesContainer.innerHTML = ''; coinsContainer.innerHTML = ''; cloudsContainer.innerHTML = ''; particlesContainer.innerHTML = '';
    score = 0; yPosition = 0; yVelocity = 0; isGrounded = true;
    runJumps = 0; runCoins = 0; 
    quests.forEach(q => { q.current = 0; q.done = false; });
    renderQuests();

    player.style.bottom = '0px'; player.classList.add('running'); player.classList.remove('ducking');
    
    currentBiomeTier = 0;
    updateBiome(0);
    scoreDisplay.textContent = '00000';
    coinsDisplay.textContent = `🪙 ${coins}`;

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    gameLoop();
}

function endGame() {
    if (!isGameRunning) return;
    isGameRunning = false; cancelAnimationFrame(animationFrameId);

    localStorage.setItem('dino_highscore', String(highScore));
    lastScore = Math.floor(score / 10);

    menuTitle.textContent = 'GAME OVER'; 
    menuText.innerHTML = `Счёт: <strong>${lastScore}</strong>`;
    startBtn.textContent = 'ИГРАТЬ СНОВА';

    nameInput.style.display = 'block';
    nameInput.value = localStorage.getItem('dino_playername') || 'Игрок';
    
    savePlayerProfile(nameInput.value);
    
    shopContainer.style.display = 'none'; gameMenu.style.display = 'flex';
}

startBtn.addEventListener('click', startGame);
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); startGame(); }
});

loadOnlineLeaderboard();
const savedName = localStorage.getItem('dino_playername');
if (savedName) loadPlayerProfile(savedName);
renderQuests();
player.classList.remove('running');