// timer.js – таймер с колбэками на каждый тик и на истечение
export class Timer {
    /**
     * @param {number} initialSeconds - начальное значение (секунд)
     * @param {Function} onTick - вызывается каждую секунду (передаётся остаток)
     * @param {Function} onTimeout - вызывается при достижении 0
     */
    constructor(initialSeconds, onTick, onTimeout) {
        this.initial = initialSeconds;
        this.remaining = initialSeconds;
        this.onTick = onTick;
        this.onTimeout = onTimeout;
        this.interval = null;
        this.isRunning = false;
    }

    // Запустить таймер
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.interval = setInterval(() => {
            this.remaining -= 1;
            this.onTick(this.remaining);
            if (this.remaining <= 0) {
                this.stop();
                this.onTimeout();
            }
        }, 1000);
    }

    // Остановить таймер
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
    }

    // Сбросить с новым начальным значением
    reset(newSeconds) {
        this.stop();
        this.initial = newSeconds;
        this.remaining = newSeconds;
        this.onTick(this.remaining);
    }

    // Получить текущее значение (может пригодиться)
    getRemaining() {
        return this.remaining;
    }
}