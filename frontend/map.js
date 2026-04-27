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

    // Функция запроса к бэкенду
    window.fetchBusyRooms = async function (date, pairNumber) {
        try {
            const response = await fetch(`http://localhost:5000/api/rooms/busy?date=${date}&pair=${pairNumber}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.busyRooms && Array.isArray(data.busyRooms)) {
                return data.busyRooms;
            }
            return [];

        } catch (error) {
            console.error('Ошибка получения занятых комнат:', error);
            return [];
        }
    };

    // Функция обновления статусов комнат
    window.updateRoomsStatus = function (busyRooms, pair) {
        for (let key in roomsStatus) {
            delete roomsStatus[key];
        }

        busyRooms.forEach(roomName => {
            roomsStatus[roomName] = [pair];
        });
    };

    // Функция проверки, занята ли комната
    function hasClassNow(roomName) {
        if (!currentPair) return false;
        const roomStatus = roomsStatus[roomName];
        if (!roomStatus) return false;
        return roomStatus.includes(currentPair);
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
        { name: "513", x: 902, y: 19 - 15, width: 130, height: 127, path: null },
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
        { name: "501", x: 390, y: 19 - 15, width: 65, height: 125 + 5, path: null },
        { name: "505", x: 455, y: 19 - 15, width: 65, height: 130, path: null },
        { name: "507", x: 520, y: 19 - 15, width: 60 + 35, height: 130, path: null },
        { name: "509", x: 653, y: 19 - 15, width: 140, height: 125 + 5, path: null },
        { name: "511", x: 795, y: 19 - 15, width: 45 + 12, height: 125 + 5, path: null },
        { name: "515", x: 1180, y: 19 - 15, width: 50, height: 100 + 5, path: null },
        { name: "517", x: 1233, y: 19 - 15, width: 55, height: 100 + 5, path: null },
    ];

    const floorMaps = {
        5: { image: './map5floor.svg', rooms: rooms_5 },
        6: { image: './map6floor.svg', rooms: rooms_6 }
    };

    let currentMapImage = new Image();
    let isLoading = false;

    // Инициализация данных (основная функция)
    async function initData() {
        currentPair = getCurrentPair();
        
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        
        if (currentPair !== null) {
            const busyRooms = await window.fetchBusyRooms(formattedDate, currentPair);
            window.updateRoomsStatus(busyRooms, currentPair);
            console.log(`Загружены занятые комнаты для ${currentPair} пары:`, busyRooms);
        } else {
            window.updateRoomsStatus([], currentPair);
        }
        
        isDataLoaded = true;
        
        setInterval(async () => {
            const newPair = getCurrentPair();
            const newDate = new Date().toISOString().split('T')[0];
            
            if (newPair !== currentPair) {
                currentPair = newPair;
                
                if (currentPair !== null) {
                    const busyRooms = await window.fetchBusyRooms(newDate, currentPair);
                    window.updateRoomsStatus(busyRooms, currentPair);
                    console.log(`Обновлены занятые комнаты для ${currentPair} пары:`, busyRooms);
                } else {
                    window.updateRoomsStatus([], currentPair);
                }
                
                draw();
            }
        }, 60000);
        
        draw();
    }

    // Остальные функции (loadFloor, updateRoomPaths, resizeCanvas, draw, и т.д.) остаются без изменений
    // ... (весь остальной код остается таким же)

    // Запуск
    loadFloor(6);
    initData();
};