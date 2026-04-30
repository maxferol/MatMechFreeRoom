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
    let roomsStatus = {}; // Теперь здесь будет лежать словарь { "509": [1, 2], ... }
    let currentPair = null;
    let currentDate = null;
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

    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    // 1. ИСПРАВЛЕНО: Функция запроса теперь ожидает словарь
    window.fetchBusyRooms = async function (date) {
        try {
            const url = `http://localhost:5000/api/rooms/busy?date=${date}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // Возвращаем объект (словарь) целиком
            return data || {};

        } catch (error) {
            console.error('Ошибка получения занятых комнат:', error);
            return {};
        }
    };

    // 2. ИСПРАВЛЕНО: Просто сохраняем пришедший словарь
    window.updateRoomsStatus = function (busyRoomsDict) {
        roomsStatus = busyRoomsDict;
        console.log('Обновлен глобальный словарь статусов:', roomsStatus);
    };

    // 3. ИСПРАВЛЕНО: Логика загрузки данных
    window.loadRoomsData = async function (date) {
        const dateStr = formatDate(date);
        console.log(`Загрузка словаря на дату: ${dateStr}`);

        currentDate = date;
        currentPair = getCurrentPair(); // Обновляем текущую пару

        const data = await window.fetchBusyRooms(dateStr);
        window.updateRoomsStatus(data);

        isDataLoaded = true;
        draw();
    };

    // 4. ИСПРАВЛЕНО: Проверка наличия ПАРЫ в списке ПАР комнаты
    function hasClassNow(roomName) {
        if (!currentPair) return false;
        const busyPairs = roomsStatus[roomName];

        // Если для комнаты есть список пар, проверяем, входит ли туда текущая
        return Array.isArray(busyPairs) && busyPairs.includes(currentPair);
    }

    // --- Дальнейший код отрисовки и событий (rooms_6, rooms_5, loadFloor и т.д.) ---
    // Оставляем без изменений, так как они используют draw() и hasClassNow()

    // ВАЖНО: Обновляем отрисовку (draw) чтобы она была доступна
    function draw() {
        if (!ctx || !currentMapImage.complete) return;
        if (!isDataLoaded) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);
        ctx.drawImage(currentMapImage, 0, 0, currentMapImage.width, currentMapImage.height);

        currentRooms.forEach(room => {
            ctx.save();
            const isBusy = hasClassNow(room.name);

            ctx.fillStyle = isBusy ? 'rgba(200, 100, 100, 0.6)' : 'rgba(76, 175, 80, 0.6)';

            ctx.fill(room.path);
            ctx.lineWidth = 2 / scale;
            ctx.strokeStyle = '#000';
            ctx.stroke(room.path);

            const centerX = room.x + room.width / 2;
            const centerY = room.y + room.height / 2;
            let fontSize = 18 * scale;
            fontSize = Math.min(20, Math.max(12, fontSize));

            ctx.save();
            ctx.translate(centerX, centerY);
            if (room.width <= 40) ctx.rotate(-Math.PI / 2);

            ctx.font = `${fontSize}px "Martian Mono", monospace`;
            ctx.fillStyle = '#000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(room.name, 0, 0);

            ctx.restore();
            ctx.restore();
        });
        ctx.restore();
    }

    // Данные комнат (копируем из твоего кода)
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
            btn.classList.toggle('active', btn.dataset.floor == floor);
        });
        currentMapImage.onload = function () {
            updateRoomPaths();
            resizeCanvas();
            isLoading = false;
            if (isDataLoaded) draw();
        };
        currentMapImage.src = floorData.image;
    }

    function updateRoomPaths() {
        currentRooms.forEach(room => {
            const path = new Path2D();
            path.rect(room.x, room.y, room.width, room.height);
            room.path = path;
        });
    }

    function resizeCanvas() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        centerMap();
    }

    function centerMap() {
        offsetX = (canvas.width - currentMapImage.width * scale) / 2;
        offsetY = (canvas.height - currentMapImage.height * scale) / 2;
        clampOffset();
    }

    function clampOffset() {
        const mapW = currentMapImage.width * scale;
        const mapH = currentMapImage.height * scale;
        offsetX = Math.min(0, Math.max(canvas.width - mapW, offsetX));
        offsetY = Math.min(0, Math.max(canvas.height - mapH, offsetY));
    }

    // Регистрация кликов и панорамирования (оставлено логически как у тебя)
    canvas.addEventListener('mousedown', (e) => { isDragging = true; dragStartX = e.clientX; dragStartY = e.clientY; lastX = offsetX; lastY = offsetY; });
    canvas.addEventListener('mousemove', (e) => { if (!isDragging) return; offsetX = lastX + (e.clientX - dragStartX); offsetY = lastY + (e.clientY - dragStartY); clampOffset(); draw(); });
    window.addEventListener('mouseup', () => isDragging = false);

    // 5. ИСПРАВЛЕНО: Инициализация без лишних аргументов
    async function initData() {
        const today = new Date();
        await window.loadRoomsData(today);

        // Автообновление каждую минуту
        setInterval(async () => {
            const newPair = getCurrentPair();
            if (newPair !== currentPair) {
                currentPair = newPair;
                draw(); // Просто перерисовываем с новым цветом, данные уже в словаре
            }
        }, 60000);
    }

    loadFloor(6);
    initData();

    // Экспортируем функцию для модалки
    window.hasClassNow = hasClassNow;
};

function openRoomModal(roomName) {
    const isBusy = window.hasClassNow(roomName);
    alert(`Комната ${roomName}\nСтатус: ${isBusy ? 'Занята' : 'Свободна'}`);
}