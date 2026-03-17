// speedMode.js – режим проверки скорости (1 минута, бесконечный ИИ-текст)
import { createInfiniteTextGenerator } from './aiGenerator.js';
import { Timer } from './timer.js';
import { Stats } from './stats.js';
import { TypingHandler } from './typing.js';

export class SpeedMode {
    constructor(
        sentenceDisplay,
        typingInput,
        timerDisplay,
        wpmDisplay,
        accuracyDisplay,
        leaderboardList,
        onGameEnd
    ) {
        this.sentenceDisplay = sentenceDisplay;
        this.typingInput = typingInput;
        this.timerDisplay = timerDisplay;
        this.wpmDisplay = wpmDisplay;
        this.accuracyDisplay = accuracyDisplay;
        this.leaderboardList = leaderboardList;
        this.onGameEnd = onGameEnd;

        this.textGenerator = createInfiniteTextGenerator();
        this.currentText = "";         // текущий отображаемый текст
        this.fullTypedText = "";        // всё, что уже напечатано (для статистики)
        this.typingHandler = null;
        this.stats = null;
        this.timer = null;
        this.active = false;
        
        // Для отслеживания позиции в бесконечном тексте
        this.currentChunk = "";
        this.chunkPosition = 0;
        this.totalChunks = 0;
    }

    // Загрузить следующий кусок текста
    loadNextChunk() {
        this.currentChunk = this.textGenerator.getNextChunk();
        this.chunkPosition = 0;
        this.totalChunks++;
        return this.currentChunk;
    }

    // Получить текущий отображаемый текст (для TypingHandler)
    getCurrentDisplayText() {
        // Показываем последние ~100 символов + новый кусок
        const prevText = this.fullTypedText.slice(-100);
        return prevText + this.currentChunk;
    }

    // Инициализация нового раунда
    init() {
        // Статистика на всю минуту
        this.stats = new Stats(({ wpm, accuracy }) => {
            this.wpmDisplay.textContent = wpm;
            this.accuracyDisplay.textContent = accuracy;
        });
        this.stats.start();

        // Таймер на 60 секунд
        this.timer = new Timer(60, (remaining) => {
            this.timerDisplay.textContent = remaining.toString().padStart(2, '0');
        }, () => {
            this.endGame();
        });
        this.timer.start();

        this.active = true;
        this.fullTypedText = "";
        this.totalChunks = 0;
        
        // Загружаем первый кусок
        this.loadNextChunk();
        const initialText = this.getCurrentDisplayText();

        if (this.typingHandler) {
            this.typingHandler.reset(initialText);
            this.typingHandler.start();
        } else {
            this.typingHandler = new TypingHandler(
                initialText,
                this.typingInput,
                this.sentenceDisplay,
                () => this.handleCorrect(),
                () => this.handleWrong(),
                () => {}, // backspace игнорируем для простоты
                () => this.handleChunkComplete()
            );
            this.typingHandler.start();
        }
    }

    handleCorrect() {
        if (!this.active) return;
        this.stats.addCorrect();
    }

    handleWrong() {
        if (!this.active) return;
        this.stats.addWrong();
    }

    handleChunkComplete() {
        if (!this.active) return;
        
        // Сохраняем напечатанный кусок в историю
        this.fullTypedText += this.currentChunk;
        
        // Загружаем следующий кусок
        this.loadNextChunk();
        const newText = this.getCurrentDisplayText();
        
        // Сбрасываем обработчик с новым текстом
        this.typingHandler.reset(newText);
        this.typingHandler.start();
    }

    endGame() {
        if (!this.active) return;
        this.active = false;
        this.timer.stop();
        if (this.typingHandler) this.typingHandler.stop();

        const finalWPM = this.stats.getWPM();
        const finalAccuracy = this.stats.getAccuracy();
        const totalChars = this.stats.correctChars + this.stats.wrongChars;
        const totalCorrect = this.stats.correctChars;

        // Сохраняем в отдельный leaderboard
        this.saveScore(finalWPM, finalAccuracy, totalChars, totalCorrect, this.totalChunks);

        if (this.onGameEnd) {
            this.onGameEnd({
                mode: 'speed',
                chunks: this.totalChunks,
                chars: totalChars,
                correct: totalCorrect,
                wpm: finalWPM,
                accuracy: finalAccuracy
            });
        }
    }

    saveScore(wpm, accuracy, totalChars, correctChars, chunks) {
        const playerName = document.getElementById('player-name').value.trim() || 'Аноним';
        
        const speedScores = JSON.parse(localStorage.getItem('speedModeScores') || '[]');
        speedScores.push({
            name: playerName,
            wpm: wpm,
            accuracy: accuracy,
            chars: totalChars,
            correct: correctChars,
            chunks: chunks,
            date: new Date().toLocaleDateString()
        });
        speedScores.sort((a, b) => b.wpm - a.wpm);
        const top10 = speedScores.slice(0, 10);
        localStorage.setItem('speedModeScores', JSON.stringify(top10));

        this.renderSpeedLeaderboard();
    }

    renderSpeedLeaderboard() {
        const scores = JSON.parse(localStorage.getItem('speedModeScores') || '[]');
        const listEl = this.leaderboardList;
        listEl.innerHTML = '';
        if (scores.length === 0) {
            listEl.innerHTML = '<li>Рекорд жок. Ойной баштаңыз!</li>';
            return;
        }
        scores.forEach((entry, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${index+1}. ${entry.name}</span> <span>${entry.wpm} WPM (${entry.chars} символ)</span>`;
            listEl.appendChild(li);
        });
    }

    reset() {
        if (this.timer) this.timer.stop();
        if (this.typingHandler) this.typingHandler.stop();
        this.active = false;
        this.typingInput.disabled = true;
        this.timerDisplay.textContent = '60';
        this.wpmDisplay.textContent = '0';
        this.accuracyDisplay.textContent = '100';
    }
}