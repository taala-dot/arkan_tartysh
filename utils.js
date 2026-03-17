// utils.js – общие утилиты

// Вернуть случайное предложение из массива
export function getRandomSentence(sentences) {
    return sentences[Math.floor(Math.random() * sentences.length)];
}

// Форматировать время (дополнить нулями до 2 знаков)
export function formatTime(seconds) {
    return seconds.toString().padStart(2, '0');
}

// Расчёт WPM (здесь не используется напрямую, но может пригодиться)
export function calculateWPM(correctChars, seconds) {
    if (seconds === 0) return 0;
    return Math.round((correctChars / 5) / (seconds / 60));
}

// Расчёт точности
export function calculateAccuracy(correct, total) {
    if (total === 0) return 100;
    return Math.round((correct / total) * 100);
}