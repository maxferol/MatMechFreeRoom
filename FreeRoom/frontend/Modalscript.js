// Модальное окно пользовательского меню
const modal = document.getElementById('myModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeBtn = document.querySelector('#myModal .close');

// Функция для открытия модального окна
function openModal() {
    updateUserModal();
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Функция для закрытия модального окна
function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Закрытие при клике вне модального окна
function handleOutsideClick(event) {
    if (event.target === modal) {
        closeModal();
    }
}

// Закрытие по клавише Escape
function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        if (modal.style.display === 'block') closeModal();
        const roomModal = document.getElementById('myModalRoom');
        if (roomModal && roomModal.style.display === 'block') closeRoomModal();
        const scheduleModal = document.getElementById('scheduleModal');
        if (scheduleModal && scheduleModal.style.display === 'block') closeScheduleModal();
    }
}

// Назначаем обработчики
if (openModalBtn) openModalBtn.addEventListener('click', openModal);
if (closeBtn) closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', handleOutsideClick);
document.addEventListener('keydown', handleEscapeKey);

// Функции для модального окна комнаты
let currentRoomName = '';

function openRoomModal(roomName) {
    currentRoomName = roomName;
    const roomModal = document.getElementById('myModalRoom');
    const cabinetElement = document.querySelector('#myModalRoom .cabinet');
    const bookingDateInput = document.getElementById('bookingDate');
    const weekdaySpan = document.getElementById('weekdayDisplay');
    
    if (cabinetElement) cabinetElement.textContent = roomName;
    
    // Устанавливаем сегодняшнюю дату и день недели
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    if (bookingDateInput) bookingDateInput.value = formattedDate;
    updateWeekdayDisplay(bookingDateInput ? bookingDateInput.value : formattedDate, weekdaySpan);
    
    if (roomModal) roomModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function updateWeekdayDisplay(dateValue, weekdaySpan) {
    if (!weekdaySpan) return;
    const weekdays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const date = new Date(dateValue);
    const weekday = weekdays[date.getDay()];
    weekdaySpan.textContent = `(${weekday})`;
}

function closeRoomModal() {
    const roomModal = document.getElementById('myModalRoom');
    if (roomModal) roomModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Обновляем день недели при смене даты
const bookingDateInput = document.getElementById('bookingDate');
const weekdaySpan = document.getElementById('weekdayDisplay');
if (bookingDateInput) {
    bookingDateInput.addEventListener('change', () => {
        updateWeekdayDisplay(bookingDateInput.value, weekdaySpan);
    });
}

// Обработчик для кнопки бронирования в модальном окне комнаты
const makeBronBtn = document.querySelector('.makeBron');
if (makeBronBtn) {
    makeBronBtn.addEventListener('click', () => {
        const cabinet = document.querySelector('#myModalRoom .cabinet');
        const date = document.getElementById('bookingDate')?.value || '';
        const timeSelect = document.getElementById('bookingTime');
        const pairNumber = timeSelect?.value || '';
        let pairText = '';
        if (timeSelect && timeSelect.selectedIndex >= 0) {
            pairText = timeSelect.options[timeSelect.selectedIndex]?.text || '';
        }
        
        alert(`Бронирование ${cabinet ? cabinet.textContent : 'комнаты'}\nДата: ${date}\n${pairText} - функция в разработке`);
        closeRoomModal();
    });
}

// Закрытие модального окна комнаты по крестику
const roomCloseBtn = document.querySelector('#myModalRoom .close');
if (roomCloseBtn) roomCloseBtn.addEventListener('click', closeRoomModal);

// МОБИЛЬНЫЕ КНОПКИ ЗАКРЫТИЯ
function addMobileCloseButtons() {
    const modals = ['myModalRoom', 'scheduleModal'];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal && !modal.querySelector('.close-mobile')) {
            const mobileCloseBtn = document.createElement('button');
            mobileCloseBtn.className = 'close-mobile';
            mobileCloseBtn.innerHTML = '<i class="fas fa-times"></i>';
            mobileCloseBtn.onclick = () => {
                if (modalId === 'myModalRoom') closeRoomModal();
                if (modalId === 'scheduleModal') closeScheduleModal();
            };
            modal.querySelector('.modal-content')?.appendChild(mobileCloseBtn);
        }
    });
}

// Закрытие по клику вне окна комнаты
window.addEventListener('click', (event) => {
    const roomModal = document.getElementById('myModalRoom');
    if (event.target === roomModal) closeRoomModal();
    const scheduleModal = document.getElementById('scheduleModal');
    if (event.target === scheduleModal) closeScheduleModal();
});

// ========== РАСПИСАНИЕ НА ТЕКУЩИЙ ДЕНЬ ==========

// Данные о парах (время)
const PAIRS_TIME = {
    1: "9:00 - 10:30",
    2: "10:40 - 12:10",
    3: "12:50 - 14:20",
    4: "14:30 - 16:00",
    5: "16:10 - 17:40",
    6: "17:50 - 19:20"
};

// Форматирование текущей даты
function formatDateForDisplay(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const weekdays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    return `${weekdays[date.getDay()]}, ${day}.${month}`;
}

// Загрузка расписания для комнаты на текущий день
async function loadScheduleForToday(roomName) {
    const tbody = document.getElementById('scheduleTableBody');
    const scheduleDateDiv = document.getElementById('scheduleDate');
    
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Загрузка расписания...</td></tr>';
    }
    
    try {
        // Загружаем JSON с расписанием
        const response = await fetch('../parsing/schedule.json');
        const scheduleData = await response.json();
        
        const today = new Date();
        const formattedDate = formatDateForDisplay(today);
        
        // Обновляем заголовок с датой
        if (scheduleDateDiv) {
            scheduleDateDiv.innerHTML = formattedDate;
        }
        
        // Получаем расписание для конкретной комнаты
        const roomSchedule = scheduleData[roomName];
        
        if (!roomSchedule) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Расписание для этой аудитории не найдено</td></tr>';
            return;
        }
        
        // Генерируем таблицу для всех 6 пар
        let html = '';
        for (let pairNum = 1; pairNum <= 6; pairNum++) {
            const pairData = roomSchedule[String(pairNum)];
            const isBusy = pairData && pairData.subject !== null && pairData.subject !== undefined;
            
            let statusClass = isBusy ? 'busy' : 'free';
            let statusText = isBusy ? 
                '<span class="status-badge status-busy">📖 Занято</span>' : 
                '<span class="status-badge status-free">✅ Свободно</span>';
            
            let subject = isBusy ? pairData.subject : '—';
            let teacher = isBusy && pairData.teacher ? pairData.teacher : '—';
            
            html += `
                <tr class="${statusClass}">
                    <td class="pair-number"><strong>${pairNum}</strong></td>
                    <td class="pair-time">${PAIRS_TIME[pairNum]}</td>
                    <td class="subject-name">${subject}</td>
                    <td class="teacher-name">${teacher}</td>
                    <td>${statusText}</td>
                </tr>
            `;
        }
        
        tbody.innerHTML = html;
        
    } catch (error) {
        console.error('Ошибка загрузки расписания:', error);
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Ошибка загрузки расписания</td></tr>';
        }
    }
}

// Открытие модального окна с расписанием
async function openScheduleModal(roomName) {
    const scheduleModal = document.getElementById('scheduleModal');
    const scheduleTitle = document.getElementById('scheduleRoomTitle');
    
    if (scheduleTitle) scheduleTitle.textContent = `Расписание кабинета ${roomName}`;
    if (scheduleModal) scheduleModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    addMobileCloseButtons();
    await loadScheduleForToday(roomName);
}

function closeScheduleModal() {
    const scheduleModal = document.getElementById('scheduleModal');
    if (scheduleModal) scheduleModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Обработчики для модального окна расписания
function initScheduleModal() {
    const closeScheduleBtn = document.querySelector('#scheduleModal .close-schedule');
    if (closeScheduleBtn) closeScheduleBtn.addEventListener('click', closeScheduleModal);
}

// Добавляем обработчик для кнопки "Смотреть расписание"
document.addEventListener('DOMContentLoaded', () => {
    initScheduleModal();
    addMobileCloseButtons();
    
    // Назначаем обработчик на кнопку просмотра расписания
    const observer = new MutationObserver(() => {
        const viewScheduleBtn = document.querySelector('.viewScheduleBtn');
        if (viewScheduleBtn && !viewScheduleBtn.hasAttribute('data-listener')) {
            viewScheduleBtn.setAttribute('data-listener', 'true');
            viewScheduleBtn.addEventListener('click', () => {
                if (currentRoomName) {
                    openScheduleModal(currentRoomName);
                }
            });
        }
        addMobileCloseButtons();
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
});

// Функция для обновления модального окна пользователя (добавить в конец файла)
function updateUserModal() {
    const userData = localStorage.getItem('user');
    const modalTitle = document.querySelector('#myModal .modal-title');
    const authButtons = document.querySelector('#myModal .auth-buttons');
    
    if (userData && modalTitle && authButtons) {
        try {
            const user = JSON.parse(userData);
            if (user.login) {
                // Пользователь авторизован - показываем имя
                modalTitle.textContent = `Привет, ${user.login}!`;
                authButtons.innerHTML = `
                    <button class="login-btn" id="logoutBtn">Выйти из аккаунта</button>
                `;
                
                // Добавляем обработчик выхода
                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) {
                    logoutBtn.onclick = () => {
                        localStorage.removeItem('user');
                        updateUserModal();
                        closeModal();
                        alert('Вы вышли из аккаунта');
                    };
                }
            }
        } catch(e) {
            console.error('Ошибка парсинга user data:', e);
        }
    } else if (modalTitle && authButtons) {
        // Пользователь не авторизован - показываем кнопки входа/регистрации
        modalTitle.textContent = 'Вход в аккаунт';
        authButtons.innerHTML = `
            <a href="Login.html" class="login-btn">Вход</a>
            <a href="Registration.html" class="register-btn">Регистрация</a>
        `;
    }
}

// Функция для проверки авторизации при загрузке страницы
function checkAuthOnLoad() {
    updateUserModal();
}

// Вызываем при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuthOnLoad);
} else {
    checkAuthOnLoad();
}

// Экспортируем функции для глобального использования
window.openScheduleModal = openScheduleModal;
window.closeScheduleModal = closeScheduleModal;
window.openRoomModal = openRoomModal;