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
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    if (customDateInput) customDateInput.value = formattedToday;

    // Обработчики для кнопок "Сегодня" и "Завтра"
    dateBtns.forEach(btn => {
        if (btn.dataset.days !== undefined) {
            btn.addEventListener('click', () => {
                const days = parseInt(btn.dataset.days);
                const newDate = new Date();
                newDate.setDate(newDate.getDate() + days);
                selectedDate = newDate;

                dateBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Сбрасываем кастомную кнопку
                if (customDateBtn) {
                    customDateBtn.innerHTML = '📅 Выбрать';
                    customDateBtn.classList.remove('active');
                }

                console.log(`Выбрана дата: ${formatDate(selectedDate)}`);
                // Здесь вызовите функцию обновления расписания
                // updateScheduleForDate();
            });
        }
    });

    // Открытие кастомного выбора даты
    if (customDateBtn) {
        customDateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            customDateModal.classList.add('show');
        });
    }

    // Закрытие модалки
    if (closeDateModal) {
        closeDateModal.addEventListener('click', () => {
            customDateModal.classList.remove('show');
        });
    }

    // Закрытие по клику вне модалки
    if (customDateModal) {
        customDateModal.addEventListener('click', (e) => {
            if (e.target === customDateModal) {
                customDateModal.classList.remove('show');
            }
        });
    }

    // Применение выбранной даты
    if (applyCustomDate && customDateInput) {
        applyCustomDate.addEventListener('click', () => {
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
                // Здесь вызовите функцию обновления расписания
                // updateScheduleForDate();
            }
        });
    }

    // Обработчики выбора пары
    const pairBtns = document.querySelectorAll('.pair-btn');
    pairBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const pair = parseInt(btn.dataset.pair);
            selectedPair = pair;

            pairBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            console.log(`Выбрана пара: ${selectedPair}`);
            // Обновляем отображение (подсветку комнат для выбранной пары)
            if (typeof updateRoomsForSelectedPair === 'function') {
                updateRoomsForSelectedPair();
            }
        });
    });
}

// Функция форматирования даты
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Глобальные переменные
let selectedDate = new Date();
let selectedPair = null;

// Функция получения дня недели на русском
function getWeekday(date) {
    const weekdays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    return weekdays[date.getDay()];
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

    // Устанавливаем сегодняшнюю дату в input
    customDateInput.value = formatDate(selectedDate);

    dateBtns.forEach(btn => {
        if (btn.dataset.days !== undefined) {
            btn.addEventListener('click', () => {
                const days = parseInt(btn.dataset.days);
                const newDate = new Date();
                newDate.setDate(newDate.getDate() + days);
                selectedDate = newDate;

                // Обновляем активный класс
                dateBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Обновляем выбранную пару (если нужно перезагрузить расписание)
                updateScheduleForDate();
            });
        }
    });

    // Открытие кастомного выбора даты
    customDateBtn.addEventListener('click', () => {
        customDateModal.classList.add('show');
    });

    // Закрытие модалки
    closeDateModal.addEventListener('click', () => {
        customDateModal.classList.remove('show');
    });

    customDateModal.addEventListener('click', (e) => {
        if (e.target === customDateModal) {
            customDateModal.classList.remove('show');
        }
    });

    // Применение выбранной даты
    applyCustomDate.addEventListener('click', () => {
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
            const formattedDate = `${selectedDate.getDate()}.${selectedDate.getMonth() + 1}`;
            customDateBtn.innerHTML = `📅 ${formattedDate}`;
            customDateBtn.classList.add('active');

            customDateModal.classList.remove('show');
            updateScheduleForDate();
        }
    });

    // Обработчики выбора пары
    const pairBtns = document.querySelectorAll('.pair-btn');
    pairBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const pair = parseInt(btn.dataset.pair);
            selectedPair = pair;

            pairBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Обновляем отображение (подсветку комнат для выбранной пары)
            updateRoomsForSelectedPair();
        });
    });
}

// Функция обновления расписания для выбранной даты
async function updateScheduleForDate() {
    // Здесь будет логика загрузки расписания для конкретной даты
    console.log(`Загрузка расписания для ${formatDate(selectedDate)} (${getWeekday(selectedDate)})`);

    // Если нужно перезагрузить roomsStatus для выбранной даты
    // roomsStatus = await loadRoomsStatusForDate(formatDate(selectedDate));
    draw();
}

// Функция обновления комнат для выбранной пары
function updateRoomsForSelectedPair() {
    if (selectedPair !== null) {
        currentPair = selectedPair;
    } else {
        currentPair = getCurrentPair();
    }
    draw();
}

// Запускаем инициализацию после загрузки страницы
document.addEventListener('DOMContentLoaded', function () {
    initDateAndPairControls();
});

// Измените функцию getCurrentPair, чтобы учитывала выбранную пару
// (если пользователь выбрал пару вручную)
// В initData и setInterval нужно проверять, не выбрана ли пара вручную

// Вызовите initDateAndPairControls() в window.onload
// Добавьте эту строку в конец window.onload:
// initDateAndPairControls();