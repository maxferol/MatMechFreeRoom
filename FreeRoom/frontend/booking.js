// booking.js - функционал бронирования аудиторий

const API_BASE_URL = 'http://localhost:5000/api';

// Текущая выбранная комната
let currentBookingRoom = null;

// Функция открытия модального окна бронирования
async function openBookingModal(roomName) {
    currentBookingRoom = roomName;
    
    const roomModal = document.getElementById('myModalRoom');
    const cabinetElement = document.querySelector('#myModalRoom .cabinet');
    const bookingDateInput = document.getElementById('bookingDate');
    const weekdaySpan = document.getElementById('weekdayDisplay');
    
    if (cabinetElement) cabinetElement.textContent = roomName;
    
    // Устанавливаем сегодняшнюю дату
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    if (bookingDateInput) {
        bookingDateInput.value = formattedDate;
        updateWeekdayDisplay(formattedDate, weekdaySpan);
    }
    
    // Сбрасываем выбор пары на первую доступную
    const timeSelect = document.getElementById('bookingTime');
    if (timeSelect && timeSelect.options.length > 0) {
        timeSelect.selectedIndex = 0;
    }
    
    if (roomModal) roomModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Функция обновления дня недели
function updateWeekdayDisplay(dateValue, weekdaySpan) {
    if (!weekdaySpan) return;
    const weekdays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const date = new Date(dateValue);
    const weekday = weekdays[date.getDay()];
    weekdaySpan.textContent = `(${weekday})`;
}

// Функция бронирования комнаты
// Функция бронирования комнаты
async function bookRoom() {
    console.log('bookRoom called, currentBookingRoom:', currentBookingRoom);
    
    if (!currentBookingRoom) {
        alert('Ошибка: комната не выбрана');
        return;
    }
    
    const date = document.getElementById('bookingDate')?.value;
    const timeSelect = document.getElementById('bookingTime');
    
    if (!timeSelect) {
        alert('Ошибка: не найден select с выбором пары');
        return;
    }
    
    const lessonNumber = parseInt(timeSelect.value);
    const selectedOption = timeSelect.options[timeSelect.selectedIndex];
    const lessonText = selectedOption ? selectedOption.text : '';
    
    if (!date) {
        alert('Пожалуйста, выберите дату');
        return;
    }
    
    if (isNaN(lessonNumber) || lessonNumber < 1 || lessonNumber > 6) {
        alert('Пожалуйста, выберите пару');
        return;
    }
    
    // Получаем текущего пользователя из localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        alert('Пожалуйста, войдите в аккаунт для бронирования');
        window.location.href = 'Login.html';
        return;
    }
    
    const user = JSON.parse(userStr);
    
    // ПРАВИЛЬНЫЙ формат данных для DTO
    const bookingData = {
        login: user.login,              // <- ИСПРАВЛЕНО: было userLogin
        roomNumber: currentBookingRoom,
        date: date,
        lessonNumber: lessonNumber
    };
    
    console.log('Отправка бронирования:', JSON.stringify(bookingData, null, 2));
    
    const bookBtn = document.querySelector('.makeBron');
    const originalText = bookBtn?.innerText;
    
    try {
        if (bookBtn) {
            bookBtn.disabled = true;
            bookBtn.innerText = 'Бронирование...';
        }
        
        const response = await fetch(`${API_BASE_URL}/users/booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData),
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('Success:', result);
            alert(`✅ Успешно!\nКомната ${currentBookingRoom} забронирована на ${lessonNumber}-ю пару (${lessonText})\nДата: ${date}`);
            closeRoomModal();
            
            // Обновляем статус комнаты на карте
            if (typeof window.updateRoomsStatusForSelection === 'function') {
                setTimeout(async () => {
                    await window.updateRoomsStatusForSelection();
                }, 500);
            }
        } else {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            
            let errorMessage = 'Не удалось забронировать';
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorJson.error || errorMessage;
            } catch {
                errorMessage = errorText || errorMessage;
            }
            
            if (response.status === 400) {
                alert(`❌ Ошибка в данных запроса: ${errorMessage}`);
            } else if (response.status === 409) {
                alert(`❌ Не удалось забронировать\nАудитория ${currentBookingRoom} уже занята на ${lessonNumber}-ю пару\nДата: ${date}\nПожалуйста, выберите другое время.`);
            } else {
                alert(`❌ Ошибка: ${errorMessage}`);
            }
        }
    } catch (error) {
        console.error('Ошибка бронирования:', error);
        alert('❌ Ошибка соединения с сервером: ' + error.message);
    } finally {
        if (bookBtn) {
            bookBtn.disabled = false;
            bookBtn.innerText = originalText;
        }
    }
}

// Показать модальное окно с результатом
function showResultModal(title, message, type) {
    // Удаляем существующее окно результата, если есть
    const existingModal = document.getElementById('resultModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.id = 'resultModal';
    modal.className = 'modal result-modal';
    modal.style.display = 'block';
    
    // Выбираем цвет иконки в зависимости от типа
    let iconHtml = '';
    let iconColor = '';
    
    switch(type) {
        case 'success':
            iconHtml = '<i class="fas fa-check-circle" style="font-size: 60px; color: #4caf50;"></i>';
            break;
        case 'error':
            iconHtml = '<i class="fas fa-times-circle" style="font-size: 60px; color: #f44336;"></i>';
            break;
        case 'auth':
            iconHtml = '<i class="fas fa-exclamation-triangle" style="font-size: 60px; color: #ff9800;"></i>';
            break;
        default:
            iconHtml = '<i class="fas fa-info-circle" style="font-size: 60px; color: #2196f3;"></i>';
    }
    
    modal.innerHTML = `
        <div class="modal-content result-modal-content">
            <span class="close-result">&times;</span>
            <div style="text-align: center; margin-bottom: 20px;">
                ${iconHtml}
            </div>
            <h3 style="text-align: center; margin-bottom: 15px;">${title}</h3>
            <p style="text-align: center; line-height: 1.5; white-space: pre-line;">${message}</p>
            ${type === 'auth' ? '<div style="text-align: center; margin-top: 20px;"><button id="goToLoginBtn" class="login-redirect-btn">Перейти к входу</button></div>' : ''}
            <div style="text-align: center; margin-top: 20px;">
                <button id="closeResultBtn" class="close-result-btn">Закрыть</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Обработчики закрытия
    const closeBtn = modal.querySelector('.close-result');
    const closeResultBtn = modal.querySelector('#closeResultBtn');
    const goToLoginBtn = modal.querySelector('#goToLoginBtn');
    
    const closeModal = () => {
        modal.remove();
        document.body.style.overflow = 'auto';
    };
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeResultBtn) closeResultBtn.addEventListener('click', closeModal);
    
    if (goToLoginBtn) {
        goToLoginBtn.addEventListener('click', () => {
            window.location.href = 'Login.html';
        });
    }
    
    // Закрытие по клику вне окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Закрытие по Escape
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

// Закрытие модального окна комнаты
function closeRoomModal() {
    const roomModal = document.getElementById('myModalRoom');
    if (roomModal) roomModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentBookingRoom = null;
}

// Закрытие модального окна расписания
function closeScheduleModal() {
    const scheduleModal = document.getElementById('scheduleModal');
    if (scheduleModal) scheduleModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Обновление дня недели при смене даты
function initDateChangeListener() {
    const bookingDateInput = document.getElementById('bookingDate');
    const weekdaySpan = document.getElementById('weekdayDisplay');
    
    if (bookingDateInput) {
        bookingDateInput.addEventListener('change', () => {
            updateWeekdayDisplay(bookingDateInput.value, weekdaySpan);
        });
    }
}

// Инициализация обработчиков событий
document.addEventListener('DOMContentLoaded', () => {
    initDateChangeListener();
    
    // Обработчик кнопки бронирования
    const makeBronBtn = document.querySelector('.makeBron');
    if (makeBronBtn) {
        // Удаляем старый обработчик, если есть
        const newBtn = makeBronBtn.cloneNode(true);
        makeBronBtn.parentNode.replaceChild(newBtn, makeBronBtn);
        newBtn.addEventListener('click', bookRoom);
    }
    
    // Обработчик кнопки просмотра расписания
    const viewScheduleBtn = document.querySelector('.viewScheduleBtn');
    if (viewScheduleBtn) {
        const newViewBtn = viewScheduleBtn.cloneNode(true);
        viewScheduleBtn.parentNode.replaceChild(newViewBtn, viewScheduleBtn);
        newViewBtn.addEventListener('click', () => {
            if (currentBookingRoom) {
                // Вызываем функцию просмотра расписания из Modalscript.js
                if (typeof window.openScheduleModal === 'function') {
                    window.openScheduleModal(currentBookingRoom);
                }
            }
        });
    }
    
    // Закрытие модального окна по крестику
    const closeBtn = document.querySelector('#myModalRoom .close');
    if (closeBtn) {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.addEventListener('click', closeRoomModal);
    }
    
    // Закрытие по клику вне окна комнаты
    window.addEventListener('click', (event) => {
        const roomModal = document.getElementById('myModalRoom');
        if (event.target === roomModal) closeRoomModal();
        
        const scheduleModal = document.getElementById('scheduleModal');
        if (event.target === scheduleModal) closeScheduleModal();
    });
    
    // Закрытие по Escape
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeRoomModal();
            closeScheduleModal();
        }
    });
    
    // Отключаем старый обработчик кнопки бронирования из Modalscript.js
    // путем переопределения
    if (window.originalMakeBronHandler) {
        // Если есть старый обработчик, он уже заменен
    }
});

// Экспортируем функции для использования в других файлах
window.openBookingModal = openBookingModal;
window.closeRoomModal = closeRoomModal;
window.closeScheduleModal = closeScheduleModal;