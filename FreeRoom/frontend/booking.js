// booking.js - функционал бронирования аудиторий

const API_BASE_URL = 'https://freeroom-backend.onrender.com/api';

let currentBookingRoom = null;

async function openBookingModal(roomName) {
    currentBookingRoom = roomName;
    
    const roomModal = document.getElementById('myModalRoom');
    const cabinetElement = document.querySelector('#myModalRoom .cabinet');
    const bookingDateInput = document.getElementById('bookingDate');
    const weekdaySpan = document.getElementById('weekdayDisplay');
    
    if (cabinetElement) cabinetElement.textContent = roomName;
    
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    if (bookingDateInput) {
        bookingDateInput.value = formattedDate;
        updateWeekdayDisplay(formattedDate, weekdaySpan);
    }
    
    const timeSelect = document.getElementById('bookingTime');
    if (timeSelect && timeSelect.options.length > 0) {
        timeSelect.selectedIndex = 0;
    }
    
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
    
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        alert('Пожалуйста, войдите в аккаунт для бронирования');
        window.location.href = 'Login.html';
        return;
    }
    
    const user = JSON.parse(userStr);
    
    const bookingData = {
        login: user.login,
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
            
            // ОБНОВЛЯЕМ ДАННЫЕ ПОСЛЕ БРОНИРОВАНИЯ
            console.log('Обновление данных после бронирования...');
            
            // Обновляем данные для текущей выбранной даты
            if (typeof window.refreshData === 'function') {
                await window.refreshData();
            } else if (typeof window.updateRoomsStatusForSelection === 'function') {
                await window.updateRoomsStatusForSelection();
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

function closeRoomModal() {
    const roomModal = document.getElementById('myModalRoom');
    if (roomModal) roomModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentBookingRoom = null;
}

function closeScheduleModal() {
    const scheduleModal = document.getElementById('scheduleModal');
    if (scheduleModal) scheduleModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function initDateChangeListener() {
    const bookingDateInput = document.getElementById('bookingDate');
    const weekdaySpan = document.getElementById('weekdayDisplay');
    
    if (bookingDateInput) {
        bookingDateInput.addEventListener('change', () => {
            updateWeekdayDisplay(bookingDateInput.value, weekdaySpan);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initDateChangeListener();
    
    const makeBronBtn = document.querySelector('.makeBron');
    if (makeBronBtn) {
        const newBtn = makeBronBtn.cloneNode(true);
        makeBronBtn.parentNode.replaceChild(newBtn, makeBronBtn);
        newBtn.addEventListener('click', bookRoom);
    }
    
    const viewScheduleBtn = document.querySelector('.viewScheduleBtn');
    if (viewScheduleBtn) {
        const newViewBtn = viewScheduleBtn.cloneNode(true);
        viewScheduleBtn.parentNode.replaceChild(newViewBtn, viewScheduleBtn);
        newViewBtn.addEventListener('click', () => {
            if (currentBookingRoom && typeof window.openScheduleModal === 'function') {
                window.openScheduleModal(currentBookingRoom);
            }
        });
    }
    
    const closeBtn = document.querySelector('#myModalRoom .close');
    if (closeBtn) {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.addEventListener('click', closeRoomModal);
    }
    
    window.addEventListener('click', (event) => {
        const roomModal = document.getElementById('myModalRoom');
        if (event.target === roomModal) closeRoomModal();
        
        const scheduleModal = document.getElementById('scheduleModal');
        if (event.target === scheduleModal) closeScheduleModal();
    });
    
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeRoomModal();
            closeScheduleModal();
        }
    });
});

window.openBookingModal = openBookingModal;
window.closeRoomModal = closeRoomModal;
window.closeScheduleModal = closeScheduleModal;