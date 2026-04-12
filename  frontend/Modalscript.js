const modal = document.getElementById('myModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.querySelector('.cancel-btn');
const confirmBtn = document.querySelector('.confirm-btn');

// Функция для открытия модального окна
function openModal() {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Блокируем прокрутку страницы
}

// Функция для закрытия модального окна
function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Возвращаем прокрутку
}

// Обработчик для кнопки "Подтвердить"
function handleConfirm() {
    const input = document.querySelector('.modal-input');
    const message = input.value.trim();
    
    if (message) {
        alert(`Вы подтвердили действие с сообщением: "${message}"`);
    } else {
        alert('Действие подтверждено!');
    }
    closeModal();
}

// Обработчик для кнопки "Отмена"
function handleCancel() {
    if (confirm('Вы уверены, что хотите отменить действие?')) {
        closeModal();
    }
}

// Закрытие при клике вне модального окна
function handleOutsideClick(event) {
    if (event.target === modal) {
        closeModal();
    }
}

// Закрытие по клавише Escape
function handleEscapeKey(event) {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
    }
}

// Назначаем обработчики событий
openModalBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', handleCancel);
confirmBtn.addEventListener('click', handleConfirm);
window.addEventListener('click', handleOutsideClick);
document.addEventListener('keydown', handleEscapeKey);

// Опционально: очищаем поле ввода при закрытии
function cleanupModal() {
    const input = document.querySelector('.modal-input');
    if (input) input.value = '';
}

// Добавляем очистку при закрытии
const originalCloseModal = closeModal;
window.closeModal = function() {
    cleanupModal();
    originalCloseModal();
};