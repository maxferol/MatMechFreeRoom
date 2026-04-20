
    // Комнаты (координаты из Figma)
   
 

    window.onload = function() {
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
        { name: "621", x: 897, y: 19, width: 130, height: 127, path: null },
        { name: "632", x: 1000, y: 183, width: 113, height: 122, path: null },
        { name: "634", x: 865, y: 183, width: 110, height: 122, path: null },
    ];
    
    // Загрузка карты
    const mapImage = new Image();
    mapImage.onload = function() {
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
        
        // Если карта меньше canvas, центрируем её
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
            ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
            ctx.fill(room.path);

            ctx.lineWidth = 2 / scale;
            ctx.stroke(room.path);
            
            // Центрирование текста
            const centerX = room.x + room.width / 2;
            const centerY = room.y + room.height / 2;
            
            let fontSize = 18 * scale;
            fontSize = Math.min(28, Math.max(12, fontSize));
            
            ctx.font = `${fontSize}px "Martian Mono", "Inter", monospace`;
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = 3;
            ctx.fillText(room.name, centerX, centerY);
            ctx.shadowBlur = 0;
            ctx.fillText(room.name, centerX, centerY);
            
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
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