// script.js

const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const clearButton = document.getElementById('clearButton');

// Add event listener for the clear button
clearButton.addEventListener('click', clearCanvas);

// Initialize Socket.IO connection
const socket = io();

// Set up initial zoom level and pixel size
let zoomLevel = 1;
let pixelSize = 20;

// Add event listener for zooming with the mouse wheel
canvas.addEventListener('wheel', handleZoom);

function handleZoom(e) {
    e.preventDefault();

    // Adjust zoom level based on the direction of the scroll
    zoomLevel += e.deltaY > 0 ? 0.1 : -0.1;

    // Clamp zoom level to a reasonable range
    zoomLevel = Math.max(0.1, Math.min(3, zoomLevel));

    updateCanvas();
}

function updateCanvas() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the pixel grid with numbers and letters
    drawGrid();

    // Redraw saved pixels
    redrawSavedPixels();
}

function drawGrid() {
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 0.5;
    ctx.font = '10px Arial';
    ctx.fillStyle = '#555';

    for (let x = 0; x <= canvas.width; x += pixelSize * zoomLevel) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();

        // Draw the numbers
        const number = Math.floor(x / pixelSize / zoomLevel) + 1;
        ctx.fillText(number, x + 5, 15);
    }

    for (let y = 0; y <= canvas.height; y += pixelSize * zoomLevel) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();

        // Draw the letters
        const letter = String.fromCharCode(65 + Math.floor(y / pixelSize / zoomLevel));
        ctx.fillText(letter, 5, y + 15);
    }
}

function clearCanvas() {
    // Emit a 'clear' event to the server
    socket.emit('clear');
}

function redrawSavedPixels() {
    // Fetch and redraw saved pixels from localStorage
    const savedPixels = JSON.parse(localStorage.getItem('pixels')) || [];

    savedPixels.forEach((pixel) => {
        const { x, y, color } = pixel;
        drawOnCanvas(x, y, color);
    });
}

function drawOnCanvas(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * pixelSize * zoomLevel, y * pixelSize * zoomLevel, pixelSize * zoomLevel, pixelSize * zoomLevel);
}

// Event listener for mouse movement on the canvas
canvas.addEventListener('mousemove', draw);

// Event listener for mouse click on the canvas
canvas.addEventListener('mousedown', () => {
    drawing = true;
});

// Event listener for mouse release
canvas.addEventListener('mouseup', () => {
    drawing = false;
});

function draw(e) {
    if (!drawing) return;

    const color = colorPicker.value;
    const x = Math.floor((e.clientX - canvas.offsetLeft) / (pixelSize * zoomLevel));
    const y = Math.floor((e.clientY - canvas.offsetTop) / (pixelSize * zoomLevel));

    drawOnCanvas(x, y, color);

    // Emit a 'draw' event to the server
    socket.emit('draw', { x, y, color });
    savePixel(x, y, color);
}

// Event listener for handling 'draw' events from the server
socket.on('draw', (data) => {
    const { x, y, color } = data;
    drawOnCanvas(x, y, color);
    savePixel(x, y, color);
});

// Event listener for handling 'clear' events from the server
socket.on('clear', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    localStorage.clear();
});

// Save the pixel information to localStorage
function savePixel(x, y, color) {
    const savedPixels = JSON.parse(localStorage.getItem('pixels')) || [];
    savedPixels.push({ x, y, color });
    localStorage.setItem('pixels', JSON.stringify(savedPixels));
}
