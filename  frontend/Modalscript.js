// Модальное окно пользовательского меню
const modal = document.getElementById('myModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeBtn = document.querySelector('#myModal .close');

// Функция для открытия модального окна
function openModal() {
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
    }
}

// Обработчики для кнопок меню
const myTableBtn = document.querySelector('.myTable-btn');
const addBronBtn = document.querySelector('.addBron-btn');
const myBronBtn = document.querySelector('.myBron-btn');

if (myTableBtn) {
    myTableBtn.addEventListener('click', () => {
        alert('Мое расписание - в разработке');
        closeModal();
    });
}

if (addBronBtn) {
    addBronBtn.addEventListener('click', () => {
        alert('Добавление брони - в разработке');
        closeModal();
    });
}

if (myBronBtn) {
    myBronBtn.addEventListener('click', () => {
        alert('Мои брони - в разработке');
        closeModal();
    });
}

// Назначаем обработчики
if (openModalBtn) openModalBtn.addEventListener('click', openModal);
if (closeBtn) closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', handleOutsideClick);
document.addEventListener('keydown', handleEscapeKey);

// Функции для модального окна комнаты
function openRoomModal(roomName) {
    const roomModal = document.getElementById('myModalRoom');
    const cabinetElement = document.querySelector('#myModalRoom .cabinet');
    if (cabinetElement) cabinetElement.textContent = roomName;
    if (roomModal) roomModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeRoomModal() {
    const roomModal = document.getElementById('myModalRoom');
    if (roomModal) roomModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Обработчик для кнопки бронирования в модальном окне комнаты
const makeBronBtn = document.querySelector('.makeBron');
if (makeBronBtn) {
    makeBronBtn.addEventListener('click', () => {
        const cabinet = document.querySelector('#myModalRoom .cabinet');
        alert(`Бронирование ${cabinet ? cabinet.textContent : 'комнаты'} - функция в разработке`);
        closeRoomModal();
    });
}

// Закрытие модального окна комнаты по крестику
const roomCloseBtn = document.querySelector('#myModalRoom .close');
if (roomCloseBtn) roomCloseBtn.addEventListener('click', closeRoomModal);

// Закрытие по клику вне окна комнаты
window.addEventListener('click', (event) => {
    const roomModal = document.getElementById('myModalRoom');
    if (event.target === roomModal) closeRoomModal();
});