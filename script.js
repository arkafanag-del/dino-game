// --- DOM ЭЛЕМЕНТЫ ---
const player = document.querySelector('.player');
const obstaclesContainer = document.getElementById('obstacles');
const cloudsContainer = document.getElementById('clouds');
const coinsContainer = document.getElementById('coins-container');
const powerupsContainer = document.getElementById('powerups-container');
const particlesContainer = document.getElementById('particles-container');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const coinsDisplay = document.getElementById('coins-display');
const gameContainer = document.querySelector('.game-container');
const shopContainer = document.querySelector('.shop-container');
const questListUI = document.getElementById('quest-list');
const muteBtn = document.getElementById('mute-btn');
const comboDisplay = document.getElementById('combo-display');
const activeBuffsUI = document.getElementById('active-buffs');
const petDrone = document.getElementById('pet-drone');

const buyGlassesBtn = document.getElementById('buy-glasses-btn');
const buyShoesBtn = document.getElementById('buy-shoes-btn');
const buyMagnetBtn = document.getElementById('buy-magnet-btn');
const buyPetBtn = document.getElementById('buy-pet-btn');

const gameMenu = document.getElementById('game-menu');
const menuTitle = document.getElementById('menu-title');
const menuText = document.getElementById('menu-text');
const startBtn = document.getElementById('start-btn');
const leaderboardList = document.getElementById('leaderboard-list');
const nameInput = document.getElementById('player-name-input');

const dailyBtn = document.getElementById('daily-btn');
const skinsBtn = document.getElementById('skins-btn');
const achievementsBtn = document.getElementById('achievements-btn');
const dailyModal = document.getElementById('daily-modal');
const skinsModal = document.getElementById('skins-modal');
const achievementsModal = document.getElementById('achievements-modal');
const dailyText = document.getElementById('daily-text');
const claimDailyBtn = document.getElementById('claim-daily-btn');
const skinsGrid = document.getElementById('skins-grid');
const achievementsList = document.getElementById('achievements-list');
const closeBtns = document.querySelectorAll('.close-modal-btn');

const mobileJumpBtn = document.getElementById('mobile-jump-btn');
const mobileDuckBtn = document.getElementById('mobile-duck-btn');

const weatherContainer = document.createElement('div');
weatherContainer.id = 'weather-container';
weatherContainer.style.cssText = 'position: absolute; inset: 0; pointer-events: none; z-index: 2; overflow: hidden;';
gameContainer.appendChild(weatherContainer);

const API_BASE = 'https://dino-game-backend-summer-tide-6155.fly.dev';

// --- ЗВУК ---
let audioCtx, isMuted = false, musicTimer = null, musicStep = 0;
function initAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.state === 'suspended') audioCtx.resume(); }
function playTone(startFreq, endFreq, duration, type) {
    if (isMuted || !audioCtx) return;
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(startFreq, audioCtx.currentTime);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, audioCtx.currentTime + duration);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + duration);
}
function playSFX(action) {
    initAudio(); if (isMuted) return;
    if (action === 'jump') playTone(150, 300, 0.15, 'square');
    if (action === 'coin') { playTone(800, 1000, 0.1, 'sine'); setTimeout(() => playTone(1200, 1500, 0.1, 'sine'), 50); }
    if (action === 'death') playTone(300, 50, 0.5, 'sawtooth');
    if (action === 'click') playTone(600, 600, 0.05, 'square');
    if (action === 'buy') { playTone(400, 600, 0.1, 'square'); setTimeout(() => playTone(600, 800, 0.1, 'square'), 100); }
    if (action === 'powerup') { playTone(600, 1200, 0.3, 'square'); setTimeout(() => playTone(1200, 1500, 0.2, 'sine'), 150); }
}
function startBiomeMusic(tier) {
    if (musicTimer) clearInterval(musicTimer); if (isMuted) return;
    musicStep = 0;
    const scales = {
        0: [130.81, 146.83, 164.81, 174.61, 196.00, 220.00],
        1: [261.63, 311.13, 349.23, 392.00, 466.16],
        2: [523.25, 659.25, 783.99, 1046.50],
        3: [65.41, 77.78, 82.41, 98.00, 103.83],
        4: [440.00, 554.37, 659.25, 880.00]
    };
    const scale = scales[tier] || scales[0];
    const tempo = tier === 3 ? 150 : (tier === 1 ? 200 : 250); 
    const playSeqNote = (freq, type, duration) => { if (!isMuted && isGameRunning) playTone(freq, freq, duration, type); };
    musicTimer = setInterval(() => {
        if (!isGameRunning || isMuted) return;
        let noteFreq = scale[musicStep % scale.length];
        if (tier === 4) { if (musicStep % 2 === 0) playSeqNote(noteFreq / 2, 'sawtooth', 0.1); playSeqNote(noteFreq * 2, 'square', 0.05); }
        else if (tier === 0) { if (musicStep % 4 === 0) playSeqNote(noteFreq, 'triangle', 0.4); }
        else if (tier === 1) { playSeqNote(noteFreq * 2, 'square', 0.1); }
        else if (tier === 2) { playSeqNote(noteFreq, 'sine', 0.5); }
        else { playSeqNote(noteFreq, 'sawtooth', 0.2); }
        musicStep++;
    }, tempo);
}

// --- СОСТОЯНИЕ ---
let score = 0, isGameRunning = false, lastScore = 0, isDucking = false;
let animationFrameId, currentBiomeTier = -1;
let coins = 0;
let hasGlasses = false, hasShoes = false, hasMagnet = false, hasPet = false;
const glassesPrice = 15, shoesPrice = 30, magnetPrice = 50, petPrice = 200;

let comboCount = 0, comboMultiplier = 1;
let hasShield = false;
let slowMoEndTime = 0;
let megaJumpEndTime = 0;
let petX = 100, petY = 100;

let stats = JSON.parse(localStorage.getItem('dino_stats')) || { jumps: 0, coins: 0, deaths: 0, highScore: 0 };

let selectedSkin = 'default';
let unlockedSkins = ['default'];
const skinList = [
    { id: 'default', icon: '🦖', name: 'Динозавр', price: 0 },
    { id: 'raptor', icon: '🦅', name: 'Раптор', price: 100 },
    { id: 'trike', icon: '🦏', name: 'Трицератопс', price: 100 }
];
let runJumps = 0, runCoins = 0;
let quests = [
    { id: 'jump', text: 'Прыгни 5 раз', target: 5, current: 0, reward: 5, done: false },
    { id: 'coin', text: 'Собери 10 монет', target: 10, current: 0, reward: 10, done: false }
];

let yPosition = 0, yVelocity = 0, isGrounded = true;
const gravity = 0.5;
let currentJumpForce = 11;
let spawnObstacleTimer = 0, spawnCoinTimer = 0, spawnPowerupTimer = 0, spawnCloudTimer = 0, spawnWeatherTimer = 0;

let highScore = parseInt(localStorage.getItem('dino_highscore'), 10) || 0;
highScoreDisplay.textContent = `HI ${String(highScore).padStart(5, '0')}`;

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// --- БЭКЕНД ---
async function loadOnlineLeaderboard() {
    try {
        const res = await fetch(`${API_BASE}/api/leaderboard`);
        const data = await res.json();
        leaderboardList.innerHTML = data.length ? '' : 'Пока никто не играл';
        data.forEach((entry, i) => {
            const row = document.createElement('div'); 
            row.style.cssText = "margin:2px 0;"; 
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
            method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: name })
        });
        const data = await res.json();
        coins = data.coins; coinsDisplay.textContent = `🪙 ${coins}`;
        selectedSkin = data.selected_skin || 'default';
        unlockedSkins = data.unlocked_skins ? data.unlocked_skins.split(',') : ['default'];
        updatePlayerSkin();
    } catch (e) { console.error(e); }
}
async function savePlayerProfile(name) {
    if (!name || name === 'Аноним') return;
    try {
        await fetch(`${API_BASE}/api/player/save`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name: name, coins: coins, quests_done: 0, selected_skin: selectedSkin, unlocked_skins: unlockedSkins.join(',') })
        });
    } catch (e) { console.error(e); }
}

// --- ЛОГИКА ---
function updatePlayerSkin() {
    player.classList.remove('skin-raptor', 'skin-trike');
    player.style.backgroundImage = ""; 
    if (selectedSkin === 'default') player.style.backgroundImage = "url('player.png')";
    else if (selectedSkin === 'raptor') player.classList.add('skin-raptor');
    else if (selectedSkin === 'trike') { player.style.backgroundImage = "url('player.png')"; player.style.filter = "brightness(2.5) hue-rotate(-90deg) drop-shadow(0 0 15px #ff2a2a)"; }
}

function renderSkins() {
    skinsGrid.innerHTML = '';
    skinList.forEach(skin => {
        const isUnlocked = unlockedSkins.includes(skin.id);
        const card = document.createElement('div'); card.className = `skin-card ${selectedSkin === skin.id ? 'active' : ''}`;
        let priceHtml = isUnlocked ? '' : `<span style="font-size:12px; color:#ffd700; margin-top:5px;">🔒 ${skin.price}</span>`;
        card.innerHTML = `<span class="skin-icon">${skin.icon}</span><span class="skin-name">${skin.name}</span>${priceHtml}`;
        card.onclick = () => {
            playSFX('click');
            if (isUnlocked) { selectedSkin = skin.id; updatePlayerSkin(); renderSkins(); savePlayerProfile(localStorage.getItem('dino_playername') || 'Игрок'); }
            else if (coins >= skin.price) { playSFX('buy'); coins -= skin.price; unlockedSkins.push(skin.id); selectedSkin = skin.id; coinsDisplay.textContent = `🪙 ${coins}`; updatePlayerSkin(); renderSkins(); savePlayerProfile(localStorage.getItem('dino_playername') || 'Игрок'); }
        };
        skinsGrid.appendChild(card);
    });
}

function renderAchievements() {
    achievementsList.innerHTML = `
        <div>${stats.jumps >= 100 ? '✅' : '⏳'} Прыгун: ${stats.jumps}/100</div>
        <div>${stats.coins >= 50 ? '✅' : '⏳'} Коллекционер: ${stats.coins}/50</div>
        <div>${stats.deaths >= 10 ? '✅' : '⏳'} Ученик: ${stats.deaths}/10</div>
        <div>${stats.highScore >= 1000 ? '✅' : '⏳'} Профи: ${stats.highScore}/1000</div>
    `;
}

function renderQuests() {
    questListUI.innerHTML = '';
    quests.forEach(q => {
        const div = document.createElement('div'); div.className = `quest-item ${q.done ? 'done' : ''}`;
        div.innerHTML = `${q.done ? '✅' : '⏳'} ${q.text} (${q.current}/${q.target})`;
        questListUI.appendChild(div);
    });
}
function updateQuest(id) {
    const q = quests.find(x => x.id === id);
    if (q && !q.done) {
        q.current++;
        if (q.current >= q.target) { playSFX('buy'); q.done = true; coins += q.reward; coinsDisplay.textContent = `🪙 ${coins}`; savePlayerProfile(localStorage.getItem('dino_playername') || 'Игрок'); }
        renderQuests();
    }
}

function updateBiome(scoreVal) {
    gameContainer.className = 'game-container'; 
    let newTier = 0;
    if (scoreVal < 300) { gameContainer.classList.add('biome-desert'); newTier = 0; }
    else if (scoreVal < 600) { gameContainer.classList.add('biome-jungle'); newTier = 1; }
    else if (scoreVal < 1000) { gameContainer.classList.add('biome-ice'); newTier = 2; }
    else if (scoreVal < 1500) { gameContainer.classList.add('biome-volcano'); newTier = 3; }
    else { gameContainer.classList.add('biome-cyber'); newTier = 4; }
    if (isGameRunning && newTier !== currentBiomeTier) startBiomeMusic(newTier);
    currentBiomeTier = newTier;
}

// --- СПАВН ---
function spawnWeather() {
    const p = document.createElement('div'); p.classList.add('weather-particle');
    const currentScore = Math.floor(score / 10);
    if (currentScore < 300) { p.classList.add('weather-sand'); p.style.left = gameContainer.offsetWidth + 'px'; p.style.top = Math.random() * gameContainer.offsetHeight + 'px'; p.vx = -10; p.vy = Math.random() * 2 - 1; }
    else if (currentScore < 600) { p.classList.add('weather-leaf'); p.style.left = Math.random() * gameContainer.offsetWidth + 'px'; p.style.top = '-20px'; p.vx = -2; p.vy = Math.random() * 1 + 1; }
    else if (currentScore < 1000) { p.classList.add('weather-snow'); p.style.left = Math.random() * gameContainer.offsetWidth + 'px'; p.style.top = '-20px'; p.vx = -2; p.vy = Math.random() * 1.5 + 0.5; }
    else if (currentScore < 1500) { p.classList.add('weather-spark'); p.style.left = Math.random() * gameContainer.offsetWidth + 'px'; p.style.top = gameContainer.offsetHeight + 'px'; p.vx = -2; p.vy = -(Math.random() * 2 + 1); }
    else { p.classList.add('weather-matrix'); p.style.left = Math.random() * gameContainer.offsetWidth + 'px'; p.style.top = '-20px'; p.vx = 0; p.vy = Math.random() * 5 + 5; }
    weatherContainer.appendChild(p);
}

function spawnCloud() {
    const cloud = document.createElement('div'); cloud.classList.add('cloud');
    cloud.style.width = Math.random() * 40 + 40 + 'px';
    cloud.style.height = (parseFloat(cloud.style.width) / 3) + 'px';
    cloud.style.top = Math.random() * 100 + 20 + 'px';
    cloud.style.left = gameContainer.offsetWidth + 'px';
    cloud.onclick = () => { playSFX('click'); cloud.style.transform = 'scale(1.5)'; cloud.style.opacity = '0'; setTimeout(() => cloud.remove(), 200); };
    cloudsContainer.appendChild(cloud);
}

function spawnObstacle() {
    const existingObstacles = document.querySelectorAll('.obstacle');
    const minDistance = window.innerWidth < 900 ? 350 : 500; 

    for (let obs of existingObstacles) { 
        let obsLeft = parseFloat(obs.style.left);
        if (isNaN(obsLeft)) obsLeft = gameContainer.offsetWidth;
        if (obsLeft > gameContainer.offsetWidth - minDistance) return false; 
    }

    const obstacle = document.createElement('div'); 
    obstacle.classList.add('obstacle');
    
    const wantsToBeFlying = Math.random() < 0.2;
    let isFlying = false;

    if (wantsToBeFlying) {
        let cactusNearby = false;
        for (let obs of existingObstacles) {
            if (!obs.classList.contains('flying')) {
                let obsLeft = parseFloat(obs.style.left);
                if (obsLeft > gameContainer.offsetWidth - 400) cactusNearby = true;
            }
        }
        if (!cactusNearby) isFlying = true;
    } else {
        let birdNearby = false;
        for (let obs of existingObstacles) {
            if (obs.classList.contains('flying')) {
                let obsLeft = parseFloat(obs.style.left);
                if (obsLeft > gameContainer.offsetWidth - 400) birdNearby = true;
            }
        }
        if (birdNearby) isFlying = true; 
    }

    if (isFlying) { 
        obstacle.classList.add('flying'); 
    } else { 
        obstacle.style.height = Math.floor(Math.random() * 30) + 50 + 'px'; 
        obstacle.style.width = Math.random() > 0.6 ? '55px' : '35px'; 
    }
    
    obstacle.style.left = gameContainer.offsetWidth + 'px'; 
    obstaclesContainer.appendChild(obstacle);
    return true; 
}

function spawnCoin() {
    const coin = document.createElement('div'); coin.classList.add('coin');
    coin.style.bottom = Math.floor(Math.random() * 110) + 40 + 'px'; 
    coin.style.left = gameContainer.offsetWidth + 'px'; 
    coinsContainer.appendChild(coin);
}

function spawnPowerup() {
    const types = ['shield', 'slowmo', 'megajump'];
    const type = types[Math.floor(Math.random() * types.length)];
    const p = document.createElement('div'); p.classList.add('powerup', type);
    p.innerHTML = type === 'shield' ? '🛡️' : (type === 'slowmo' ? '⏳' : '🚀');
    p.style.bottom = Math.floor(Math.random() * 100) + 50 + 'px';
    p.style.left = gameContainer.offsetWidth + 'px';
    p.dataset.type = type;
    powerupsContainer.appendChild(p);
}

function createParticles(x, y, color = '#00ff88') {
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div'); particle.classList.add('particle');
        particle.style.backgroundColor = color;
        const size = Math.random() * 8 + 4;
        particle.style.width = size + 'px'; particle.style.height = size + 'px';
        particle.style.left = (x + 10 + Math.random() * 20) + 'px'; particle.style.bottom = (y + Math.random() * 10) + 'px';
        particlesContainer.appendChild(particle); setTimeout(() => particle.remove(), 600);
    }
}

// --- УПРАВЛЕНИЕ ---
function doJump() {
    if (isGrounded && isGameRunning && !isDucking) {
        playSFX('jump'); 
        // ИСПРАВЛЕНО: Проверка на Мега-Прыжок
        if (Date.now() < megaJumpEndTime) {
            yVelocity = 18; // Сила мега-прыжка
        } else {
            yVelocity = currentJumpForce;
        }
        isGrounded = false;
        player.classList.remove('running');
        const rect = player.getBoundingClientRect(); const gameRect = gameContainer.getBoundingClientRect();
        createParticles(rect.left - gameRect.left, 0);
        runJumps++; stats.jumps++; localStorage.setItem('dino_stats', JSON.stringify(stats));
        updateQuest('jump');
    }
}

let dinoClickCount = 0;
player.onclick = () => {
    dinoClickCount++;
    if (dinoClickCount >= 3) {
        playSFX('powerup');
        const rect = player.getBoundingClientRect(); const gameRect = gameContainer.getBoundingClientRect();
        createParticles(rect.left - gameRect.left + 40, 20, '#ff2a2a');
        dinoClickCount = 0;
    }
    setTimeout(() => dinoClickCount = 0, 1000);
};

function startDucking() { if (isGameRunning && !isDucking) { isDucking = true; player.classList.add('ducking'); if (!isGrounded) yVelocity = -12; } }
function endDucking() { isDucking = false; player.classList.remove('ducking'); }

function handleKeyDown(event) {
    if (event.target.tagName === 'INPUT') return;
    if (event.code === 'Space' || event.key === 'ArrowUp') { event.preventDefault(); if (!isGameRunning) startGame(); else doJump(); }
    if (event.key === 'ArrowDown') { event.preventDefault(); startDucking(); }
}
function handleKeyUp(event) { if (event.key === 'ArrowDown') endDucking(); }

mobileJumpBtn.addEventListener('touchstart', (e) => { e.preventDefault(); if (!isGameRunning) startGame(); else doJump(); });
mobileDuckBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startDucking(); });
mobileDuckBtn.addEventListener('touchend', (e) => { e.preventDefault(); endDucking(); });

// --- UI ---
muteBtn.onclick = () => { isMuted = !isMuted; muteBtn.textContent = isMuted ? '🔇' : '🔊'; if (isMuted && musicTimer) clearInterval(musicTimer); else if (isGameRunning) startBiomeMusic(currentBiomeTier); };
dailyBtn.onclick = () => { playSFX('click'); dailyModal.style.display = 'block'; claimDailyBtn.style.display = 'block'; dailyText.innerHTML = "Заходи каждый день, чтобы получать больше монет!"; };
skinsBtn.onclick = () => { playSFX('click'); renderSkins(); skinsModal.style.display = 'block'; };
achievementsBtn.onclick = () => { playSFX('click'); renderAchievements(); achievementsModal.style.display = 'block'; };
closeBtns.forEach(btn => btn.onclick = () => { playSFX('click'); dailyModal.style.display = 'none'; skinsModal.style.display = 'none'; achievementsModal.style.display = 'none'; });

claimDailyBtn.onclick = async () => {
    const name = localStorage.getItem('dino_playername') || 'Игрок';
    try {
        const res = await fetch(`${API_BASE}/api/player/daily`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: name }) });
        const data = await res.json();
        if (data.status === 'success') { playSFX('buy'); coins += data.reward; coinsDisplay.textContent = `🪙 ${coins}`; dailyText.innerHTML = `🎉 Вы получили <strong>${data.reward}</strong> монет!<br>Стрик: ${data.streak}`; claimDailyBtn.style.display = 'none'; savePlayerProfile(name); }
        else if (data.status === 'already_claimed') { dailyText.innerHTML = `Вы уже забрали награду сегодня!<br>Возвращайтесь завтра.`; claimDailyBtn.style.display = 'none'; }
    } catch (e) { dailyText.innerHTML = "Ошибка соединения"; }
};

buyGlassesBtn.onclick = () => { if (coins >= glassesPrice && !hasGlasses) { playSFX('buy'); coins -= glassesPrice; hasGlasses = true; coinsDisplay.textContent = `🪙 ${coins}`; buyGlassesBtn.disabled = true; buyGlassesBtn.querySelector('.price').textContent = "КУПЛЕНО"; savePlayerProfile(localStorage.getItem('dino_playername') || 'Игрок'); } };
buyShoesBtn.onclick = () => { if (coins >= shoesPrice && !hasShoes) { playSFX('buy'); coins -= shoesPrice; hasShoes = true; currentJumpForce = 14; coinsDisplay.textContent = `🪙 ${coins}`; buyShoesBtn.disabled = true; buyShoesBtn.querySelector('.price').textContent = "КУПЛЕНО"; savePlayerProfile(localStorage.getItem('dino_playername') || 'Игрок'); } };
buyMagnetBtn.onclick = () => { if (coins >= magnetPrice && !hasMagnet) { playSFX('buy'); coins -= magnetPrice; hasMagnet = true; coinsDisplay.textContent = `🪙 ${coins}`; buyMagnetBtn.disabled = true; buyMagnetBtn.querySelector('.price').textContent = "КУПЛЕНО"; savePlayerProfile(localStorage.getItem('dino_playername') || 'Игрок'); } };
buyPetBtn.onclick = () => { if (coins >= petPrice && !hasPet) { playSFX('buy'); coins -= petPrice; hasPet = true; coinsDisplay.textContent = `🪙 ${coins}`; buyPetBtn.disabled = true; buyPetBtn.querySelector('.price').textContent = "КУПЛЕНО"; petDrone.style.display = 'block'; savePlayerProfile(localStorage.getItem('dino_playername') || 'Игрок'); } };

// --- ИГРОВОЙ ЦИКЛ ---
function gameLoop() {
    if (!isGameRunning) return;

    const now = Date.now();
    let gameSpeedMultiplier = 1;

    if (now < slowMoEndTime) gameSpeedMultiplier = 0.4;

    if (!isGrounded) {
        yVelocity -= gravity; yPosition += yVelocity;
        if (yPosition <= 0) { yPosition = 0; yVelocity = 0; isGrounded = true; player.classList.add('running'); createParticles(player.getBoundingClientRect().left - gameContainer.getBoundingClientRect().left, 0); }
    }
    player.style.bottom = yPosition + 'px';

    if (hasPet) {
        const playerRect = player.getBoundingClientRect();
        const gameRect = gameContainer.getBoundingClientRect();
        let targetX = (playerRect.left - gameRect.left) + 30;
        let targetY = yPosition + 80;
        petX += (targetX - petX) * 0.1;
        petY += (targetY - petY) * 0.1;
        petDrone.style.left = petX + 'px';
        petDrone.style.bottom = petY + 'px';
    }

    score += 1; const currentScore = Math.floor(score / 10);
    scoreDisplay.textContent = String(currentScore).padStart(5, '0');
    const tier = Math.floor(currentScore / 300);
    if (tier !== currentBiomeTier) updateBiome(currentScore);

    if (currentScore > highScore) { highScore = currentScore; highScoreDisplay.textContent = `HI ${String(highScore).padStart(5, '0')}`; }

    const baseSpeed = window.innerWidth < 900 ? 3 : 4.5;
    const currentSpeed = (baseSpeed + (currentBiomeTier * 0.75)) * gameSpeedMultiplier;

    spawnObstacleTimer++; 
    const baseSpawnRate = Math.max(80, 180 - currentBiomeTier * 25);
    
    const currentObstaclesCount = document.querySelectorAll('.obstacle').length;
    
    if (currentObstaclesCount < 2 && spawnObstacleTimer > baseSpawnRate + Math.random() * 40) { 
        if (spawnObstacle()) {
            spawnObstacleTimer = 0; 
        }
    }
    
    spawnCoinTimer++; if (spawnCoinTimer > 250) { spawnCoin(); spawnCoinTimer = 0; }
    spawnPowerupTimer++; if (spawnPowerupTimer > 800) { spawnPowerup(); spawnPowerupTimer = 0; }
    spawnCloudTimer++; if (spawnCloudTimer > 300) { spawnCloud(); spawnCloudTimer = 0; }
    spawnWeatherTimer++; if (spawnWeatherTimer > 10) { spawnWeather(); spawnWeatherTimer = 0; }

    const obstacles = document.querySelectorAll('.obstacle');
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i]; let currentLeft = parseFloat(obs.style.left) || gameContainer.offsetWidth;
        currentLeft -= currentSpeed; obs.style.left = currentLeft + 'px';
        if (checkCollision(player, obs)) { 
            if (hasShield) { hasShield = false; obs.remove(); playSFX('death'); gameContainer.classList.add('shake'); setTimeout(()=>gameContainer.classList.remove('shake'), 300); continue; } 
            else { endGame(); return; }
        }
        if (currentLeft < -150) obs.remove();
    }

    const pElements = document.querySelectorAll('.powerup');
    pElements.forEach(p => {
        let currentLeft = parseFloat(p.style.left) || gameContainer.offsetWidth;
        currentLeft -= currentSpeed; p.style.left = currentLeft + 'px';
        const r1 = player.getBoundingClientRect(); const r2 = p.getBoundingClientRect();
        if (!(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom)) {
            playSFX('powerup'); 
            if (p.dataset.type === 'shield') { hasShield = true; }
            else if (p.dataset.type === 'slowmo') { slowMoEndTime = now + 5000; }
            else if (p.dataset.type === 'megajump') { megaJumpEndTime = now + 5000; }
            p.remove();
        } else if (currentLeft < -50) p.remove();
    });
    
    // ИСПРАВЛЕНО: Красивый вывод активных баффов
    let currentBuffsHTML = '';
    if (hasShield) currentBuffsHTML += '🛡️ ';
    if (now < slowMoEndTime) currentBuffsHTML += '⏳ ';
    if (now < megaJumpEndTime) currentBuffsHTML += '🚀';
    activeBuffsUI.innerHTML = currentBuffsHTML;

    const coinElements = document.querySelectorAll('.coin');
    coinElements.forEach(coin => {
        let currentLeft = parseFloat(coin.style.left) || gameContainer.offsetWidth;
        let currentBottom = parseFloat(coin.style.bottom) || 40;
        currentLeft -= currentSpeed;

        let pullRadius = 200;
        if (hasPet) pullRadius = 350;
        
        if (hasMagnet || hasPet) {
            const coinRect = coin.getBoundingClientRect(); const playerRect = player.getBoundingClientRect();
            const px = playerRect.left + playerRect.width / 2; const py = playerRect.top + playerRect.height / 2;
            const cx = coinRect.left + coinRect.width / 2; const cy = coinRect.top + coinRect.height / 2;
            const dx = px - cx; const dy = py - cy; const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < pullRadius) { currentLeft += dx * 0.15; currentBottom -= dy * 0.15; }
        }

        coin.style.left = currentLeft + 'px'; coin.style.bottom = currentBottom + 'px';

        const r1 = player.getBoundingClientRect(); const r2 = coin.getBoundingClientRect();
        const hit = !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);

        if (hit) {
            playSFX('coin'); coin.remove();
            comboCount++;
            if (comboCount >= 5) { comboMultiplier = 2; comboDisplay.style.display = 'block'; comboDisplay.textContent = 'COMBO x2!'; }
            if (comboCount >= 10) { comboMultiplier = 3; comboDisplay.textContent = 'COMBO x3!'; }
            
            coins += (hasGlasses ? 2 : 1) * comboMultiplier;
            coinsDisplay.textContent = `🪙 ${coins}`;
            
            runCoins++; stats.coins++; localStorage.setItem('dino_stats', JSON.stringify(stats));
            updateQuest('coin');
            
            clearTimeout(window.comboTimeout);
            window.comboTimeout = setTimeout(() => { comboCount = 0; comboMultiplier = 1; comboDisplay.style.display = 'none'; }, 3000);
        } else if (currentLeft < -50) coin.remove();
    });

    const clouds = document.querySelectorAll('.cloud');
    clouds.forEach(cloud => { let currentLeft = parseFloat(cloud.style.left) || gameContainer.offsetWidth; currentLeft -= 1.5; cloud.style.left = currentLeft + 'px'; if (currentLeft < -100) cloud.remove(); });
    const weatherParticles = document.querySelectorAll('.weather-particle');
    weatherParticles.forEach(p => { let left = parseFloat(p.style.left) || 0; let top = parseFloat(p.style.top) || 0; if (!p.vx) p.vx = -5; if (!p.vy) p.vy = 2; left += p.vx * gameSpeedMultiplier; top += p.vy * gameSpeedMultiplier; p.style.left = left + 'px'; p.style.top = top + 'px'; if (left < -50 || top > gameContainer.offsetHeight + 50 || top < -50) p.remove(); });

    animationFrameId = requestAnimationFrame(gameLoop);
}

function checkCollision(obj1, obj2) {
    const r1 = obj1.getBoundingClientRect(); const r2 = obj2.getBoundingClientRect();
    const padding = window.innerWidth < 900 ? 8 : 12; 
    return !(r1.right - padding < r2.left + padding || r1.left + padding > r2.right - padding || r1.bottom - padding < r2.top + padding || r1.top + padding > r2.bottom - padding);
}

function startGame() {
    initAudio(); playSFX('click');
    const playerName = (nameInput.value.trim() || 'Аноним').slice(0, 20);
    localStorage.setItem('dino_playername', playerName);
    if (lastScore > 0) sendScoreToBackend(playerName, lastScore);

    isGameRunning = true; isDucking = false;
    gameMenu.style.display = 'none'; shopContainer.style.display = 'flex';
    obstaclesContainer.innerHTML = ''; coinsContainer.innerHTML = ''; cloudsContainer.innerHTML = ''; particlesContainer.innerHTML = ''; weatherContainer.innerHTML = ''; powerupsContainer.innerHTML = '';
    
    comboCount = 0; comboMultiplier = 1; comboDisplay.style.display = 'none';
    hasShield = false; slowMoEndTime = 0; megaJumpEndTime = 0; activeBuffsUI.innerHTML = '';
    
    score = 0; yPosition = 0; yVelocity = 0; isGrounded = true;
    runJumps = 0; runCoins = 0; 
    quests.forEach(q => { q.current = 0; q.done = false; }); renderQuests();
    player.style.bottom = '0px'; player.classList.add('running'); player.classList.remove('ducking');
    currentBiomeTier = 0; updateBiome(0); startBiomeMusic(0);
    
    if (hasPet) { petDrone.style.display = 'block'; petX = 100; petY = 100; }
    else petDrone.style.display = 'none';

    scoreDisplay.textContent = '00000'; coinsDisplay.textContent = `🪙 ${coins}`;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    gameLoop();
}

function endGame() {
    if (!isGameRunning) return;
    isGameRunning = false; cancelAnimationFrame(animationFrameId); if (musicTimer) clearInterval(musicTimer);
    playSFX('death'); gameContainer.classList.add('shake'); setTimeout(() => gameContainer.classList.remove('shake'), 400);

    localStorage.setItem('dino_highscore', String(highScore));
    lastScore = Math.floor(score / 10);
    menuTitle.textContent = 'GAME OVER'; 
    menuText.innerHTML = `Счёт: <strong>${lastScore}</strong><br>Комбо: <strong>x${comboMultiplier}</strong>`;
    startBtn.textContent = 'ИГРАТЬ СНОВА';
    
    stats.deaths++; 
    if (lastScore > stats.highScore) stats.highScore = lastScore;
    localStorage.setItem('dino_stats', JSON.stringify(stats));

    nameInput.style.display = 'block';
    nameInput.value = localStorage.getItem('dino_playername') || 'Игрок';
    savePlayerProfile(nameInput.value);
    shopContainer.style.display = 'none'; gameMenu.style.display = 'flex';
}

function activateAdminMode() {
    playSFX('buy'); coins += 99999; coinsDisplay.textContent = `🪙 ${coins}`;
    savePlayerProfile(localStorage.getItem('dino_playername') || 'Игрок');
    alert('🛠️ АДМИН-РЕЖИМ АКТИВИРОВАН!');
}

window.addEventListener('keydown', (e) => { if (e.ctrlKey && e.shiftKey && e.code === 'KeyA') { e.preventDefault(); activateAdminMode(); } });
let titleClickCount = 0; let titleClickTimer;
menuTitle.addEventListener('click', () => { titleClickCount++; clearTimeout(titleClickTimer); titleClickTimer = setTimeout(() => { titleClickCount = 0; }, 1000); if (titleClickCount >= 5) { activateAdminMode(); titleClickCount = 0; } });

startBtn.addEventListener('click', startGame);
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); startGame(); } });

loadOnlineLeaderboard();
const savedName = localStorage.getItem('dino_playername'); if (savedName) loadPlayerProfile(savedName);
renderQuests(); player.classList.remove('running');