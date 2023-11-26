// script.js
document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('pixelCanvas');
    const ctx = canvas.getContext('2d');
    const colorPicker = document.getElementById('colorPicker');
    const clearButton = document.getElementById('clearButton');

    let drawing = false;

    // Connect to the server via WebSocket
    const socket = io.connect('http://localhost:5000');

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mousemove', draw);
    clearButton.addEventListener('click', clearCanvas);

    loadSavedPixels();

    function startDrawing(e) {
        drawing = true;
        draw(e);
    }

    function stopDrawing() {
        drawing = false;
        ctx.beginPath();
    }

    function draw(e) {
        if (!drawing) return;

        const pixelSize = 20;
        const color = colorPicker.value;
        const x = e.clientX - canvas.offsetLeft;
        const y = e.clientY - canvas.offsetTop;

        const pixelX = Math.floor(x / pixelSize) * pixelSize;
        const pixelY = Math.floor(y / pixelSize) * pixelSize;

        const gridX = pixelX / pixelSize;
        const gridY = pixelY / pixelSize;

        ctx.fillStyle = color;
        ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);

        // Draw borders and labels
        ctx.strokeStyle = "#ccc";
        ctx.strokeRect(pixelX, pixelY, pixelSize, pixelSize);
        ctx.fillStyle = "#555";
        ctx.font = "10px Arial";
        ctx.fillText(`${String.fromCharCode(65 + gridY)}${gridX + 1}`, pixelX + 5, pixelY + 15);

        // Emit a 'draw' event to the server
        socket.emit('draw', { x: gridX, y: gridY, color });
        savePixel(gridX, gridY, color);
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        localStorage.clear();
        // Emit a 'clear' event to the server
        socket.emit('clear');
    }

    function loadSavedPixels() {
        const savedPixels = JSON.parse(localStorage.getItem('pixels')) || [];

        savedPixels.forEach((pixel) => {
            const { x, y, color } = pixel;
            const pixelSize = 20;
            const pixelX = x * pixelSize;
            const pixelY = y * pixelSize;

            ctx.fillStyle = color;
            ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);

            // Draw borders and labels
            ctx.strokeStyle = "#ccc";
            ctx.strokeRect(pixelX, pixelY, pixelSize, pixelSize);
            ctx.fillStyle = "#555";
            ctx.font = "10px Arial";
            ctx.fillText(`${String.fromCharCode(65 + y)}${x + 1}`, pixelX + 5, pixelY + 15);
        });
    }

    function savePixel(x, y, color) {
        const savedPixels = JSON.parse(localStorage.getItem('pixels')) || [];
        savedPixels.push({ x, y, color });
        localStorage.setItem('pixels', JSON.stringify(savedPixels));
    }

    // Listen for 'draw' events from the server
    socket.on('draw', (data) => {
        const { x, y, color } = data;
        drawOnCanvas(x, y, color);
        savePixel(x, y, color);
    });

    // Listen for 'clear' events from the server
    socket.on('clear', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        localStorage.clear();
    });

    function drawOnCanvas(x, y, color) {
        const pixelSize = 20;
        const pixelX = x * pixelSize;
        const pixelY = y * pixelSize;

        ctx.fillStyle = color;
        ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);

        // Draw borders and labels
        ctx.strokeStyle = "#ccc";
        ctx.strokeRect(pixelX, pixelY, pixelSize, pixelSize);
        ctx.fillStyle = "#555";
        ctx.font = "10px Arial";
        ctx.fillText(`${String.fromCharCode(65 + y)}${x + 1}`, pixelX + 5, pixelY + 15);
    }
});
