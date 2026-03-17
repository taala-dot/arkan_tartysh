// stats.js – вычисляет WPM и точность, уведомляет об изменениях
export class Stats {
    constructor(onUpdate) {
        this.correctChars = 0;
        this.wrongChars = 0;
        this.totalTyped = 0;
        this.startTime = null;
        this.onUpdate = onUpdate; // функция, вызываемая при обновлении статистики
    }

    // Начать отсчёт
    start() {
        this.startTime = Date.now();
        this.correctChars = 0;
        this.wrongChars = 0;
        this.totalTyped = 0;
        this._triggerUpdate();
    }

    // Сбросить
    reset() {
        this.startTime = null;
        this.correctChars = 0;
        this.wrongChars = 0;
        this.totalTyped = 0;
        this._triggerUpdate();
    }

    // Добавить правильный символ
    addCorrect() {
        this.correctChars++;
        this.totalTyped++;
        this._triggerUpdate();
    }

    // Добавить неправильный символ
    addWrong() {
        this.wrongChars++;
        this.totalTyped++;
        this._triggerUpdate();
    }

    // Удалить последний символ (при backspace)
    removeLastChar(wasCorrect) {
        if (wasCorrect) {
            this.correctChars = Math.max(0, this.correctChars - 1);
        } else {
            this.wrongChars = Math.max(0, this.wrongChars - 1);
        }
        this.totalTyped = Math.max(0, this.totalTyped - 1);
        this._triggerUpdate();
    }

    // WPM = (правильные символы / 5) / минуты
    getWPM() {
        if (!this.startTime) return 0;
        const minutes = (Date.now() - this.startTime) / 60000;
        if (minutes <= 0) return 0;
        return Math.round((this.correctChars / 5) / minutes);
    }

    // Точность = (правильные / всего) * 100
    getAccuracy() {
        if (this.totalTyped === 0) return 100;
        return Math.round((this.correctChars / this.totalTyped) * 100);
    }

    // Вызвать колбэк с текущими значениями
    _triggerUpdate() {
        if (this.onUpdate) {
            this.onUpdate({
                wpm: this.getWPM(),
                accuracy: this.getAccuracy()
            });
        }
    }
}