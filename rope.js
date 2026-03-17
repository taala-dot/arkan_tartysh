// rope.js – управление положением верёвки
export class Rope {
    /**
     * @param {HTMLElement} knotElement - DOM-элемент узелка
     * @param {number} leftLimit - максимальное смещение влево (%)
     * @param {number} rightLimit - максимальное смещение вправо (%)
     */
    constructor(knotElement, leftLimit = -70, rightLimit = 70) {
        this.knot = knotElement;
        this.position = 0; // центральное положение
        this.leftLimit = leftLimit;
        this.rightLimit = rightLimit;
        this.updateKnot();
    }

    // Потянуть влево (игрок)
    pullLeft(force) {
        this.position = Math.max(this.leftLimit, this.position - force);
        this.updateKnot();
    }

    // Потянуть вправо (таймер / ошибки)
    pullRight(force) {
        this.position = Math.min(this.rightLimit, this.position + force);
        this.updateKnot();
    }

    // Вернуть в центр
    reset() {
        this.position = 0;
        this.updateKnot();
    }

    // Обновить CSS-трансформацию
    updateKnot() {
        this.knot.style.transform = `translate(-50%, -50%) translateX(${this.position}%)`;
    }

    // Проверка, дошёл ли до левого края (победа)
    isPlayerWin() {
        return this.position <= this.leftLimit;
    }

    // Проверка, дошёл ли до правого края (поражение)
    isPlayerLose() {
        return this.position >= this.rightLimit;
    }
}