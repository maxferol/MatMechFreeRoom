document.addEventListener('DOMContentLoaded', () => {
    
    // ========== ФУНКЦИЯ ДЛЯ ПЕРЕКЛЮЧЕНИЯ ВИДИМОСТИ ПАРОЛЯ ==========
    function initPasswordToggles() {
        const toggles = document.querySelectorAll('.toggle-password');
        toggles.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('data-target');
                const input = document.getElementById(targetId);
                if (input) {
                    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                    input.setAttribute('type', type);
                    const icon = this.querySelector('i');
                    if (icon) {
                        icon.classList.toggle('fa-eye');
                        icon.classList.toggle('fa-eye-slash');
                    }
                }
            });
        });
    }

    // ========== ФУНКЦИЯ ДЛЯ ПЕРЕХОДА НА СТРАНИЦУ ВХОДА ==========
    function switchToLoginPage() {
        window.location.href = "login.html";
    }

    // ========== ФУНКЦИЯ ДЛЯ ПЕРЕХОДА НА СТРАНИЦУ РЕГИСТРАЦИИ ==========
    function switchToRegisterPage() {
        window.location.href = "Registration.html";
    }

    // ========== ЛОГИКА ДЛЯ СТРАНИЦЫ РЕГИСТРАЦИИ ==========
    if (document.getElementById('registerForm')) {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const confirmInput = document.getElementById('confirmPassword');
        const submitBtn = document.getElementById('submitBtn');
        const registerForm = document.getElementById('registerForm');
        const errorContainer = document.getElementById('errorContainer');
        const errorTextSpan = document.getElementById('errorText');
        const backButton = document.getElementById('backBtn');
        const loginLink = document.getElementById('loginLink');

        // Показать ошибку
        function showError(message) {
            errorTextSpan.innerText = message;
            errorContainer.classList.remove('hidden');
            setTimeout(() => {
                errorContainer.classList.add('hidden');
            }, 4000);
        }

        function hideError() {
            errorContainer.classList.add('hidden');
        }

        // Валидация формы
        function validateForm() {
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            const confirm = confirmInput.value;

            if (!username) {
                showError('Пожалуйста, введите логин');
                return false;
            }
            if (username.length < 3) {
                showError('Логин должен содержать не менее 3 символов');
                return false;
            }
            if (!password) {
                showError('Введите пароль');
                return false;
            }
            if (password.length < 6) {
                showError('Пароль должен быть не менее 6 символов');
                return false;
            }
            if (password !== confirm) {
                showError('Пароли не совпадают');
                return false;
            }
            return true;
        }

        // Регистрация (mock)
        async function mockRegisterRequest(username, password) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (username.toLowerCase() === 'admin') {
                        reject(new Error('Пользователь с таким логином уже существует'));
                    } else {
                        resolve({ success: true });
                    }
                }, 800);
            });
        }

        // Обработчик регистрации
        async function handleRegister(event) {
            event.preventDefault();
            hideError();

            if (!validateForm()) return;

            let isLoading = false;
            if (isLoading) return;
            isLoading = true;
            
            const originalBtnText = submitBtn.innerText;
            submitBtn.disabled = true;
            submitBtn.innerText = 'Регистрация...';

            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            try {
                await mockRegisterRequest(username, password);
                alert('Регистрация прошла успешно!');
                switchToLoginPage();
            } catch (err) {
                showError(err.message || 'Ошибка регистрации');
            } finally {
                isLoading = false;
                submitBtn.disabled = false;
                submitBtn.innerText = originalBtnText;
            }
        }

        function clearErrorOnInput() {
            const inputs = [usernameInput, passwordInput, confirmInput];
            inputs.forEach(input => {
                if (input) {
                    input.addEventListener('input', () => hideError());
                }
            });
        }

        // Навигация
        if (backButton) {
            backButton.addEventListener('click', switchToLoginPage);
        }
        if (loginLink) {
            loginLink.addEventListener('click', switchToLoginPage);
        }

        registerForm.addEventListener('submit', handleRegister);
        clearErrorOnInput();
    }

    // ========== ЛОГИКА ДЛЯ СТРАНИЦЫ ВХОДА ==========
    if (document.getElementById('loginForm')) {
        const loginForm = document.getElementById('loginForm');
        const loginErrorContainer = document.getElementById('loginErrorContainer');
        const loginErrorText = document.getElementById('loginErrorText');
        const loginBtn = document.getElementById('loginSubmitBtn');
        const registerRedirect = document.getElementById('registerRedirectLink');

        function showLoginError(msg) {
            loginErrorText.innerText = msg;
            loginErrorContainer.classList.remove('hidden');
            setTimeout(() => {
                loginErrorContainer.classList.add('hidden');
            }, 4000);
        }

        async function handleLogin(e) {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            if (!username || !password) {
                showLoginError('Заполните логин и пароль');
                return;
            }
            
            loginBtn.disabled = true;
            loginBtn.innerText = 'Вход...';
            
            setTimeout(() => {
                if (username === 'error') {
                    showLoginError('Неверный логин или пароль');
                } else {
                    alert('Успешный вход!');
                    // Переход на главную 
                }
                loginBtn.disabled = false;
                loginBtn.innerText = 'Войти';
            }, 700);
        }

        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        
        if (registerRedirect) {
            registerRedirect.addEventListener('click', (e) => {
                e.preventDefault();
                switchToRegisterPage();
            });
        }
    }

    initPasswordToggles();
});