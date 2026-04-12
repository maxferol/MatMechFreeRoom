window.onload = function() {
  var canvas = document.getElementById("c");
  var ctx = canvas.getContext('2d');
  var ctxOffset = {
    x: 0,
    y: 0
  };
  var ctxScale = 1;

  const room = new Path2D();
  room.rect(385, 588, 125, 95);
  ctx.fillStyle = 'yellow';
  ctx.fill(room);

  const mapImage = new Image();
  mapImage.onload = function() {
    drawMap()
  };

  mapImage.src = './map.webp'

  var dragMultiplier = 1

  function drawMap() {
    ctx.scale(ctxScale, ctxScale);
    ctx.drawImage(mapImage, 0, 0, mapImage.width, mapImage.height);
    ctx.fillStyle = 'yellow';
    ctx.fill(room);
  }

  function clearMap(){
    canvas.width = canvas.width;
  }

  function moveMap() {
    ctxOffset.x += dragOffset.x * dragMultiplier;
    ctxOffset.y += dragOffset.y * dragMultiplier;
    ctx.translate(ctxOffset.x, ctxOffset.y);
  }

const modal = document.getElementById('myModalRoom');

  function reactToClick(event){
    if (ctx.isPointInPath(room, event.offsetX, event.offsetY)) {
      ctx.fillStyle = 'green';
      ctx.fill(room);
      modal.style.display = 'block';
      console.log('room clicked');
    }
    else
      console.log('map clicked');
  }
  
  var isDrag = false;
  var waitingForDrag = false;
  var dragOffset;
  drawMap()

  canvas.addEventListener('mousedown', function(event) {
    waitingForDrag = true;

  })

  canvas.addEventListener('mousemove', function(event) {
    if (!waitingForDrag && !isDrag)
      return;

    else {
      waitingForDrag = false;
      isDrag = true;
      dragOffset = {
        x: event.movementX,
        y: event.movementY
      };
      clearMap();
      moveMap();
      drawMap();
    }

  })

  canvas.addEventListener('mouseup', function(event) {
    if (isDrag)
      isDrag = false;
    if (waitingForDrag) {
      waitingForDrag = false;
      reactToClick(event);
    }
  })

  canvas.addEventListener('wheel', function(event) {
    ctxScale += event.deltaY * -0.001;
    clearMap();
    drawMap();
  })
}