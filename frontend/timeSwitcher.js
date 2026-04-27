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

// Функция обновления статусов комнат для выбранной даты
// (вызывается ТОЛЬКО при смене даты)
async function updateRoomsStatusForDate() {
    const date = formatDate(selectedDate);
    
    console.log(`Обновление для даты: ${date}`);
    
    // Здесь должен быть запрос к бэкенду для получения расписания на конкретную дату
    // const response = await fetch(`/api/schedule?date=${date}`);
    // const scheduleData = await response.json();
    // window.roomsStatus = scheduleData;
    
    // Для демонстрации просто выводим сообщение
    console.log(`Для даты ${date} используется файл rooms.json`);
    
    // После загрузки новых данных обновляем отображение для текущей пары
    if (typeof updateViewForCurrentPair === 'function') {
        updateViewForCurrentPair();
    }
}

// Функция обновления отображения для текущей пары (без запросов)
function updateViewForCurrentPair() {
    if (!window.roomsStatus) {
        console.warn('roomsStatus не загружен');
        return;
    }
    
    // Обновляем currentPair
    if (selectedPair !== null) {
        window.currentPair = selectedPair;
    }
    
    // Обновляем кэш статусов в map.js, если функция доступна
    if (typeof window.updateRoomHasClassCacheForCurrentFloor === 'function') {
        window.updateRoomHasClassCacheForCurrentFloor();
        console.log(`Кэш обновлен для пары ${window.currentPair}`);
    }
    
    // ВАЖНО: Перерисовываем карту
    if (typeof draw === 'function') {
        draw();
        console.log(`Карта перерисована для пары ${window.currentPair}`);
    } else {
        console.warn('Функция draw не найдена');
    }
}

// Функция для смены пары (ТОЛЬКО переключение отображения, без запросов)
function switchPair(pairNumber) {
    selectedPair = pairNumber;
    
    console.log(`Переключено на пару ${pairNumber}`);
    
    // Вызываем функцию из map.js для обновления кэша и перерисовки
    if (typeof window.setSelectedPair === 'function') {
        window.setSelectedPair(pairNumber);
    } else {
        console.warn('window.setSelectedPair не найдена');
        // Fallback: прямое обновление
        if (typeof window.currentPair !== 'undefined') {
            window.currentPair = pairNumber;
        }
        if (typeof draw === 'function') {
            draw();
        }
    }
}

// Функция для смены даты (с запросом к бэкенду)
async function switchDate(date) {
    selectedDate = date;
    
    console.log(`Переключено на дату ${formatDate(selectedDate)}`);
    
    // Запрашиваем расписание для новой даты
    await updateRoomsStatusForDate();
    
    // После обновления данных обновляем отображение
    updateViewForCurrentPair();
}

// Функция для получения номера текущей пары
function getCurrentPairNumber() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    if (currentTime >= 9 * 60 && currentTime < 10 * 60 + 30) return 1;
    if (currentTime >= 10 * 60 + 30 && currentTime < 12 * 60 + 10) return 2;
    if (currentTime >= 12 * 60 + 20 && currentTime < 13 * 60 + 50) return 3;
    if (currentTime >= 14 * 60 + 30 && currentTime < 16 * 60) return 4;
    if (currentTime >= 16 * 60 + 10 && currentTime < 17 * 60 + 40) return 5;
    if (currentTime >= 17 * 60 + 50 && currentTime < 19 * 60 + 20) return 6;

    return null;
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
                
                await switchDate(newDate);

                // Обновляем активный класс
                dateBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Сбрасываем кастомную кнопку
                if (customDateBtn) {
                    customDateBtn.innerHTML = '📅 Выбрать';
                    customDateBtn.classList.remove('active');
                }
            });
        }
    });

    // Открытие кастомного выбора даты
    if (customDateBtn) {
        customDateBtn.addEventListener('click', () => {
            customDateModal.classList.add('show');
        });
    }

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

    if (applyCustomDate && customDateInput) {
        applyCustomDate.addEventListener('click', async () => {
            const dateValue = customDateInput.value;
            if (dateValue) {
                const newDate = new Date(dateValue);
                await switchDate(newDate);

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
            }
        });
    }

    // Обработчики выбора пары (только переключение отображения, без запросов)
    const pairBtns = document.querySelectorAll('.pair-btn');
    pairBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const pair = parseInt(btn.dataset.pair);
            
            // Просто переключаем пару без запросов
            switchPair(pair);

            pairBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Добавляем функции в window для использования в map.js
window.switchPair = switchPair;
window.switchDate = switchDate;
window.updateViewForCurrentPair = updateViewForCurrentPair;
window.getCurrentPairNumber = getCurrentPairNumber;
window.formatDate = formatDate;
window.selectedDate = selectedDate;
window.selectedPair = selectedPair;

// Запускаем инициализацию после загрузки страницы
document.addEventListener('DOMContentLoaded', function () {
    initDateAndPairControls();
    
    // Устанавливаем начальную пару (текущую)
    const currentPairNum = getCurrentPairNumber();
    if (currentPairNum) {
        selectedPair = currentPairNum;
        if (typeof window.currentPair !== 'undefined') {
            window.currentPair = currentPairNum;
        }
        
        // Подсвечиваем кнопку текущей пары
        const pairBtns = document.querySelectorAll('.pair-btn');
        pairBtns.forEach(btn => {
            const pair = parseInt(btn.dataset.pair);
            if (pair === currentPairNum) {
                btn.classList.add('active');
            }
        });
    }
    
    // Обновляем отображение для начальных значений
    setTimeout(() => {
        updateViewForCurrentPair();
    }, 500);
});