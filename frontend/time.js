// Общие данные о парах
const PAIRS_DATA = [
    { number: 1, start: 9 * 60, end: 10 * 60 + 30, text: "9:00 - 10:30" },
    { number: 2, start: 10 * 60 + 30, end: 12 * 60 + 10, text: "10:40 - 12:10" },
    { number: 3, start: 12 * 60 + 50, end: 14 * 60 + 20, text: "12:50 - 14:20" },
    { number: 4, start: 14 * 60 + 30, end: 16 * 60, text: "14:30 - 16:00" },
    { number: 5, start: 16 * 60 + 10, end: 17 * 60 + 40, text: "16:10 - 17:40" },
    { number: 6, start: 17 * 60 + 50, end: 19 * 60 + 20, text: "17:50 - 19:20" }
];

// Получить номер текущей пары
window.getCurrentPairNumber = function() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    for (let pair of PAIRS_DATA) {
        if (currentTime >= pair.start && currentTime < pair.end) {
            return pair.number;
        }
    }
    return null;
}

// Получить текст текущей пары
window.getCurrentPair = function() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    for (let pair of PAIRS_DATA) {
        if (currentTime >= pair.start && currentTime < pair.end) {
            return pair.text;
        }
    }
    return "Сейчас пар нет";
}

// Обновление текста на странице
function updateScheduleText() {
    const currentPair = window.getCurrentPair();
    const scheduleElement = document.getElementById('current-schedule');
    
    if (scheduleElement) {
        scheduleElement.textContent = currentPair;
    }
}

// Подсветка текущей пары в свитчере
function highlightCurrentPair() {
    const currentPairNumber = window.getCurrentPairNumber();
    const pairBtns = document.querySelectorAll('.pair-btn');
    
    if (currentPairNumber && pairBtns.length) {
        pairBtns.forEach(btn => {
            const btnPair = parseInt(btn.dataset.pair);
            if (btnPair === currentPairNumber) {
                btn.classList.add('active');
                if (typeof window.selectedPair !== 'undefined') {
                    window.selectedPair = currentPairNumber;
                }
            } else if (!btn.classList.contains('user-selected')) {
                btn.classList.remove('active');
            }
        });
    }
}

// Запускаем обновление
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        updateScheduleText();
        highlightCurrentPair();
    });
} else {
    updateScheduleText();
    highlightCurrentPair();
}

// Обновляем каждую минуту
setInterval(() => {
    updateScheduleText();
    highlightCurrentPair();
}, 60000);