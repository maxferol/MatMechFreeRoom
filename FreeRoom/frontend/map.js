window.onload = function () {
    const canvas = document.getElementById("c");
    const ctx = canvas.getContext('2d');

    // Параметры панорамирования и масштаба
    let offsetX = 0;
    let offsetY = 0;
    let scale = 1;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let lastX = 0;
    let lastY = 0;

    // Глобальные переменные для статусов
    let roomsStatus = {};
    let currentPair = null;
    window.currentDate = null;
    let isDataLoaded = false;
    let currentFloor = 6;
    let currentRooms = [];

    // Функция получения текущей пары
    function getCurrentPair() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        if (currentTime >= 9 * 60 && currentTime < 10 * 60 + 30) return 1;
        if (currentTime >= 10 * 60 + 40 && currentTime < 12 * 60 + 10) return 2;
        if (currentTime >= 12 * 60 + 20 && currentTime < 13 * 60 + 50) return 3;
        if (currentTime >= 14 * 60 + 30 && currentTime < 16 * 60) return 4;
        if (currentTime >= 16 * 60 + 10 && currentTime < 17 * 60 + 40) return 5;
        if (currentTime >= 17 * 60 + 50 && currentTime < 19 * 60 + 20) return 6;

        return null;
    }

    // Функция форматирования даты
    // Функция форматирования даты (с учетом локального времени)
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Функция сохранения данных в localStorage (вместо файла)
    function saveRoomsToLocalStorage(roomsData, date) {
        try {
            const key = `rooms_${date}`;
            localStorage.setItem(key, JSON.stringify(roomsData));
            console.log(`Данные сохранены в localStorage под ключом: ${key}`);
            return true;
        } catch (error) {
            console.error('Ошибка сохранения в localStorage:', error);
            return false;
        }
    }

    // Функция загрузки данных из localStorage
    function loadRoomsFromLocalStorage(date) {
        try {
            const key = `rooms_${date}`;
            const data = localStorage.getItem(key);
            if (data) {
                console.log(`Данные загружены из localStorage для ${date}`);
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Ошибка загрузки из localStorage:', error);
        }
        return null;
    }

    // Функция запроса к бэкенду
    window.fetchBusyRooms = async function (date) {
        try {
            if (!window.fetch) {
                console.error('fetch API недоступен');
                return {};
            }

            // Сначала пробуем загрузить из localStorage
            const cachedData = loadRoomsFromLocalStorage(date);
            if (cachedData && Object.keys(cachedData).length > 0) {
                console.log(`Использую кэшированные данные для ${date}`);
                return cachedData;
            }

            // Если нет в кэше - запрашиваем с бэка
            const url = `http://localhost:5000/api/rooms/busy?date=${date}`;
            console.log(`Запрос к бэкенду для ${date}:`, url);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(url, {
                signal: controller.signal,
                mode: 'cors',
                cache: 'no-cache'
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`Получены данные от бэкенда для ${date}:`, data);

            // Сохраняем в localStorage
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                saveRoomsToLocalStorage(data, date);
                return data;
            }

            return {};

        } catch (error) {
            console.error('Ошибка получения занятых комнат:', error);
            return {};
        }
    };

    // Функция обновления статусов комнат
    window.updateRoomsStatus = function (roomsDict) {
        roomsStatus = roomsDict;
        console.log('Обновлены статусы комнат:', roomsStatus);
    };

    // Функция загрузки данных для выбранной даты и пары
    window.loadRoomsData = async function (date, pair) {
        const dateStr = formatDate(date);
        console.log(`Загрузка данных для даты: ${dateStr}, пары: ${pair}`);

        currentDate = date;
        currentPair = pair;

        const roomsDict = await window.fetchBusyRooms(dateStr);
        window.updateRoomsStatus(roomsDict);

        draw();
    };

    // В начале map.js добавьте глобальные переменные
    let selectedPairFromSwitcher = null;

    // Функция проверки, занята ли комната (использует выбранную пару)
    function hasClassNow(roomName) {
        // Используем выбранную пару из свитчера, если она есть
        let pairToUse = selectedPairFromSwitcher !== null ? selectedPairFromSwitcher : currentPair;

        if (!pairToUse) {
            console.log('Нет выбранной пары');
            return false;
        }

        // Нормализация названий комнат
        let normalizedRoomName = roomName;
        if (roomName === '622a') normalizedRoomName = '622а';
        if (roomName === '632a') normalizedRoomName = '632а';

        const roomStatus = roomsStatus[normalizedRoomName];
        if (!roomStatus || !Array.isArray(roomStatus)) {
            return false;
        }

        return roomStatus.includes(pairToUse);
    }

    // Функция для обновления выбранной пары из свитчера
    // Функция для обновления выбранной пары из свитчера (БЕЗ запроса к бэкенду)
    window.updateSelectedPair = function (pairNumber) {
        console.log(`Обновление выбранной пары в map.js: ${pairNumber}`);
        selectedPairFromSwitcher = pairNumber;
        currentPair = pairNumber;
        draw(); // Просто перерисовываем карту с новым фильтром
    }

    // Функция для обновления выбранной даты (ТОЛЬКО при смене даты)
    window.updateSelectedDate = async function (date) {
        console.log(`Обновление выбранной даты в map.js: ${date}`);
        currentDate = date;
        window.currentDate = date;  // Сохраняем глобально
        const dateStr = formatDate(date);

        const roomsDict = await window.fetchBusyRooms(dateStr);
        window.updateRoomsStatus(roomsDict);
        draw();
    }

    // Данные комнат
    const rooms_6 = [
        { name: "621", x: 897, y: 19, width: 130, height: 127, path: null },
        { name: "632", x: 1000, y: 183, width: 113, height: 122, path: null },
        { name: "632a", x: 1115, y: 183, width: 28, height: 122, path: null },
        { name: "642", x: 1145, y: 183, width: 27, height: 122, path: null },
        { name: "636", x: 1172, y: 183, width: 28, height: 122, path: null },
        { name: "638", x: 1200, y: 183, width: 28, height: 122, path: null },
        { name: "640", x: 1230, y: 183, width: 60, height: 122, path: null },
        { name: "628", x: 865, y: 183, width: 110, height: 122, path: null },
        { name: "630", x: 977, y: 183, width: 25, height: 122, path: null },
        { name: "626", x: 830, y: 183, width: 35, height: 122, path: null },
        { name: "624", x: 775, y: 183, width: 55, height: 122, path: null },
        { name: "622a", x: 710, y: 205, width: 60, height: 100, path: null },
        { name: "622", x: 620, y: 183, width: 90, height: 122, path: null },
        { name: "620", x: 585, y: 183, width: 30, height: 122, path: null },
        { name: "618", x: 525, y: 183, width: 55, height: 122, path: null },
        { name: "614", x: 390, y: 183, width: 55, height: 122, path: null },
        { name: "612", x: 325, y: 183, width: 62, height: 122, path: null },
        { name: "601", x: 390, y: 19, width: 65, height: 125, path: null },
        { name: "605", x: 455, y: 19, width: 65, height: 125, path: null },
        { name: "607", x: 520, y: 19, width: 60, height: 125, path: null },
        { name: "609", x: 583, y: 19, width: 35, height: 125, path: null },
        { name: "611", x: 653, y: 19, width: 140, height: 125, path: null },
        { name: "613", x: 795, y: 19, width: 45, height: 125, path: null },
        { name: "615", x: 840, y: 19, width: 19, height: 125, path: null },
        { name: "617", x: 859, y: 19, width: 19, height: 125, path: null },
        { name: "619", x: 878, y: 19, width: 19, height: 125, path: null },
        { name: "623", x: 1180, y: 19, width: 50, height: 100, path: null },
        { name: "625", x: 1233, y: 19, width: 55, height: 100, path: null },
    ];

    const rooms_5 = [
        { name: "513", x: 902, y: 4, width: 130, height: 127, path: null },
        { name: "532", x: 1003, y: 172, width: 75, height: 128, path: null },
        { name: "538", x: 1145, y: 172, width: 70, height: 128, path: null },
        { name: "540", x: 1218, y: 172, width: 70, height: 128, path: null },
        { name: "528", x: 895, y: 172, width: 28, height: 128, path: null },
        { name: "530", x: 923, y: 172, width: 28, height: 128, path: null },
        { name: "526", x: 805, y: 170, width: 87, height: 128, path: null },
        { name: "524", x: 775, y: 169, width: 29, height: 128, path: null },
        { name: "524a", x: 712, y: 195, width: 60, height: 105, path: null },
        { name: "522", x: 620, y: 170, width: 90, height: 130, path: null },
        { name: "514", x: 390, y: 170, width: 135, height: 130, path: null },
        { name: "501", x: 390, y: 4, width: 65, height: 130, path: null },
        { name: "505", x: 455, y: 4, width: 65, height: 130, path: null },
        { name: "507", x: 520, y: 4, width: 95, height: 130, path: null },
        { name: "509", x: 653, y: 4, width: 140, height: 130, path: null },
        { name: "511", x: 795, y: 4, width: 57, height: 130, path: null },
        { name: "515", x: 1180, y: 4, width: 50, height: 105, path: null },
        { name: "517", x: 1233, y: 4, width: 55, height: 105, path: null },
    ];

    const floorMaps = {
        5: { image: './map5floor.svg', rooms: rooms_5 },
        6: { image: './map6floor.svg', rooms: rooms_6 }
    };

    let currentMapImage = new Image();
    let isLoading = false;

    function loadFloor(floor) {
        if (isLoading) return;
        isLoading = true;

        const floorData = floorMaps[floor];
        if (!floorData) return;

        currentFloor = floor;
        currentRooms = floorData.rooms;

        document.querySelectorAll('.floor-btn').forEach(btn => {
            if (btn.dataset.floor == floor) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        currentMapImage.onload = function () {
            updateRoomPaths();
            resizeCanvas();
            isLoading = false;
            if (isDataLoaded) {
                draw();
            }
        };

        currentMapImage.src = floorData.image;
        currentMapImage.onerror = function () {
            console.error('Ошибка загрузки карты для этажа', floor);
            isLoading = false;
        };
    }

    function updateRoomPaths() {
        currentRooms.forEach(room => {
            const path = new Path2D();
            path.rect(room.x, room.y, room.width, room.height);
            room.path = path;
        });
    }

    function resizeCanvas() {
        canvas.width = currentMapImage.width;
        canvas.height = currentMapImage.height;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        centerMap();
    }

    function centerMap() {
        const mapWidth = currentMapImage.width * scale;
        const mapHeight = currentMapImage.height * scale;
        offsetX = (canvas.width - mapWidth) / 2;
        offsetY = (canvas.height - mapHeight) / 2;
        clampOffset();
    }

    function clampOffset() {
        if (!currentMapImage.complete) return;

        const mapWidth = currentMapImage.width * scale;
        const mapHeight = currentMapImage.height * scale;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        let minX = canvasWidth - mapWidth;
        let minY = canvasHeight - mapHeight;
        let maxX = 0;
        let maxY = 0;

        if (mapWidth < canvasWidth) {
            minX = (canvasWidth - mapWidth) / 2;
            maxX = minX;
        }
        if (mapHeight < canvasHeight) {
            minY = (canvasHeight - mapHeight) / 2;
            maxY = minY;
        }

        offsetX = Math.min(maxX, Math.max(minX, offsetX));
        offsetY = Math.min(maxY, Math.max(minY, offsetY));
    }

    window.addEventListener('resize', () => {
        clampOffset();
        draw();
    });

    function draw() {
        if (!ctx || !currentMapImage.complete) return;
        if (!isDataLoaded) return;

        canvas.width = canvas.width;
        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);
        ctx.drawImage(currentMapImage, 0, 0, currentMapImage.width, currentMapImage.height);

        currentRooms.forEach(room => {
            ctx.save();

            const hasPair = hasClassNow(room.name);

            if (hasPair) {
                ctx.fillStyle = 'rgba(128, 128, 128, 0.6)';
            } else {
                ctx.fillStyle = 'rgba(76, 175, 80, 0.6)';
            }

            ctx.fill(room.path);
            ctx.lineWidth = 2 / scale;
            ctx.stroke(room.path);

            const centerX = room.x + room.width / 2;
            const centerY = room.y + room.height / 2;
            let fontSize = 18 * scale;
            fontSize = Math.min(20, Math.max(12, fontSize));

            ctx.save();
            ctx.translate(centerX, centerY);
            if (room.width <= 40) {
                ctx.rotate(-Math.PI / 2);
            }

            ctx.font = `${fontSize}px "Martian Mono", "Inter", monospace`;
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = 3;
            ctx.fillText(room.name, 0, 0);
            ctx.shadowBlur = 0;
            ctx.fillText(room.name, 0, 0);

            ctx.restore();
            ctx.restore();
        });

        ctx.restore();
    }

    function getCanvasCoords(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        let canvasX = (clientX - rect.left) * scaleX;
        let canvasY = (clientY - rect.top) * scaleY;
        canvasX = (canvasX - offsetX) / scale;
        canvasY = (canvasY - offsetY) / scale;

        return { x: canvasX, y: canvasY };
    }

    function checkRoomClick(e) {
        const coords = getCanvasCoords(e);

        for (let i = currentRooms.length - 1; i >= 0; i--) {
            const room = currentRooms[i];
            if (ctx.isPointInPath(room.path, coords.x, coords.y)) {
                openBookingModal(room.name);
                return true;
            }
        }
        return false;
    }

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        lastX = offsetX;
        lastY = offsetY;
        canvas.style.cursor = 'grabbing';
        e.preventDefault();
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        offsetX = lastX + dx;
        offsetY = lastY + dy;
        clampOffset();
        draw();
    });

    canvas.addEventListener('mouseup', (e) => {
        if (isDragging) {
            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;
            if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
                checkRoomClick(e);
            }
        }
        isDragging = false;
        canvas.style.cursor = 'grab';
    });

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = scale * delta;

        if (newScale > 0.3 && newScale < 5) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const canvasMouseX = mouseX * scaleX;
            const canvasMouseY = mouseY * scaleY;
            const beforeX = (canvasMouseX - offsetX) / scale;
            const beforeY = (canvasMouseY - offsetY) / scale;
            scale = newScale;
            const afterX = (canvasMouseX - offsetX) / scale;
            const afterY = (canvasMouseY - offsetY) / scale;
            offsetX += (afterX - beforeX) * scale;
            offsetY += (afterY - beforeY) * scale;
            clampOffset();
            draw();
        }
    });

    let touchStartX = 0, touchStartY = 0;
    let touchLastX = 0, touchLastY = 0;
    let isTouching = false;

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isTouching = true;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchLastX = offsetX;
        touchLastY = offsetY;
    });

    canvas.addEventListener('touchmove', (e) => {
        if (!isTouching) return;
        e.preventDefault();
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        offsetX = touchLastX + dx;
        offsetY = touchLastY + dy;
        clampOffset();
        draw();
    });

    canvas.addEventListener('touchend', (e) => {
        isTouching = false;
    });

    function switchFloor(floor) {
        if (floor === currentFloor) return;
        scale = 1;
        offsetX = 0;
        offsetY = 0;
        loadFloor(floor);
    }

    document.querySelectorAll('.floor-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const floor = parseInt(btn.dataset.floor);
            switchFloor(floor);
        });
    });

    async function initData() {
        const today = new Date();

        // НЕ устанавливаем currentPair автоматически, 
        // так как это делает timeSwitcher.js

        // Загружаем данные для сегодняшней даты
        await window.loadRoomsData(today, null);

        isDataLoaded = true;
        draw();

        // Убираем автообновление по времени, так как теперь пару выбирает пользователь
        // setInterval для автообновления больше не нужен
    }

    canvas.style.cursor = 'grab';
    loadFloor(6);
    initData();
};

// Функция получения текущей пары (для начальной инициализации)
window.getCurrentPairNumber = function () {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    if (currentTime >= 9 * 60 && currentTime < 10 * 60 + 30) return 1;
    if (currentTime >= 10 * 60 + 40 && currentTime < 12 * 60 + 10) return 2;
    if (currentTime >= 12 * 60 + 20 && currentTime < 13 * 60 + 50) return 3;
    if (currentTime >= 14 * 60 + 30 && currentTime < 16 * 60) return 4;
    if (currentTime >= 16 * 60 + 10 && currentTime < 17 * 60 + 40) return 5;
    if (currentTime >= 17 * 60 + 50 && currentTime < 19 * 60 + 20) return 6;

    return null;
}
