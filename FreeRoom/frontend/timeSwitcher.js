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
    const dateStr = formatDate(selectedDate);
    let pair = selectedPair;
    
    // Если пара не выбрана вручную, берем текущую или первую
    if (pair === null) {
        if (typeof window.getCurrentPairNumber === 'function') {
            pair = window.getCurrentPairNumber();
        }
        if (pair === null) {
            pair = 1;
            console.log('Нет активной пары, выбрана 1 пара по умолчанию');
        }
    }
    
    console.log(`Обновление: дата=${dateStr}, пара=${pair}`);
    
    // Проверяем, загружены ли данные для этой даты
    const currentDateInMap = window.currentDate ? formatDate(window.currentDate) : null;
    
    if (currentDateInMap !== dateStr) {
        // Дата изменилась - нужно загрузить новые данные с бэкенда
        console.log(`Дата изменилась с ${currentDateInMap} на ${dateStr}, загружаем данные с бэкенда`);
        if (typeof window.updateSelectedDate === 'function') {
            await window.updateSelectedDate(selectedDate);
        }
    } else {
        // Дата не изменилась - используем кэшированные данные
        console.log(`Дата не изменилась (${dateStr}), используем кэшированные данные`);
    }
    
    // Обновляем пару (просто перерисовка)
    if (typeof window.updateSelectedPair === 'function') {
        window.updateSelectedPair(pair);
    }
}

// Инициализация контролов даты и пары
function initDateAndPairControls() {
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
                selectedDate = newDate;

                dateBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

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

                dateBtns.forEach(btn => {
                    if (btn.dataset.days !== undefined) {
                        btn.classList.remove('active');
                    }
                });

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
            btn.classList.add('user-selected');

            console.log(`Выбрана пара: ${selectedPair}`);
            await updateRoomsStatusForSelection();
        });
    });
}

// Экспортируем функции
window.selectedDate = selectedDate;
window.selectedPair = selectedPair;
window.formatDate = formatDate;
window.updateRoomsStatusForSelection = updateRoomsStatusForSelection;

// Запускаем инициализацию после загрузки страницы
document.addEventListener('DOMContentLoaded', function () {
    initDateAndPairControls();
    
    // Устанавливаем начальную пару
    if (typeof window.getCurrentPairNumber === 'function') {
        const currentPairNum = window.getCurrentPairNumber();
        if (currentPairNum !== null) {
            selectedPair = currentPairNum;
            const pairBtns = document.querySelectorAll('.pair-btn');
            pairBtns.forEach(btn => {
                const pair = parseInt(btn.dataset.pair);
                if (pair === currentPairNum) {
                    btn.classList.add('active');
                }
            });
        } else {
            selectedPair = 1;
            const firstPairBtn = document.querySelector('.pair-btn[data-pair="1"]');
            if (firstPairBtn) {
                firstPairBtn.classList.add('active');
            }
            console.log('Нет активной пары, выбрана 1 пара по умолчанию');
        }
    }
    
    // Загружаем данные для начальной даты
    setTimeout(async () => {
        console.log(`Initial load for date: ${formatDate(selectedDate)}`);
        const dateStr = formatDate(selectedDate);
        
        // Принудительно загружаем данные для начальной даты
        if (typeof window.updateSelectedDate === 'function') {
            await window.updateSelectedDate(selectedDate);
        }
        
        // Устанавливаем пару
        if (typeof window.updateSelectedPair === 'function') {
            window.updateSelectedPair(selectedPair);
        }
    }, 500);
});