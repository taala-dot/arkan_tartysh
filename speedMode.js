// speedMode.js – режим с бесконечным текстом
import { infiniteGenerator } from './aiGenerator.js';
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

        this.generator = infiniteGenerator;
        this.currentText = "";
        this.fullTypedText = "";
        this.typingHandler = null;
        this.stats = null;
        this.timer = null;
        this.active = false;
        
        this.totalChunks = 0;
        this.totalChars = 0;
        this.startTime = null;
    }

    init() {
        this.stats = new Stats(({ wpm, accuracy }) => {
            this.wpmDisplay.textContent = wpm;
            this.accuracyDisplay.textContent = accuracy;
        });
        this.stats.start();

        this.timer = new Timer(60, (remaining) => {
            this.timerDisplay.textContent = remaining.toString().padStart(2, '0');
        }, () => {
            this.endGame();
        });
        this.timer.start();

        this.active = true;
        this.totalChunks = 0;
        this.totalChars = 0;
        this.fullTypedText = "";
        
        // Генерируем начальный текст
        this.currentText = this.generator.getInitialText();
        
        if (this.typingHandler) {
            this.typingHandler.reset(this.currentText);
            this.typingHandler.start();
        } else {
            this.typingHandler = new TypingHandler(
                this.currentText,
                this.typingInput,
                this.sentenceDisplay,
                () => this.handleCorrect(),
                () => this.handleWrong(),
                () => {}, // backspace игнорируем
                () => this.handleChunkComplete()
            );
            this.typingHandler.start();
        }
    }

    handleCorrect() {
        if (!this.active) return;
        this.stats.addCorrect();
        this.totalChars++;
    }

    handleWrong() {
        if (!this.active) return;
        this.stats.addWrong();
        this.totalChars++;
    }

    handleChunkComplete() {
        if (!this.active) return;
        
        this.totalChunks++;
        
        // Генерируем новый кусок текста
        const newChunk = this.generator.getNextChunk();
        this.currentText = newChunk;
        
        // Сбрасываем обработчик с новым текстом
        this.typingHandler.reset(this.currentText);
        this.typingHandler.start();
    }

    endGame() {
        if (!this.active) return;
        this.active = false;
        this.timer.stop();
        if (this.typingHandler) this.typingHandler.stop();

        const finalWPM = this.stats.getWPM();
        const finalAccuracy = this.stats.getAccuracy();
        const correctChars = this.stats.correctChars;
        const wrongChars = this.stats.wrongChars;
        const totalChars = correctChars + wrongChars;

        this.saveScore(finalWPM, finalAccuracy, totalChars, correctChars, this.totalChunks);

        if (this.onGameEnd) {
            this.onGameEnd({
                mode: 'speed',
                chunks: this.totalChunks,
                chars: totalChars,
                correct: correctChars,
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
        
        // Обновляем заголовок
        const leaderboardTitle = document.getElementById('leaderboard-title');
        if (leaderboardTitle) {
            leaderboardTitle.textContent = '(Топ 10 WPM) ⚡';
        }
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