// typing.js – отвечает за отображение текста, подсветку и вызов колбэков
export class TypingHandler {
    /**
     * @param {string} sentence - целевое предложение
     * @param {HTMLInputElement} inputEl - поле ввода
     * @param {HTMLElement} displayEl - контейнер для отображения букв
     * @param {Function} onCorrect - вызывается при правильном символе
     * @param {Function} onWrong - вызывается при неправильном символе
     * @param {Function} onBackspace - вызывается при стирании
     * @param {Function} onComplete - вызывается при завершении предложения
     */
    constructor(sentence, inputEl, displayEl, onCorrect, onWrong, onBackspace, onComplete) {
        this.sentence = sentence;
        this.input = inputEl;
        this.display = displayEl;
        this.onCorrect = onCorrect;
        this.onWrong = onWrong;
        this.onBackspace = onBackspace;
        this.onComplete = onComplete;

        this.chars = sentence.split('');
        this.spans = [];
        this.index = 0;         // индекс следующего символа для набора
        this.active = false;
        this.completed = false;

        this._render();
    }

    // Отрисовка букв в виде отдельных span
    _render() {
        this.display.innerHTML = '';
        this.spans = this.chars.map(char => {
            const span = document.createElement('span');
            span.textContent = char;
            // небольшой отступ для пробелов
            if (char === ' ') span.style.marginRight = '6px';
            return span;
        });
        this.spans.forEach(span => this.display.appendChild(span));
    }

    // Активировать обработчик (начать приём ввода)
    start() {
        console.log('✅ TypingHandler started');
        this.active = true;
        this.input.disabled = false;
        this.input.value = '';
        this.input.focus();
        this.index = 0;
        this.completed = false;
        this.spans.forEach(s => s.classList.remove('correct', 'wrong'));
    }

    // Деактивировать
    stop() {
        this.active = false;
        this.input.disabled = true;
    }

    // Сброс с новым предложением
    reset(newSentence) {
        this.sentence = newSentence;
        this.chars = newSentence.split('');
        this._render();
        this.index = 0;
        this.completed = false;
        this.active = false;
    }

    // Обработка события input
    handleInput(e) {
        if (!this.active || this.completed) return;

        const val = e.target.value;
        const len = val.length;

        // Обработка Backspace (удаление символов)
        if (len < this.index) {
            const diff = this.index - len;
            for (let i = 0; i < diff; i++) {
                this.index--;
                if (this.spans[this.index]) {
                    this.spans[this.index].classList.remove('correct', 'wrong');
                }
                if (this.onBackspace) this.onBackspace(false);
            }
            return;
        }

        // Новые символы (обрабатываем по одному – последний введённый)
        if (len > this.index) {
            // Берём только последний введённый символ
            const newChar = val[len - 1];
            const target = this.chars[this.index];
            const correct = (newChar === target);

            if (correct) {
                this.spans[this.index].classList.add('correct');
                if (this.onCorrect) this.onCorrect();
            } else {
                this.spans[this.index].classList.add('wrong');
                if (this.onWrong) this.onWrong();
            }

            this.index++;

            // Проверка на завершение предложения
            if (this.index === this.chars.length) {
                this.completed = true;
                this.active = false;
                this.input.disabled = true;
                if (this.onComplete) this.onComplete();
            }
        }
    }
}