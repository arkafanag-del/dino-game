// --- DOM ---
const player = document.querySelector('.player');
const obstaclesContainer = document.getElementById('obstacles');
const coinsContainer = document.getElementById('coins-container');
const bossContainer = document.getElementById('boss-container');
const powerupsContainer = document.getElementById('powerups-container');
const cloudsContainer = document.getElementById('clouds');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const coinsDisplay = document.getElementById('coins-display');
const dnaDisplay = document.getElementById('dna-display');
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
const gameMenu = document.getElementById('game-menu');
const menuTitle = document.getElementById('menu-title');
const menuText = document.getElementById('menu-text');
const startBtn = document.getElementById('start-btn');
const startBiomeSelect = document.getElementById('start-biome-select');
const skillModal = document.getElementById('skill-modal');
const skinsModal = document.getElementById('skins-modal');
const dailyChallengeBtn = document.getElementById('daily-challenge-btn');
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

// Сюжетка DOM
const storyModal = document.getElementById('story-modal');
const storyTitle = document.getElementById('story-title');
const storyText = document.getElementById('story-text');
const storyNextBtn = document.getElementById('story-next-btn');

const API_BASE = 'https://dino-game-backend-summer-tide-6155.fly.dev';

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

function showStory(tier) {
  if (tier >= storyData.length) tier = storyData.length - 1;
  pendingStoryTier = tier;
  storyTitle.innerHTML = storyData[tier].title;
  storyText.innerHTML = storyData[tier].text;
  storyModal.style.display = 'block';
  isGameRunning = false;
  bgMusic.pause();
}

storyNextBtn.onclick = () => {
  playSFX('click');
  storyModal.style.display = 'none';
  if (pendingStoryTier >= storyData.length - 1) endGame();
  else startNextBiome(pendingStoryTier);
};

function startNextBiome(tier) {
  currentBiomeTier = tier;
  nextBossScore = (currentBiomeTier + 1) * 300;
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
  invincibleUntil = Date.now() + 2000;

  playBiomeMusic(currentBiomeTier);
  isGameRunning = true;
  gameLoop();
}

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
let playerName = localStorage.getItem('dino_player_name') || '';
let pendingScore = null;

let comboCount = 0, comboTimer = 0, comboMultiplier = 1;
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

// БОСС
let isBossActive=false;
let bossHP=0, maxBossHP=3;
let bossTime=0, bossShootTimer=0;
let bossElement=null;
let bX = 0, bY = 0;
let nextBossScore=300;

// ПИТОМЦЫ
let petX=100, petY=100, dogX=50, dogY=0;
let droneShootTimer=0;

// ФИЗИКА И HP
let currentHP=1, maxHP=1;
let invincibleUntil=0;
let yPosition=0, yVelocity=0, isGrounded=true;
let jumpCount=0;
let spawnObstacleTimer=0, spawnCoinTimer=0, spawnPowerupTimer=0;
let nextEventTime=0, currentEvent=null, lastEventType=null;

// МАССИВЫ СУЩНОСТЕЙ
let obstacleEntities = [];
let coinEntities = [];
let powerupsOnScreen = [];
let meteorEntities = [];
let bossProjectileEntities = [];
let droneProjectileEntities = [];

// ХИТБОКС ИГРОКА
const HITBOX_X = 65; // Центр игрока
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

// --- КОЛЛИЗИЯ ---
function checkAABB(x1, y1, w1, h1, x2, y2, w2, h2) {
  const pad = window.innerWidth < 900 ? 3 : 6; 
  return !(x1 + pad > x2 + w2 - pad || x1 + w1 - pad < x2 + pad || y1 + pad > y2 + h2 - pad || y1 + h1 - pad < y2 + pad);
}

function clearEntities() {
  obstacleEntities.forEach(e => e.el.remove()); obstacleEntities = [];
  coinEntities.forEach(e => e.el.remove()); coinEntities = [];
  powerupsOnScreen.forEach(e => e.el.remove()); powerupsOnScreen = [];
  meteorEntities.forEach(e => e.el.remove()); meteorEntities = [];
  bossProjectileEntities.forEach(e => e.el.remove()); bossProjectileEntities = [];
  droneProjectileEntities.forEach(e => e.el.remove()); droneProjectileEntities = [];
}

// --- УВЕДОМЛЕНИЯ ---
function showToast(msg, isBoss=false){
  const t=document.createElement('div');
  t.innerHTML=msg;
  t.style.cssText=`position:absolute;top:20%;left:50%;transform:translate(-50%,0);background:rgba(10,10,20,0.95);border:2px solid ${isBoss?'#ff00ff':'#ffd700'};border-radius:10px;padding:15px 25px;color:${isBoss?'#ff00ff':'#ffd700'};font-family:'Share Tech Mono';font-size:16px;font-weight:bold;text-align:center;z-index:1000;box-shadow:0 0 30px ${isBoss?'rgba(255,0,255,0.5)':'rgba(255,215,0,0.5)'};transition:opacity 0.5s,transform 0.5s;pointer-events:none;white-space:pre-wrap;`;
  gameContainer.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transform='translate(-50%,-20px)';}, 2000);
  setTimeout(()=>t.remove(), 2500);
}

// --- БЭКЕНД ---
async function loadLeaderboard(){
  try{
    const r=await fetch(`${API_BASE}/api/leaderboard`); const d=await r.json();
    leaderboardList.innerHTML=d.length?'':'Пока никто не играл';
    d.slice(0,5).forEach((e,i)=>{ const row=document.createElement('div'); row.style.cssText='margin:3px 0;'; row.innerHTML=`${i+1}. <span style="color:#fff">${e.name}</span> — <span style="color:#00ff88;font-weight:bold">${e.score}</span>`; leaderboardList.appendChild(row); });
  } catch { leaderboardList.innerHTML='<span style="color:#ff2a2a">Сервер недоступен ❌</span>'; }
}
async function sendScore(name, sc){
  try{ await fetch(`${API_BASE}/api/score`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,score:sc})}); loadLeaderboard(); }catch(e){console.error(e);}
}
async function loadProfileFromServer(){
  if (!playerName) return;
  try {
    const r = await fetch(`${API_BASE}/api/player/load`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name: playerName}) });
    const d = await r.json();
    if (d.coins > coins) { coins = d.coins; localStorage.setItem('dino_coins', coins); }
    if (d.selected_skin && d.selected_skin !== 'trike') { selectedSkin = d.selected_skin; localStorage.setItem('dino_selected_skin', selectedSkin); }
    if (d.unlocked_skins) {
      try {
        const arr = JSON.parse(d.unlocked_skins);
        if (Array.isArray(arr)) { arr.forEach(s => { if (!unlockedSkins.includes(s) && s !== 'trike') unlockedSkins.push(s); }); localStorage.setItem('dino_unlocked_skins', JSON.stringify(unlockedSkins)); }
      } catch {}
    }
    updateShopUI(); renderSkins(); updatePlayerSkin();
  } catch(e) { console.error('Profile load failed', e); }
}
async function saveProfileToServer(){
  if (!playerName) return;
  try {
    await fetch(`${API_BASE}/api/player/save`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: playerName, coins: coins, quests_done: quests.filter(q=>q.done).length, selected_skin: selectedSkin, unlocked_skins: JSON.stringify(unlockedSkins) }) });
  } catch(e) { console.error('Profile save failed', e); }
}
async function claimDailyReward(){
  if (!playerName) { showToast('⚠️ Сначала сохраните имя рекорда'); return; }
  try {
    const r = await fetch(`${API_BASE}/api/player/daily`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name: playerName}) });
    const d = await r.json();
    if (d.status === 'already_claimed') { showToast(`🔥 Награда уже получена сегодня\nСерия: ${d.streak} 🔥`); }
    else if (d.status === 'success') { coins = d.coins; localStorage.setItem('dino_coins', coins); coinsDisplay.textContent = `🪙 ${coins}`; updateShopUI(); playSFX('buy'); showToast(`🔥 ЕЖЕДНЕВНАЯ НАГРАДА!\n+${d.reward} 🪙\nСерия: ${d.streak} 🔥`); }
  } catch(e) { showToast('❌ Сервер недоступен'); }
}

// --- ИМЯ ИГРОКА ---
function updateNameUI(){
  if (playerName) { playerNameInput.style.display = 'none'; saveRecordBtn.style.display = 'none'; }
  else {
    playerNameInput.style.display = 'block';
    saveRecordBtn.style.display = (pendingScore !== null) ? 'inline-block' : 'none';
    if (pendingScore !== null) playerNameInput.placeholder = `Ваш счёт: ${pendingScore}. Введите имя!`;
  }
}
saveRecordBtn.onclick = () => {
  const v = playerNameInput.value.trim().slice(0,20);
  if (!v) { showToast('⚠️ Введите имя!'); return; }
  playerName = v; localStorage.setItem('dino_player_name', playerName);
  playerNameInput.value = ''; playerNameInput.style.display = 'none'; saveRecordBtn.style.display = 'none';
  playSFX('buy'); showToast(`✅ Имя сохранено: ${playerName}`);
  if (pendingScore !== null) { sendScore(playerName, pendingScore); pendingScore = null; }
  loadProfileFromServer();
};

// --- КЛАССЫ ---
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
function renderSkins(){
  skinsGrid.innerHTML='';
  skinList.forEach(skin=>{
    const isUnlocked = unlockedSkins.includes(skin.id);
    const card=document.createElement('div'); card.className=`skin-card ${selectedSkin===skin.id?'active':''}`;
    let priceHtml = isUnlocked ? '' : `<span style="font-size:11px;color:#ffd700;margin-top:5px;">🔒 ${skin.price}</span>`;
    card.innerHTML=`<span class="skin-icon">${skin.icon}</span><span class="skin-name">${skin.name}</span><small style="font-size:9px;color:#888;margin-top:3px">${skin.desc}</small>${priceHtml}`;
    card.onclick=()=>{
      playSFX('click');
      if (isUnlocked){ selectedSkin=skin.id; updatePlayerSkin(); renderSkins(); localStorage.setItem('dino_selected_skin', selectedSkin); saveProfileToServer(); }
      else if (coins>=skin.price){ playSFX('buy'); coins-=skin.price; unlockedSkins.push(skin.id); selectedSkin=skin.id; coinsDisplay.textContent=`🪙 ${coins}`; updatePlayerSkin(); renderSkins(); localStorage.setItem('dino_coins', coins); localStorage.setItem('dino_unlocked_skins', JSON.stringify(unlockedSkins)); localStorage.setItem('dino_selected_skin', selectedSkin); saveProfileToServer(); }
    };
    skinsGrid.appendChild(card);
  });
}

// --- ДЕРЕВО НАВЫКОВ ---
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

// --- МАГАЗИН ---
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
  btn.onclick = ()=>{
    let has = localStorage.getItem('dino_'+key)==='true'; let active = has && localStorage.getItem('dino_'+key+'_active')!=='false';
    if (!has){ if (coins>=price){ coins-=price; localStorage.setItem('dino_coins',coins); localStorage.setItem('dino_'+key,'true'); localStorage.setItem('dino_'+key+'_active','true'); playSFX('buy'); saveProfileToServer(); } }
    else { active=!active; localStorage.setItem('dino_'+key+'_active',active); playSFX('click'); }
    if(key==='glasses'){hasGlasses=has||true;activeGlasses=active;} if(key==='shoes'){hasShoes=has||true;activeShoes=active;}
    if(key==='magnet'){hasMagnet=has||true;activeMagnet=active;} if(key==='pet'){hasPet=has||true;activePet=active;} if(key==='dog'){hasDog=has||true;activeDog=active;}
    updateShopUI();
  };
}
setupShopBtn(buyGlassesBtn,'glasses',15); setupShopBtn(buyShoesBtn,'shoes',30); setupShopBtn(buyMagnetBtn,'magnet',50); setupShopBtn(buyPetBtn,'pet',200); setupShopBtn(buyDogBtn,'dog',300);
closeBtns.forEach(b=>b.onclick=()=>{ playSFX('click'); skillModal.style.display='none'; skinsModal.style.display='none'; });
skinsBtn.onclick=()=>{ playSFX('click'); renderSkins(); skinsModal.style.display='block'; };
dailyChallengeBtn.onclick=()=>{ playSFX('click'); claimDailyReward(); };

// --- СОБАЧКА ---
function updateDog(){
  if (!activeDog) return;
  petDog.style.display = 'block';
  dogX += (100 - dogX) * 0.05; dogY += (10 - dogY) * 0.1;
  petDog.style.left = dogX + 'px'; petDog.style.bottom = dogY + 'px';
  
  for (let i = coinEntities.length - 1; i >= 0; i--) {
    let c = coinEntities[i];
    if (checkAABB(dogX, dogY, 30, 30, c.x, c.y, c.w, c.h)) {
      c.el.remove(); coinEntities.splice(i, 1);
      playSFX('coin'); addCombo();
      let reward = Math.round((activeGlasses?2:1) * (skill_l_coin?2:1) * comboMultiplier);
      coins += reward; coinsDisplay.textContent = `🪙 ${coins}`;
      const q = quests.find(x=>x.id==='coin'); if(q&&!q.done){q.current++; updateQuestProgress('coin'); checkQuestComplete('coin');}
    }
  }
}

// --- СОБЫТИЯ ---
function triggerRandomEvent(){
  if (currentEvent) return;
  const rand = Math.random();
  let type = rand > 0.7 ? 'goldrush' : (rand > 0.4 ? 'frenzy' : 'meteor');
  if (type === lastEventType) { const other = ['meteor', 'goldrush', 'frenzy'].filter(e => e !== type); type = other[Math.floor(Math.random() * other.length)]; }
  lastEventType = type; currentEvent = type;
  
  if (type==='meteor'){
    eventBanner.textContent = '☄️ МЕТЕОРИТНЫЙ ДОЖДЬ!'; eventBanner.style.color = '#ff8c00'; eventBanner.style.display = 'block';
    let meteorCount = 0;
    const meteorInterval = setInterval(() => {
      if (!isGameRunning || meteorCount >= 15) { clearInterval(meteorInterval); return; }
      let m = document.createElement('div'); m.className = 'meteor';
      let mx = Math.random()*(gameContainer.offsetWidth-30); let my = gameContainer.offsetHeight;
      m.style.width='25px'; m.style.height='25px'; m.style.left = mx+'px'; m.style.bottom = my+'px';
      obstaclesContainer.appendChild(m);
      meteorEntities.push({ el: m, x: mx, y: my, w: 25, h: 25 });
      meteorCount++;
    }, 200);
    setTimeout(()=>{ currentEvent=null; eventBanner.style.display='none'; nextEventTime = Date.now() + (skill_l_event ? 30000 : 60000); }, 5000);
  } else if (type==='goldrush'){
    eventBanner.textContent = '🪙 ЗОЛОТАЯ ЛИХОРАДКА!'; eventBanner.style.color = '#ffd700'; eventBanner.style.display = 'block';
    for(let i=0;i<15;i++){ setTimeout(()=>{ if (!isGameRunning) return; spawnCoin(); }, i*150); }
    setTimeout(()=>{ currentEvent=null; eventBanner.style.display='none'; nextEventTime = Date.now() + (skill_l_event ? 30000 : 60000); }, 4000);
  } else {
    eventBanner.textContent = '⚡ БЕЗУМНАЯ СКОРОСТЬ!'; eventBanner.style.color = '#ff00ff'; eventBanner.style.display = 'block';
    setTimeout(()=>{ currentEvent=null; eventBanner.style.display='none'; nextEventTime = Date.now() + (skill_l_event ? 30000 : 60000); }, 5000);
  }
}

// --- HP / УРОН ---
function takeDamage(){
  if (Date.now() < invincibleUntil) return;
  if (hasShield){ hasShield=false; removeBuffIcon('shield'); playSFX('death'); gameContainer.classList.add('shake'); setTimeout(()=>gameContainer.classList.remove('shake'),300); invincibleUntil = Date.now()+1000; return; }
  currentHP--;
  if (livesDisplay) livesDisplay.innerHTML = '❤️'.repeat(Math.max(0, currentHP));
  if (currentHP<=0){ endGame(); return; }
  invincibleUntil = Date.now()+1500; playSFX('death'); gameContainer.classList.add('shake'); setTimeout(()=>gameContainer.classList.remove('shake'),300);
}

// --- БАФФЫ ---
function addBuffIcon(type){
  const el = document.createElement('div'); el.className = 'buff-icon'; el.dataset.buffType = type;
  el.textContent = type === 'shield' ? '🛡️' : '⚡'; el.style.color = type === 'shield' ? '#00ffff' : '#ff00ff';
  activeBuffsUI.appendChild(el);
}
function removeBuffIcon(type){ const el = activeBuffsUI.querySelector(`[data-buff-type="${type}"]`); if (el) el.remove(); }

// --- ПАУЭРАПЫ ---
function spawnPowerup(){
  if (powerupsOnScreen.length >= 2) return;
  const type = Math.random() < 0.5 ? 'shield' : 'megajump';
  const p = document.createElement('div'); p.className = `powerup ${type}`; p.textContent = type === 'shield' ? '🛡️' : '⚡';
  let px = gameContainer.offsetWidth; let py = (Math.floor(Math.random()*80)+40);
  p.style.left = px + 'px'; p.style.bottom = py + 'px';
  powerupsContainer.appendChild(p);
  powerupsOnScreen.push({ el: p, x: px, y: py, w: 34, h: 34, type: type });
}

// --- ПОГОДА ---
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

// --- КОМБО ---
function addCombo(){
  comboCount++; comboTimer = Date.now() + 2500;
  comboMultiplier = 1 + Math.floor(comboCount / 5) * 0.5;
  if (comboCount >= 3) {
    comboDisplay.style.display = 'block'; comboDisplay.textContent = `COMBO x${comboMultiplier.toFixed(1)}!`;
    comboDisplay.style.animation = 'none'; void comboDisplay.offsetWidth; comboDisplay.style.animation = 'pop 0.3s ease-out';
  }
}
function resetCombo(){ comboCount = 0; comboMultiplier = 1; comboDisplay.style.display = 'none'; }

// --- БОСС ---
function killBoss(){
  if (!bossElement) return;
  bossElement.remove(); bossElement=null;
  bossProjectileEntities.forEach(p=>p.el.remove()); bossProjectileEntities=[];
  droneProjectileEntities.forEach(p=>p.el.remove()); droneProjectileEntities=[];
  bossHpContainer.style.display='none'; isBossActive=false;
  const bq = quests.find(q=>q.id==='boss'); if(bq){bq.current++; updateQuestProgress('boss'); checkQuestComplete('boss');}
  invincibleUntil = Date.now() + 2000;
  currentBiomeTier++; 
  if (currentBiomeTier > 4) showStory(5); else showStory(currentBiomeTier);
}

function spawnBoss(){
  isBossActive=true; 
  // СНИЖЕНО HP ВТОРОГО БОССА ДО 3 (для джунглей)
  const hpList=[3, 3, 5, 7, 9]; 
  maxBossHP = hpList[currentBiomeTier]||9; bossHP=maxBossHP;
  bossHpFill.style.width='100%'; bossHpContainer.style.display='block';
  obstaclesContainer.innerHTML=''; bossTime=0; bossShootTimer=0;
  bossElement=document.createElement('div'); bossElement.className='boss'; bossElement.style.left='100%';
  bossContainer.appendChild(bossElement); bossName.textContent=`БОСС БИОМА ${currentBiomeTier+1}`;
}

function updateBoss(){
  if (!bossElement) return;
  bossTime += 0.015 + currentBiomeTier*0.005;
  const cx = (gameContainer.offsetWidth/2)-45; const amp = (gameContainer.offsetWidth/2)-100;
  bX = cx + Math.sin(bossTime)*amp; bY = 40 + Math.sin(bossTime)*10;
  bossElement.style.left = bX+'px'; bossElement.style.bottom = bY+'px';
  
  bossShootTimer++;
  // УВЕЛИЧЕНА ПАУЗА ДЛЯ 2-ГО БОССА (ДЖУНГЛИ)
  let si = Math.max(40, 80-currentBiomeTier*10);
  if (currentBiomeTier === 1) si = 110; 
  
  const maxP = 2+currentBiomeTier;
  
  if (bossShootTimer>si && bossProjectileEntities.length<maxP){
    bossElement.classList.add('shooting'); setTimeout(()=>{ if(bossElement) bossElement.classList.remove('shooting'); }, 150);
    const tx = 90, ty = yPosition + 35; 
    const sp = 3 + currentBiomeTier*0.5;
    
    const fireProjectile = (sx, sy, vx, vy) => {
      const p=document.createElement('div'); p.className='boss-projectile';
      p.style.left=sx+'px'; p.style.bottom=sy+'px'; bossContainer.appendChild(p);
      bossProjectileEntities.push({el:p,vx,vy,x:sx,y:sy,w:20,h:20});
    };
    
    if (currentBiomeTier === 0) { 
      const sx=bX+45, sy=bY+45; const dx=tx-sx, dy=ty-sy; const d=Math.sqrt(dx*dx+dy*dy)||1; 
      fireProjectile(sx, sy, (dx/d)*sp, (dy/d)*sp); 
    } 
    else if (currentBiomeTier === 1) { 
      // ВТОРОЙ БОСС (ДЖУНГЛИ): 3 пули, но летят в 2 РАЗА МЕДЛЕННЕЕ (1.8 вместо 3.5)
      const sx=bX+45, sy=bY+45; 
      const dx=tx-sx, dy=ty-sy; const d=Math.sqrt(dx*dx+dy*dy)||1; 
      const angle = Math.atan2(dy, dx);
      const jungleSp = 1.8; // Медленные пули
      fireProjectile(sx, sy, Math.cos(angle)*jungleSp, Math.sin(angle)*jungleSp);
      fireProjectile(sx, sy, Math.cos(angle-0.4)*jungleSp, Math.sin(angle-0.4)*jungleSp);
      fireProjectile(sx, sy, Math.cos(angle+0.4)*jungleSp, Math.sin(angle+0.4)*jungleSp);
    }
    else if (currentBiomeTier === 2) { 
      const sx=bX, sy=bY+20; 
      fireProjectile(sx, sy, -6, 0); 
    }
    else if (currentBiomeTier === 3) { 
      fireProjectile(tx, gameContainer.offsetHeight, 0, -4); 
    }
    else { 
      const sx=bX+45, sy=bY+45; const dx=tx-sx, dy=ty-sy; const d=Math.sqrt(dx*dx+dy*dy)||1; const angle = Math.atan2(dy, dx); 
      fireProjectile(sx, sy, Math.cos(angle)*sp, Math.sin(angle)*sp); 
      fireProjectile(sx, sy, Math.cos(angle-0.3)*sp, Math.sin(angle-0.3)*sp); 
      fireProjectile(sx, sy, Math.cos(angle+0.3)*sp, Math.sin(angle+0.3)*sp); 
    }
    bossShootTimer=0;
  }
  
  for (let i=bossProjectileEntities.length-1;i>=0;i--){
    const p=bossProjectileEntities[i]; p.x+=p.vx; p.y+=p.vy;
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
    droneShootTimer++;
    if (droneShootTimer>120){
      const bcx=bX+45; const bcy=bY+45;
      const pr2=document.createElement('div'); pr2.className='drone-projectile'; pr2.style.left=petX+'px'; pr2.style.bottom=petY+'px'; bossContainer.appendChild(pr2);
      const dx=bcx-petX, dy=bcy-petY; const d=Math.sqrt(dx*dx+dy*dy)||1;
      droneProjectileEntities.push({el:pr2,vx:(dx/d)*5,vy:(dy/d)*5,x:petX,y:petY,w:12,h:12});
      droneShootTimer=0;
    }
    for (let i=droneProjectileEntities.length-1;i>=0;i--){
      const p=droneProjectileEntities[i]; p.x+=p.vx; p.y+=p.vy;
      p.el.style.left=p.x+'px'; p.el.style.bottom=p.y+'px';
      if (checkAABB(bX, bY, 90, 90, p.x, p.y, p.w, p.h)){
        p.el.remove(); droneProjectileEntities.splice(i,1); bossHP -= 0.15;
        bossHpFill.style.width=(Math.max(0,bossHP)/maxBossHP*100)+'%'; playSFX('boss_hit');
        if (bossHP<=0){ killBoss(); return; }
      } else if (p.y<-50||p.x<-50||p.x>gameContainer.offsetWidth+50){ p.el.remove(); droneProjectileEntities.splice(i,1); }
    }
  }
  
  if (checkAABB(HITBOX_X, yPosition + 10, HITBOX_W, HITBOX_H, bX, bY, 90, 90)){
    if (yVelocity<0 && (yPosition + 10 + HITBOX_H) < (bY + 45)){
      bossHP--; bossHpFill.style.width=(Math.max(0,bossHP)/maxBossHP*100)+'%'; playSFX('boss_hit'); yVelocity=12;
      if (bossHP<=0) { killBoss(); return; }
    } else { takeDamage(); if (!isGameRunning) return; }
  }
}

// --- ИГРОВОЙ ЦИКЛ ---
function gameLoop(){
  if (!isGameRunning) return;
  
  if (isBossActive){ updateBoss(); } 
  else {
    score++; const cs = Math.floor(score/10); scoreDisplay.textContent = String(cs).padStart(5,'0');
    const sq = quests.find(q=>q.id==='score'); if (sq&&!sq.done){ sq.current=cs; if (cs>=sq.target) checkQuestComplete('score'); else updateQuestProgress('score'); }
    
    if (cs>=nextBossScore){ spawnBoss(); } else {
      const baseSpeed = window.innerWidth<900?3:4.5; let speed = isDailyMode? baseSpeed*1.5 : baseSpeed;
      if (currentEvent==='frenzy') speed *= 1.4;
      
      spawnObstacleTimer++; if (spawnObstacleTimer>100){ spawnObstacle(); spawnObstacleTimer=0; }
      spawnCoinTimer++; if (spawnCoinTimer>150){ spawnCoin(); spawnCoinTimer=0; }
      spawnPowerupTimer++; if (spawnPowerupTimer>600){ spawnPowerup(); spawnPowerupTimer=0; }
      
      if (Date.now() > nextEventTime && !currentEvent){
        if (Math.random() < (skill_l_event ? 0.9 : 0.5)) triggerRandomEvent();
        else nextEventTime = Date.now() + 20000;
      }
      
      for (let i=obstacleEntities.length-1; i>=0; i--) {
        let o = obstacleEntities[i]; o.x -= speed; o.el.style.left = o.x + 'px';
        if (checkAABB(HITBOX_X, yPosition + 10, HITBOX_W, HITBOX_H, o.x, o.y, o.w, o.h)) { takeDamage(); if(!isGameRunning) return; }
        if (o.x < -150) { o.el.remove(); obstacleEntities.splice(i, 1); }
      }
      
      for (let i=coinEntities.length-1; i>=0; i--) {
        let c = coinEntities[i]; let cx = c.x - speed; let cy = c.y;
        if (activeMagnet){
          const dx = 90 - cx; const dy = (yPosition + 35) - cy;
          const range = skill_a_magnet?600:300;
          if (Math.sqrt(dx*dx+dy*dy)<range){ cx+=dx*0.15; cy+=dy*0.15; }
        }
        c.x = cx; c.y = cy; c.el.style.left = c.x + 'px'; c.el.style.bottom = c.y + 'px';
        if (checkAABB(HITBOX_X, yPosition + 10, HITBOX_W, HITBOX_H, c.x, c.y, c.w, c.h)) {
          c.el.remove(); coinEntities.splice(i, 1); playSFX('coin'); addCombo();
          const r=Math.round((activeGlasses?2:1)*(skill_l_coin?2:1)*comboMultiplier); coins+=r; localStorage.setItem('dino_coins',coins); coinsDisplay.textContent=`🪙 ${coins}`;
          const q=quests.find(qq=>qq.id==='coin'); if(q&&!q.done){q.current++; updateQuestProgress('coin'); checkQuestComplete('coin');}
        } else if (c.x < -50) { c.el.remove(); coinEntities.splice(i, 1); }
      }
      
      for (let i=powerupsOnScreen.length-1; i>=0; i--) {
        const p = powerupsOnScreen[i]; p.x -= speed; p.el.style.left = p.x + 'px';
        if (checkAABB(HITBOX_X, yPosition + 10, HITBOX_W, HITBOX_H, p.x, p.y, p.w, p.h)) {
          if (p.type === 'shield') { hasShield = true; addBuffIcon('shield'); } else { hasDoubleJump = true; addBuffIcon('megajump'); }
          playSFX('buy'); p.el.remove(); powerupsOnScreen.splice(i, 1);
        } else if (p.x < -50) { p.el.remove(); powerupsOnScreen.splice(i, 1); }
      }
    }
    if (cs>highScore){ highScore=cs; highScoreDisplay.textContent=`HI ${String(highScore).padStart(5,'0')}`; }
  }
  
  for (let i=meteorEntities.length-1; i>=0; i--) {
    let m = meteorEntities[i]; m.y -= 5; m.el.style.bottom = m.y + 'px';
    if (m.y < -50) { m.el.remove(); meteorEntities.splice(i,1); continue; }
    if (checkAABB(HITBOX_X, yPosition + 10, HITBOX_W, HITBOX_H, m.x, m.y, m.w, m.h)) { m.el.remove(); meteorEntities.splice(i,1); takeDamage(); if (!isGameRunning) return; }
  }
  
  if (comboCount > 0 && Date.now() > comboTimer) resetCombo();
  updateDog(); updateWeather();
  
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
  
  if (Date.now() < invincibleUntil) player.style.opacity = (Math.floor(Date.now()/100)%2)?'0.3':'1';
  else player.style.opacity = '1';
  
  animationFrameId = requestAnimationFrame(gameLoop);
}

// --- СПАВН ---
function spawnObstacle(){
  if (gameContainer.offsetWidth===0) return;
  const o = document.createElement('div'); o.classList.add('obstacle');
  let w, h, flying = false;
  if (Math.random()<0.2) { o.classList.add('flying'); w = 60; h = 45; flying = true; }
  else { h = (Math.floor(Math.random()*30)+50); w = Math.random()>0.6?55:35; o.style.height = h+'px'; o.style.width = w+'px'; }
  let ox = gameContainer.offsetWidth; let oy = flying ? 70 : 0;
  o.style.left = ox + 'px'; o.style.bottom = oy + 'px';
  obstaclesContainer.appendChild(o);
  obstacleEntities.push({ el: o, x: ox, y: oy, w: w, h: h });
}
function spawnCoin(){
  if (coinEntities.length >= 5) return;
  const c = document.createElement('div'); c.className = 'coin';
  let cx = gameContainer.offsetWidth; let cy = (Math.floor(Math.random()*120)+50);
  c.style.left = cx + 'px'; c.style.bottom = cy + 'px';
  coinsContainer.appendChild(c);
  coinEntities.push({ el: c, x: cx, y: cy, w: 24, h: 24 });
}

// --- КВЕСТЫ ---
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

// --- СТАРТ ---
function startGame(daily=false){
  initAudio(); isDailyMode=daily; isGameRunning=true; isBossActive=false; bossHpContainer.style.display='none';
  if(bossElement){bossElement.remove();bossElement=null;}
  clearEntities();
  gameMenu.style.display='none'; obstaclesContainer.innerHTML=''; bossContainer.innerHTML=''; coinsContainer.innerHTML=''; powerupsContainer.innerHTML='';
  weatherParticles.forEach(p=>p.el.remove()); weatherParticles=[]; weatherSpawnTimer = 0;
  
  const stats = getClassStats(); maxHP = stats.hp; currentHP = stats.hp;
  livesDisplay.innerHTML = '❤️'.repeat(currentHP); livesDisplay.style.display = maxHP>1 ? 'flex':'none';
  score=0; yPosition=0; yVelocity=0; isGrounded=true; jumpCount=0;
  spawnObstacleTimer=0; spawnCoinTimer=0; spawnPowerupTimer=0; droneShootTimer=0;
  hasShield = false; hasDoubleJump = false; activeBuffsUI.innerHTML = ''; resetCombo();
  petDog.style.display = activeDog?'block':'none'; dogX=50; dogY=0;
  currentEvent=null; eventBanner.style.display='none'; nextEventTime = Date.now() + 30000; lastEventType = null;
  quests.forEach(q=>{q.current=0;q.done=false;}); renderQuests();
  currentBiomeTier = daily?0:(parseInt(startBiomeSelect.value)||0); nextBossScore = (currentBiomeTier+1)*300;
  gameContainer.className = `game-container biome-${['desert','jungle','ice','volcano','cyber'][currentBiomeTier]}`; playBiomeMusic(currentBiomeTier);
  updatePlayerSkin(); player.classList.add('running');
  invincibleUntil = Date.now()+2000;
  highScore = parseInt(localStorage.getItem(daily?'dino_daily_hs':'dino_highscore'))||0; highScoreDisplay.textContent=`HI ${String(highScore).padStart(5,'0')}`;
  if (animationFrameId) cancelAnimationFrame(animationFrameId); gameLoop();
}

function endGame(){
  if (!isGameRunning) return;
  isGameRunning=false; cancelAnimationFrame(animationFrameId); bgMusic.pause(); playSFX('death');
  bossHpContainer.style.display='none';
  if(bossElement){bossElement.remove();bossElement=null;}
  clearEntities();
  const cs = Math.floor(score/10); const dr = Math.floor(cs/50);
  dna += dr; localStorage.setItem('dino_dna', dna);
  if (cs>highScore){ highScore=cs; localStorage.setItem(isDailyMode?'dino_daily_hs':'dino_highscore', highScore); }
  if (playerName) { sendScore(playerName, cs); saveProfileToServer(); } else { pendingScore = cs; }
  menuTitle.textContent='GAME OVER'; menuText.innerHTML=`Счёт: ${cs}<br>Получено ДНК: 🧬 +${dr}`; startBtn.textContent='ИГРАТЬ СНОВА';
  gameMenu.style.display='flex'; updateShopUI(); updatePlayerSkin(); updateNameUI();
}

// --- УПРАВЛЕНИЕ ---
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

// Init
loadLeaderboard(); updateShopUI(); renderQuests(); updatePlayerSkin(); renderSkills(); updateNameUI();
if (playerName) loadProfileFromServer();