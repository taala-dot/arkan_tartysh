// leaderboard.js – работа с localStorage и отображение топ-10
const STORAGE_KEY = 'kyrgyzTugOfWar';
const MAX_ENTRIES = 10;

// Получить текущую таблицу
export function getLeaderboard() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

// Сохранить новый результат
export function saveScore(name, wpm, accuracy) {
    console.log('Сохранение в leaderboard:', { name, wpm, accuracy });
    if (!name.trim()) name = 'Аноним';
    const leaderboard = getLeaderboard();
    leaderboard.push({
        name: name.trim(),
        wpm: Number(wpm),
        accuracy: Number(accuracy),
        date: new Date().toLocaleDateString()
    });
    // Сортировка по убыванию WPM, затем по точности
    leaderboard.sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy);
    const trimmed = leaderboard.slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    console.log('Новая таблица:', trimmed);
    return trimmed;
}

// Отрисовать таблицу в DOM
export function renderLeaderboard(listElement) {
    console.log('Рендеринг leaderboard');
    if (!listElement) {
        console.error('renderLeaderboard: передан некорректный элемент');
        return;
    }
    const entries = getLeaderboard();
    listElement.innerHTML = '';
    if (entries.length === 0) {
        listElement.innerHTML = '<li>Рекорд жок. Ойной баштаңыз!</li>';
        return;
    }
    entries.forEach((entry, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${index + 1}. ${entry.name}</span> <span>${entry.wpm} WPM (${entry.accuracy}%)</span>`;
        listElement.appendChild(li);
    });
}