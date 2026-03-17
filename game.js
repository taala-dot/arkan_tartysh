import { sentences } from './texts.js';
import { getRandomSentence } from './utils.js';
import { Timer } from './timer.js';
import { Rope } from './rope.js';
import { Stats } from './stats.js';
import { TypingHandler } from './typing.js';
import { SpeedMode } from './speedMode.js';
import { saveScore, renderLeaderboard } from './leaderboard.js';

// DOM элементы
const timerDisplay = document.getElementById('timer-display');
const wpmDisplay = document.getElementById('wpm-display');
const accuracyDisplay = document.getElementById('accuracy-display');
const ropeKnot = document.getElementById('rope-knot');
const sentenceDisplay = document.getElementById('sentence-display');
const typingInput = document.getElementById('typing-input');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const difficultySelect = document.getElementById('difficulty-select');
const resultOverlay = document.getElementById('result-overlay');
const resultTitle = document.getElementById('result-title');
const resultStats = document.getElementById('result-stats');
const resultRestartBtn = document.getElementById('result-restart-btn');
const winGif = document.getElementById('win-gif');
const loseGif = document.getElementById('lose-gif');
const saveScoreBtn = document.getElementById('save-score-btn');
const playerNameInput = document.getElementById('player-name');
const leaderboardList = document.getElementById('leaderboard-list');
const leaderboardTitle = document.getElementById('leaderboard-title');

// Кнопки режимов
const classicModeBtn = document.getElementById('classic-mode-btn');
const speedModeBtn = document.getElementById('speed-mode-btn');

// Состояние игры
let currentMode = 'classic';
let currentSentence = '';
let timer = null;
let rope = null;
let stats = null;
let typingHandler = null;
let speedMode = null;
let gameActive = false;
let gameResult = null;

const difficultySettings = { easy: 60, medium: 45, hard: 30 };

let typingSound = null;
try {
    typingSound = new Audio('assets/typing.mp3');
    typingSound.volume = 0.2;
} catch (e) {
    console.log('Звук не загружен');
}

// Инициализация
function initGame() {
    // Проверяем наличие GIF
    checkGifs();
    
    rope = new Rope(ropeKnot, -70, 70);
    stats = new Stats(({ wpm, accuracy }) => {
        wpmDisplay.textContent = wpm;
        accuracyDisplay.textContent = accuracy;
    });

    // Создаём объект скоростного режима
    speedMode = new SpeedMode(
        sentenceDisplay,
        typingInput,
        timerDisplay,
        wpmDisplay,
        accuracyDisplay,
        leaderboardList,
        (result) => {
            gameActive = false;
            resultTitle.textContent = '⚡ ЧЕМПИОН ЫЛДАМДЫГЫ ⚡';
            resultStats.textContent = `${result.chunks} чонк | ${result.chars} символ | WPM: ${result.wpm} | Тактык: ${result.accuracy}%`;
            
            // Показываем win GIF (для скорости используем win-gif)
            winGif.style.display = 'block';
            loseGif.style.display = 'none';
            
            resultOverlay.classList.remove('hidden');
            startBtn.disabled = false;
            restartBtn.disabled = true;
        }
    );

    newSentence();
    renderLeaderboard(leaderboardList);

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', resetGame);
    resultRestartBtn.addEventListener('click', () => {
        resultOverlay.classList.add('hidden');
        resetGame();
    });
    saveScoreBtn.addEventListener('click', saveScoreHandler);
    
    typingInput.addEventListener('input', (e) => {
        if (currentMode === 'classic' && typingHandler) {
            typingHandler.handleInput(e);
        } else if (currentMode === 'speed' && speedMode && speedMode.typingHandler) {
            speedMode.typingHandler.handleInput(e);
        }
    });

    // Переключение режимов
    classicModeBtn.addEventListener('click', () => {
        classicModeBtn.classList.add('active');
        speedModeBtn.classList.remove('active');
        currentMode = 'classic';
        resetGame();
        renderLeaderboard(leaderboardList);
        if (leaderboardTitle) leaderboardTitle.textContent = '(Топ 10 WPM)';
    });

    speedModeBtn.addEventListener('click', () => {
        speedModeBtn.classList.add('active');
        classicModeBtn.classList.remove('active');
        currentMode = 'speed';
        resetGame();
        speedMode.renderSpeedLeaderboard();
    });

    typingInput.disabled = true;
}

// Проверка наличия GIF
function checkGifs() {
    const leftGif = document.getElementById('left-gif');
    const rightGif = document.getElementById('right-gif');
    const winGifEl = document.getElementById('win-gif');
    const loseGifEl = document.getElementById('lose-gif');
    
    // Если GIF не загрузились, они заменятся SVG через onerror
    console.log('Проверка GIF...');
}

function newSentence() {
    currentSentence = getRandomSentence(sentences);
    if (typingHandler) {
        typingHandler.reset(currentSentence);
    } else {
        typingHandler = new TypingHandler(
            currentSentence,
            typingInput,
            sentenceDisplay,
            handleCorrect,
            handleWrong,
            handleBackspace,
            handleComplete
        );
    }
}

function startGame() {
    if (gameActive) return;

    if (currentMode === 'classic') {
        const initialTime = difficultySettings[difficultySelect.value];
        rope.reset();
        stats.start();
        
        if (timer) {
            timer.reset(initialTime);
        } else {
            timer = new Timer(initialTime, tick, timeout);
        }
        timer.start();

        newSentence();
        typingHandler.start();

        gameActive = true;
        gameResult = null;
        startBtn.disabled = true;
        restartBtn.disabled = false;
        saveScoreBtn.disabled = true;
        typingInput.disabled = false;
        typingInput.focus();
        resultOverlay.classList.add('hidden');

    } else if (currentMode === 'speed') {
        gameActive = true;
        startBtn.disabled = true;
        restartBtn.disabled = false;
        saveScoreBtn.disabled = true;
        typingInput.disabled = false;
        typingInput.focus();
        resultOverlay.classList.add('hidden');

        speedMode.init();
    }
}

function resetGame() {
    if (timer) timer.stop();
    gameActive = false;
    startBtn.disabled = false;
    restartBtn.disabled = true;
    typingInput.disabled = true;

    if (currentMode === 'classic') {
        if (typingHandler) typingHandler.stop();
        rope.reset();
        if (stats) stats.reset();
        if (timer) timer.reset(difficultySettings[difficultySelect.value]);
        timerDisplay.textContent = difficultySettings[difficultySelect.value].toString().padStart(2,'0');
        wpmDisplay.textContent = '0';
        accuracyDisplay.textContent = '100';
        newSentence();
    } else {
        speedMode.reset();
        timerDisplay.textContent = '60';
        wpmDisplay.textContent = '0';
        accuracyDisplay.textContent = '100';
    }

    resultOverlay.classList.add('hidden');
    saveScoreBtn.disabled = true;
}

// Классические колбэки
function tick(remaining) {
    timerDisplay.textContent = remaining.toString().padStart(2, '0');
    if (gameActive && currentMode === 'classic') {
        rope.pullRight(1.0);
        checkBoundaries();
    }
}

function timeout() {
    if (gameActive && currentMode === 'classic') loseGame('Убакыт бүттү!');
}

function handleCorrect() {
    if (!gameActive || currentMode !== 'classic') return;
    if (typingSound) typingSound.play().catch(() => {});
    rope.pullLeft(2.2);
    stats.addCorrect();
    checkBoundaries();
}

function handleWrong() {
    if (!gameActive || currentMode !== 'classic') return;
    if (typingSound) typingSound.play().catch(() => {});
    rope.pullRight(1.3);
    stats.addWrong();
    checkBoundaries();
}

function handleBackspace(wasCorrect) {
    if (!gameActive || currentMode !== 'classic') return;
    stats.removeLastChar(wasCorrect);
}

function handleComplete() {
    if (!gameActive || currentMode !== 'classic') return;
    winGame('Сүйлөм бүттү!');
}

function checkBoundaries() {
    if (!gameActive || currentMode !== 'classic') return;
    if (rope.isPlayerWin()) {
        winGame('Жеңиш! Сиз күчтүүсүз!');
    } else if (rope.isPlayerLose()) {
        loseGame('Аркан сыртка кетти...');
    }
}

function winGame(message) {
    if (gameResult || currentMode !== 'classic') return;
    gameActive = false;
    gameResult = 'win';
    timer.stop();
    typingHandler.stop();
    typingInput.disabled = true;

    resultTitle.textContent = '🏆 ЖЕҢИШ 🏆';
    resultStats.textContent = `WPM: ${stats.getWPM()} | Тактык: ${stats.getAccuracy()}%`;
    
    winGif.style.display = 'block';
    loseGif.style.display = 'none';
    
    resultOverlay.classList.remove('hidden');

    saveScoreBtn.disabled = false;
}

function loseGame(message) {
    if (gameResult || currentMode !== 'classic') return;
    gameActive = false;
    gameResult = 'lose';
    timer.stop();
    typingHandler.stop();
    typingInput.disabled = true;

    resultTitle.textContent = '💔 ЖЕҢИЛҮҮ 💔';
    resultStats.textContent = message;
    
    winGif.style.display = 'none';
    loseGif.style.display = 'block';
    
    resultOverlay.classList.remove('hidden');

    saveScoreBtn.disabled = true;
}

function saveScoreHandler() {
    if (gameResult !== 'win' || currentMode !== 'classic') return;
    const name = playerNameInput.value.trim() || 'Аноним';
    const wpm = stats.getWPM();
    const accuracy = stats.getAccuracy();
    saveScore(name, wpm, accuracy);
    renderLeaderboard(leaderboardList);
    saveScoreBtn.disabled = true;
    playerNameInput.value = '';
}

document.addEventListener('DOMContentLoaded', initGame);