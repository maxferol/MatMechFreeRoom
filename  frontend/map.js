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

    const rooms = [
        { name: "621", x: 897, y: 19, width: 130, height: 127, path: null, },
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

        //{ name: "608", x: 120, y: 280, width: 60, height: 122, path: null },

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

    // Загрузка карты
    const mapImage = new Image();
    mapImage.onload = function () {
        resizeCanvas();
        draw();
    };
    mapImage.src = './map6floor.svg';

    function resizeCanvas() {
        canvas.width = mapImage.width;
        canvas.height = mapImage.height;
        canvas.style.width = '100%';
        canvas.style.height = '100%';

        // Центрируем карту при загрузке
        centerMap();
        draw();
    }

    // Центрирование карты
    function centerMap() {
        const mapWidth = mapImage.width * scale;
        const mapHeight = mapImage.height * scale;

        offsetX = (canvas.width - mapWidth) / 2;
        offsetY = (canvas.height - mapHeight) / 2;

        clampOffset();
    }

    // Функция ограничения панорамирования
    function clampOffset() {
        if (!mapImage.complete) return;

        const mapWidth = mapImage.width * scale;
        const mapHeight = mapImage.height * scale;

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        // Рассчитываем границы
        let minX = canvasWidth - mapWidth;
        let minY = canvasHeight - mapHeight;
        let maxX = 0;
        let maxY = 0;

        // Если карта меньше canvas, центрируем е
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

    function updateRoomPaths() {
        rooms.forEach(room => {
            const path = new Path2D();
            path.rect(room.x, room.y, room.width, room.height);
            room.path = path;
        });
    }

    function draw() {
        if (!ctx || !mapImage.complete) return;

        canvas.width = canvas.width;
        ctx.save();

        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);

        ctx.drawImage(mapImage, 0, 0, mapImage.width, mapImage.height);

        rooms.forEach(room => {
            ctx.save();
            
            if (room.name === "608") {
                ctx.rotate(-Math.PI/8); // 30 градусов
            }

            ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
            ctx.fill(room.path);

            ctx.lineWidth = 2 / scale;
            ctx.stroke(room.path);

            // Центрирование текста
            const centerX = room.x + room.width / 2;
            const centerY = room.y + room.height / 2;

            let fontSize = 18 * scale;
            fontSize = Math.min(20, Math.max(12, fontSize));

            ctx.save(); // Сохраняем состояние перед поворотом для этого room

            ctx.translate(centerX, centerY);
            if (room.width <= 40) {
                ctx.rotate(-Math.PI / 2); // 90 градусов
            }

            ctx.font = `${fontSize}px "Martian Mono", "Inter", monospace`;
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = 3;
            ctx.fillText(room.name, 0, 0); // <-- Здесь 0, 0, потому что translate уже сдвинул
            ctx.shadowBlur = 0;
            ctx.fillText(room.name, 0, 0); // <-- И здесь тоже 0, 0

            ctx.restore(); // Восстанавливаем состояние после поворота для этого room
        });

        ctx.restore(); // Восстанавливаем основное состояние (translate и scale)
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

        for (let i = rooms.length - 1; i >= 0; i--) {
            const room = rooms[i];
            if (ctx.isPointInPath(room.path, coords.x, coords.y)) {
                openRoomModal(room.name);
                return true;
            }
        }
        return false;
    }

    // Mouse Events
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

    // Zoom
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

    // Touch events
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

    // Инициализация
    updateRoomPaths();
    canvas.style.cursor = 'grab';

    if (mapImage.complete) {
        resizeCanvas();
        draw();
    }
};