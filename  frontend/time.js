function getCurrentPair() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Пары с временными интервалами
    const pairs = [
        { start: 9 * 60, end: 10 * 60 + 30, text: "9:00 - 10:30" },
        { start: 10 * 60 + 40, end: 12 * 60 + 10, text: "10:40 - 12:10" },
        { start: 12 * 60 + 50, end: 14 * 60 + 20, text: "12:50 - 14:20" },
        { start: 14 * 60 + 20, end: 16 * 60, text: "14:30 - 16:00" },      // Исправлено: 14:30-16:00
        { start: 16 * 60, end: 17 * 60 + 40, text: "16:10 - 17:40" },  // Исправлено: 16:10-17:40
        { start: 17 * 60 + 50, end: 19 * 60 + 20, text: "17:50 - 19:20" }    // Исправлено: 17:50-19:20
    ];
    
    for (let pair of pairs) {
        if (currentTime >= pair.start && currentTime < pair.end) {
            return pair.text;
        }
    }
    
    return "Пар нет";
}

// Обновление текста на странице
function updateScheduleText() {
    const currentPair = getCurrentPair();
    const scheduleElement = document.getElementById('current-schedule'); // Укажите ID вашего элемента
    
    if (scheduleElement) {
        scheduleElement.textContent = currentPair;
    }
}

// Запускаем обновление
updateScheduleText();

// Обновляем каждую минуту
setInterval(updateScheduleText, 60000);