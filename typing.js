// typing.js – полностью переработан, без ошибок
export class TypingHandler {
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
        this.index = 0;
        this.active = false;
        this.completed = false;

        this._render();
    }

    _render() {
        this.display.innerHTML = '';
        this.spans = this.chars.map(char => {
            const span = document.createElement('span');
            span.textContent = char;
            if (char === ' ') span.style.marginRight = '6px';
            return span;
        });
        this.spans.forEach(span => this.display.appendChild(span));
    }

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

    stop() {
        this.active = false;
        this.input.disabled = true;
    }

    reset(newSentence) {
        this.sentence = newSentence;
        this.chars = newSentence.split('');
        this._render();
        this.index = 0;
        this.completed = false;
        this.active = false;
    }

    handleInput(e) {
        if (!this.active || this.completed) return;

        const val = e.target.value;
        const len = val.length;

        // Backspace
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

        // Новые символы (обрабатываем по одному)
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

            // Проверка завершения
            if (this.index === this.chars.length) {
                this.completed = true;
                this.active = false;
                this.input.disabled = true;
                if (this.onComplete) this.onComplete();
            }
        }
    }
}