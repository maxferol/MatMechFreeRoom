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
    
    // Обновляем выбранную пару в map.js
    if (typeof window.updateSelectedPair === 'function') {
        window.updateSelectedPair(pair);
    }
    
    // Обновляем выбранную дату в map.js и загружаем данные
    if (typeof window.updateSelectedDate === 'function') {
        await window.updateSelectedDate(selectedDate);
    } else {
        // Fallback: используем старый метод
        if (typeof window.fetchBusyRooms === 'function') {
            const busyRooms = await window.fetchBusyRooms(date);
            if (typeof window.updateRoomsStatus === 'function') {
                window.updateRoomsStatus(busyRooms);
            }
        }
    }
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
                await updateRoomsStatusForSelection();
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
                await updateRoomsStatusForSelection();
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
            await updateRoomsStatusForSelection();
        });
    });
}

// Экспортируем функции для использования в map.js
window.selectedDate = selectedDate;
window.selectedPair = selectedPair;
window.formatDate = formatDate;
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