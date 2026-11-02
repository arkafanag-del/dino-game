const player = document.querySelector('.player');
const obstaclesContainer = document.getElementById('obstacles');
const scoreDisplay = document.getElementById('score');
const gameContainer = document.querySelector('.game-container');

let gameInterval;
let physicsInterval;
let score = 0;

// Переменные физики Динозаврика
let yPosition = 0;      
let yVelocity = 0;      
let isGrounded = true;   
const gravity = 0.7;     // Немного увеличили гравитацию для динамики на мобильных
const jumpForce = 13;    

function createObstacle() {
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    
    // Высота кактуса адаптирована под мобильного игрока (от 35px до 55px)
    const randomHeight = Math.floor(Math.random() * (55 - 35 + 1)) + 35;
    obstacle.style.height = randomHeight + 'px';
    
    obstaclesContainer.appendChild(obstacle);

    obstacle.addEventListener('animationend', () => {
        obstacle.remove();
    });
}

// Функция самого прыжка
function doJump() {
    if (isGrounded) {
        yVelocity = jumpForce;
        isGrounded = false;
    }
}

// Обработка клавиш (для ПК)
function handleKeyDown(event) {
    if (event.code === 'Space' || event.key === 'ArrowUp') {
        event.preventDefault(); // Запрещаем прокрутку страницы пробелом
        doJump();
    }
}

// Обработка тач-событий (для iPhone)
function handleTouch(event) {
    event.preventDefault(); // Запрещаем зум и стандартные жесты браузера при игре
    doJump();
}

// Главный цикл обновлений (60 FPS)
function updateGame() {
    if (!isGrounded) {
        yVelocity -= gravity;
        yPosition += yVelocity;
        
        if (yPosition <= 0) {
            yPosition = 0;
            yVelocity = 0;
            isGrounded = true;
        }
    }
    player.style.bottom = yPosition + 'px';

    score += 1;
    if (score % 10 === 0) {
        scoreDisplay.textContent = `HI ${Math.floor(score / 10)}`;
    }

    const obstacles = document.querySelectorAll('.obstacle');
    obstacles.forEach(obstacle => {
        if (checkCollision(player, obstacle)) {
            endGame();
        }
    });
}

function checkCollision(obj1, obj2) {
    const rect1 = obj1.getBoundingClientRect();
    const rect2 = obj2.getBoundingClientRect();

    return !(
        rect1.right - 4 < rect2.left + 4 ||
        rect1.left + 4 > rect2.right - 4 ||
        rect1.bottom - 4 < rect2.top + 4 ||
        rect1.top + 4 > rect2.bottom - 4
    );
}

function endGame() {
    clearInterval(gameInterval);
    clearInterval(physicsInterval);
    window.removeEventListener('keydown', handleKeyDown);
    gameContainer.removeEventListener('touchstart', handleTouch);
    
    alert('Game Over! Score: ' + Math.floor(score / 10));
    resetGame();
}

function resetGame() {
    obstaclesContainer.innerHTML = '';
    score = 0;
    yPosition = 0;
    yVelocity = 0;
    isGrounded = true;
    player.style.bottom = '0px';
    scoreDisplay.textContent = 'HI 0';
    
    gameInterval = setInterval(createObstacle, 1500); 
    physicsInterval = setInterval(updateGame, 1000 / 60); 
    window.addEventListener('keydown', handleKeyDown);
    gameContainer.addEventListener('touchstart', handleTouch, { passive: false });
}

// Старт игры с поддержкой клавиатуры и тач-скрина
gameInterval = setInterval(createObstacle, 1500);
physicsInterval = setInterval(updateGame, 1000 / 60);
window.addEventListener('keydown', handleKeyDown);
// Вешаем касание на игровое поле
gameContainer.addEventListener('touchstart', handleTouch, { passive: false });
