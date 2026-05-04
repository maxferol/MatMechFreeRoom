document.addEventListener('DOMContentLoaded', () => {
    
    // Базовый URL для API
    const API_BASE_URL = 'https://freeroom-backend.onrender.com/api';
    
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

    // ========== ФУНКЦИИ ДЛЯ НАВИГАЦИИ ==========
    function goToMainPage() {
        window.location.href = "MainPage.html";
    }
    
    function switchToLoginPage() {
        window.location.href = "Login.html";
    }

    function switchToRegisterPage() {
        window.location.href = "Registration.html";
    }

    // ========== ДОБАВЛЯЕМ КНОПКУ НАЗАД НА ГЛАВНУЮ ==========
    function addHomeButton() {
        // Для страницы регистрации
        const registerCard = document.querySelector('.register-card');
        if (registerCard && !document.getElementById('homeMainBtn')) {
            const homeBtn = document.createElement('button');
            homeBtn.id = 'homeMainBtn';
            homeBtn.className = 'home-button';
            homeBtn.innerHTML = '<i class="fas fa-home"></i> На главную';
            homeBtn.style.position = 'absolute';
            homeBtn.style.top = '20px';
            homeBtn.style.left = '20px';
            homeBtn.style.padding = '10px 20px';
            homeBtn.style.backgroundColor = '#6c5ce7';
            homeBtn.style.color = 'white';
            homeBtn.style.border = 'none';
            homeBtn.style.borderRadius = '8px';
            homeBtn.style.cursor = 'pointer';
            homeBtn.style.fontFamily = 'Inter, sans-serif';
            homeBtn.style.fontSize = '14px';
            homeBtn.style.display = 'flex';
            homeBtn.style.alignItems = 'center';
            homeBtn.style.gap = '8px';
            homeBtn.style.zIndex = '1000';
            homeBtn.style.transition = 'all 0.3s ease';
            
            homeBtn.onmouseenter = () => {
                homeBtn.style.backgroundColor = '#5b4bc4';
                homeBtn.style.transform = 'translateY(-2px)';
            };
            homeBtn.onmouseleave = () => {
                homeBtn.style.backgroundColor = '#6c5ce7';
                homeBtn.style.transform = 'translateY(0)';
            };
            
            homeBtn.onclick = goToMainPage;
            document.body.appendChild(homeBtn);
        }
        
        // Для страницы логина
        const loginCard = document.querySelector('.register-card');
        if (loginCard && !document.getElementById('homeMainBtn')) {
            const homeBtn = document.createElement('button');
            homeBtn.id = 'homeMainBtn';
            homeBtn.className = 'home-button';
            homeBtn.innerHTML = '<i class="fas fa-home"></i> На главную';
            homeBtn.style.position = 'absolute';
            homeBtn.style.top = '20px';
            homeBtn.style.left = '20px';
            homeBtn.style.padding = '10px 20px';
            homeBtn.style.backgroundColor = '#6c5ce7';
            homeBtn.style.color = 'white';
            homeBtn.style.border = 'none';
            homeBtn.style.borderRadius = '8px';
            homeBtn.style.cursor = 'pointer';
            homeBtn.style.fontFamily = 'Inter, sans-serif';
            homeBtn.style.fontSize = '14px';
            homeBtn.style.display = 'flex';
            homeBtn.style.alignItems = 'center';
            homeBtn.style.gap = '8px';
            homeBtn.style.zIndex = '1000';
            homeBtn.style.transition = 'all 0.3s ease';
            
            homeBtn.onmouseenter = () => {
                homeBtn.style.backgroundColor = '#5b4bc4';
                homeBtn.style.transform = 'translateY(-2px)';
            };
            homeBtn.onmouseleave = () => {
                homeBtn.style.backgroundColor = '#6c5ce7';
                homeBtn.style.transform = 'translateY(0)';
            };
            
            homeBtn.onclick = goToMainPage;
            document.body.appendChild(homeBtn);
        }
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

        // Реальная регистрация через API
        async function registerRequest(username, password) {
            const response = await fetch(`${API_BASE_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    login: username,
                    password: password,
                    firstName: username,
                    secondName: '',
                    role: 'User'
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                if (response.status === 409) {
                    throw new Error('Пользователь с таким логином уже существует');
                }
                throw new Error(error.message || 'Ошибка регистрации');
            }

            return await response.json();
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
                await registerRequest(username, password);
                alert('Регистрация прошла успешно! Теперь вы можете войти');
                switchToLoginPage();
            } catch (err) {
                showError(err.message || 'Ошибка регистрации. Попробуйте позже.');
                console.error('Registration error:', err);
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

        function hideLoginError() {
            loginErrorContainer.classList.add('hidden');
        }

        async function handleLogin(e) {
            e.preventDefault();
            hideLoginError();
            
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            if (!username || !password) {
                showLoginError('Заполните логин и пароль');
                return;
            }
            
            loginBtn.disabled = true;
            loginBtn.innerText = 'Вход...';
            
            try {
                // Реальный запрос к API для входа
                const response = await fetch(`${API_BASE_URL}/users/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        login: username,
                        password: password
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Неверный логин или пароль');
                }

                const data = await response.json();
                
                // Сохраняем данные пользователя в localStorage
                localStorage.setItem('user', JSON.stringify({
                    login: username,
                    token: data.token,
                    userId: data.userId,
                    role: data.role
                }));
                
                alert('Успешный вход!');
                // Переход на главную страницу
                window.location.href = "MainPage.html";
                
            } catch (err) {
                showLoginError(err.message || 'Ошибка входа. Проверьте логин и пароль');
                console.error('Login error:', err);
            } finally {
                loginBtn.disabled = false;
                loginBtn.innerText = 'Войти';
            }
        }

        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
            
            // Очищаем ошибку при вводе
            const inputs = ['loginUsername', 'loginPassword'];
            inputs.forEach(id => {
                const input = document.getElementById(id);
                if (input) {
                    input.addEventListener('input', () => hideLoginError());
                }
            });
        }
        
        if (registerRedirect) {
            registerRedirect.addEventListener('click', (e) => {
                e.preventDefault();
                switchToRegisterPage();
            });
        }
    }

    // Добавляем кнопку "На главную" на обе страницы
    addHomeButton();
    
    initPasswordToggles();
});