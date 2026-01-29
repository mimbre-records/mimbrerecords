/* ============================================
   MIMBRE RECORDS - GEOMETRIC ANIMATION
   Geometría andina animada de fondo
   ============================================ */

// Configuración del canvas
const canvas = document.getElementById('geometric-canvas');
const ctx = canvas.getContext('2d');

// Variables globales
let width, height;
let animationFrame;
let time = 0;

// Paleta de colores (grises + ocre)
const colors = {
    gray1: 'rgba(74, 74, 74, 0.4)',
    gray2: 'rgba(106, 106, 106, 0.3)',
    gray3: 'rgba(138, 138, 138, 0.2)',
    ocre1: 'rgba(212, 165, 116, 0.3)',
    ocre2: 'rgba(184, 134, 11, 0.2)',
    white: 'rgba(255, 255, 255, 0.15)'
};

// Ajustar canvas al tamaño de la ventana
function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

// Clase para líneas geométricas horizontales
class HorizontalBand {
    constructor(y, width, color, speed) {
        this.baseY = y;
        this.y = y;
        this.width = width;
        this.color = color;
        this.speed = speed;
        this.offset = Math.random() * Math.PI * 2;
    }
    
    update(time) {
        // Movimiento ondulatorio muy sutil
        this.y = this.baseY + Math.sin(time * this.speed + this.offset) * 3;
    }
    
    draw() {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, this.y);
        ctx.lineTo(this.width, this.y);
        ctx.stroke();
    }
}

// Clase para triángulos geométricos andinos
class Triangle {
    constructor(x, y, size, color, speed) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.speed = speed;
        this.offset = Math.random() * Math.PI * 2;
        this.rotation = 0;
    }
    
    update(time) {
        // Movimiento de respiración sutil
        const breathe = Math.sin(time * this.speed + this.offset) * 0.1;
        this.size = this.size * (1 + breathe);
        this.rotation = Math.sin(time * this.speed * 0.5 + this.offset) * 0.05;
        
        // Pequeño desplazamiento vertical
        this.y = this.baseY + Math.sin(time * this.speed + this.offset) * 2;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        
        // Triángulo apuntando arriba
        ctx.moveTo(0, -this.size);
        ctx.lineTo(-this.size * 0.866, this.size * 0.5);
        ctx.lineTo(this.size * 0.866, this.size * 0.5);
        ctx.closePath();
        
        ctx.stroke();
        ctx.restore();
    }
}

// Clase para patrones escalonados (tipo geometría andina)
class SteppedPattern {
    constructor(x, y, steps, stepSize, color, speed) {
        this.x = x;
        this.baseY = y;
        this.y = y;
        this.steps = steps;
        this.stepSize = stepSize;
        this.color = color;
        this.speed = speed;
        this.offset = Math.random() * Math.PI * 2;
    }
    
    update(time) {
        this.y = this.baseY + Math.sin(time * this.speed + this.offset) * 4;
    }
    
    draw() {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        
        let currentX = this.x;
        let currentY = this.y;
        
        ctx.moveTo(currentX, currentY);
        
        for (let i = 0; i < this.steps; i++) {
            currentX += this.stepSize;
            ctx.lineTo(currentX, currentY);
            currentY += this.stepSize;
            ctx.lineTo(currentX, currentY);
        }
        
        ctx.stroke();
    }
}

// Arrays para almacenar elementos
let horizontalBands = [];
let triangles = [];
let steppedPatterns = [];

// Inicializar elementos geométricos
function initGeometry() {
    horizontalBands = [];
    triangles = [];
    steppedPatterns = [];
    
    // Crear bandas horizontales (3-5 bandas)
    const numBands = 4;
    for (let i = 0; i < numBands; i++) {
        const y = (height / (numBands + 1)) * (i + 1);
        const colorKeys = Object.keys(colors);
        const randomColor = colors[colorKeys[Math.floor(Math.random() * colorKeys.length)]];
        horizontalBands.push(new HorizontalBand(y, width, randomColor, 0.0003 + Math.random() * 0.0002));
    }
    
    // Crear triángulos distribuidos (6-10 triángulos)
    const numTriangles = 8;
    for (let i = 0; i < numTriangles; i++) {
        const x = (width / (numTriangles + 1)) * (i + 1) + (Math.random() - 0.5) * 100;
        const y = Math.random() * height;
        const size = 15 + Math.random() * 25;
        const colorKeys = ['gray1', 'gray2', 'ocre1', 'white'];
        const randomColor = colors[colorKeys[Math.floor(Math.random() * colorKeys.length)]];
        triangles.push(new Triangle(x, y, size, randomColor, 0.0002 + Math.random() * 0.0003));
    }
    
    // Crear patrones escalonados (3-4 patrones)
    const numPatterns = 3;
    for (let i = 0; i < numPatterns; i++) {
        const x = Math.random() * width * 0.3;
        const y = (height / (numPatterns + 1)) * (i + 1);
        const steps = 3 + Math.floor(Math.random() * 4);
        const stepSize = 20 + Math.random() * 15;
        const colorKeys = ['gray3', 'ocre2', 'white'];
        const randomColor = colors[colorKeys[Math.floor(Math.random() * colorKeys.length)]];
        steppedPatterns.push(new SteppedPattern(x, y, steps, stepSize, randomColor, 0.0004 + Math.random() * 0.0002));
    }
}

// Loop de animación
function animate() {
    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);
    
    // Incrementar tiempo (muy lento para ciclo de 60-90 seg)
    time += 1;
    
    // Actualizar y dibujar bandas horizontales
    horizontalBands.forEach(band => {
        band.update(time);
        band.draw();
    });
    
    // Actualizar y dibujar triángulos
    triangles.forEach(triangle => {
        triangle.update(time);
        triangle.draw();
    });
    
    // Actualizar y dibujar patrones escalonados
    steppedPatterns.forEach(pattern => {
        pattern.update(time);
        pattern.draw();
    });
    
    // Continuar animación
    animationFrame = requestAnimationFrame(animate);
}

// Inicialización
function init() {
    resizeCanvas();
    initGeometry();
    animate();
}

// Event listeners
window.addEventListener('resize', () => {
    resizeCanvas();
    initGeometry(); // Reinicializar geometría al cambiar tamaño
});

// Pausar animación si la pestaña no está visible (performance)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        cancelAnimationFrame(animationFrame);
    } else {
        animate();
    }
});

// Iniciar cuando cargue el DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
