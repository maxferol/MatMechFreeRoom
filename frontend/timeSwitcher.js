// Глобальные переменные
let selectedDate = new Date();
let selectedPair = null;

// Функция форматирования даты
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Функция получения дня недели на русском
function getWeekday(date) {
    const weekdays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    return weekdays[date.getDay()];
}

// Функция обновления статусов комнат для выбранных даты и пары
async function updateRoomsStatusForSelection() {
    const date = formatDate(selectedDate);
    const pair = selectedPair !== null ? selectedPair : (window.getCurrentPairNumber ? window.getCurrentPairNumber() : null);
    
    if (!pair) {
        console.log('Нет выбранной пары');
        return;
    }
    
    console.log(`Обновление статусов: дата=${date}, пара=${pair}`);
    
    // Вызываем функцию из map.js для получения занятых комнат
    if (typeof window.fetchBusyRooms === 'function') {
        const busyRooms = await window.fetchBusyRooms(date, pair);
        
        // Обновляем roomsStatus в map.js
        if (typeof window.updateRoomsStatus === 'function') {
            window.updateRoomsStatus(busyRooms, pair);
        } else {
            // Прямое обновление, если функции нет
            if (typeof roomsStatus !== 'undefined') {
                window.roomsStatus = {};
                busyRooms.forEach(roomName => {
                    window.roomsStatus[roomName] = [pair];
                });
            }
        }
        
        // Перерисовываем карту
        if (typeof draw === 'function') {
            draw();
        }
    } else {
        console.warn('fetchBusyRooms не найдена в map.js');
    }
}

// Функция обновления комнат для выбранной пары
async function updateRoomsForSelectedPair() {
    if (selectedPair !== null) {
        if (typeof currentPair !== 'undefined') {
            window.currentPair = selectedPair;
        }
    } else {
        if (typeof window.getCurrentPairNumber === 'function') {
            window.currentPair = window.getCurrentPairNumber();
        }
    }
    
    // Обновляем статусы для выбранной пары и текущей даты
    await updateRoomsStatusForSelection();
}

// Функция обновления для выбранной даты
async function updateScheduleForDate() {
    console.log(`Загрузка расписания для ${formatDate(selectedDate)} (${getWeekday(selectedDate)})`);
    
    // Обновляем статусы для выбранной даты и текущей пары
    await updateRoomsStatusForSelection();
}

// Инициализация контролов даты и пары
function initDateAndPairControls() {
    // Обработчики кнопок даты
    const dateBtns = document.querySelectorAll('.date-btn');
    const customDateBtn = document.getElementById('customDateBtn');
    const customDateModal = document.getElementById('customDateModal');
    const closeDateModal = document.querySelector('.close-date-modal');
    const applyCustomDate = document.getElementById('applyCustomDate');
    const customDateInput = document.getElementById('customDateInput');

    if (!customDateBtn || !customDateModal) return;

    // Устанавливаем сегодняшнюю дату в input
    if (customDateInput) {
        customDateInput.value = formatDate(selectedDate);
    }

    // Обработчики для кнопок "Сегодня" и "Завтра"
    dateBtns.forEach(btn => {
        if (btn.dataset.days !== undefined) {
            btn.addEventListener('click', async () => {
                const days = parseInt(btn.dataset.days);
                const newDate = new Date();
                newDate.setDate(newDate.getDate() + days);
                selectedDate = newDate;

                // Обновляем активный класс
                dateBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Сбрасываем кастомную кнопку
                if (customDateBtn) {
                    customDateBtn.innerHTML = '📅 Выбрать';
                    customDateBtn.classList.remove('active');
                }

                console.log(`Выбрана дата: ${formatDate(selectedDate)}`);
                await updateScheduleForDate();
            });
        }
    });

    // Открытие кастомного выбора даты
    customDateBtn.addEventListener('click', () => {
        customDateModal.classList.add('show');
    });

    // Закрытие модалки
    if (closeDateModal) {
        closeDateModal.addEventListener('click', () => {
            customDateModal.classList.remove('show');
        });
    }

    if (customDateModal) {
        customDateModal.addEventListener('click', (e) => {
            if (e.target === customDateModal) {
                customDateModal.classList.remove('show');
            }
        });
    }

    // Применение выбранной даты
    if (applyCustomDate && customDateInput) {
        applyCustomDate.addEventListener('click', async () => {
            const dateValue = customDateInput.value;
            if (dateValue) {
                selectedDate = new Date(dateValue);

                // Деактивируем все стандартные кнопки
                dateBtns.forEach(btn => {
                    if (btn.dataset.days !== undefined) {
                        btn.classList.remove('active');
                    }
                });

                // Меняем текст кнопки выбора даты
                const dateParts = dateValue.split('-');
                const formattedDate = `${dateParts[2]}.${dateParts[1]}`;
                customDateBtn.innerHTML = `📅 ${formattedDate}`;
                customDateBtn.classList.add('active');

                customDateModal.classList.remove('show');
                console.log(`Выбрана кастомная дата: ${formatDate(selectedDate)}`);
                await updateScheduleForDate();
            }
        });
    }

    // Обработчики выбора пары
    const pairBtns = document.querySelectorAll('.pair-btn');
    pairBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const pair = parseInt(btn.dataset.pair);
            selectedPair = pair;

            pairBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            console.log(`Выбрана пара: ${selectedPair}`);
            await updateRoomsForSelectedPair();
        });
    });
}

// Экспортируем функции для использования в map.js
window.selectedDate = selectedDate;
window.selectedPair = selectedPair;
window.formatDate = formatDate;
window.updateScheduleForDate = updateScheduleForDate;
window.updateRoomsForSelectedPair = updateRoomsForSelectedPair;
window.updateRoomsStatusForSelection = updateRoomsStatusForSelection;

// Запускаем инициализацию после загрузки страницы
document.addEventListener('DOMContentLoaded', function () {
    initDateAndPairControls();
    
    // Устанавливаем начальную пару (текущую)
    if (typeof window.getCurrentPairNumber === 'function') {
        const currentPairNum = window.getCurrentPairNumber();
        if (currentPairNum) {
            selectedPair = currentPairNum;
            // Подсвечиваем кнопку текущей пары
            const pairBtns = document.querySelectorAll('.pair-btn');
            pairBtns.forEach(btn => {
                const pair = parseInt(btn.dataset.pair);
                if (pair === currentPairNum) {
                    btn.classList.add('active');
                }
            });
        }
    }
    
    // Загружаем статусы для начальных значений
    setTimeout(async () => {
        await updateRoomsStatusForSelection();
    }, 500);
});