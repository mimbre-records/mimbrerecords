/* ============================================
   MIMBRE RECORDS - GEOMETRIC ANIMATION V3
   Geometría andina animada - Velocidades corregidas
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
    constructor(y, color, speed) {
        this.baseY = y;
        this.y = y;
        this.color = color;
        this.speed = speed;
        this.offset = Math.random() * Math.PI * 2;
        this.amplitude = 5;
    }
    
    update(time) {
        // Movimiento ondulatorio visible pero sutil
        this.y = this.baseY + Math.sin((time + this.offset) * this.speed) * this.amplitude;
    }
    
    draw() {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, this.y);
        ctx.lineTo(width, this.y);
        ctx.stroke();
    }
}

// Clase para triángulos geométricos
class Triangle {
    constructor(x, y, size, color, speed) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.baseSize = size;
        this.size = size;
        this.color = color;
        this.speed = speed;
        this.offset = Math.random() * Math.PI * 2;
        this.rotation = 0;
    }
    
    update(time) {
        // Breathing effect (tamaño)
        const breathe = Math.sin((time + this.offset) * this.speed * 0.8);
        this.size = this.baseSize * (1 + breathe * 0.15);
        
        // Rotación sutil
        this.rotation = Math.sin((time + this.offset * 2) * this.speed * 0.5) * 0.1;
        
        // Movimiento vertical contenido
        this.y = this.baseY + Math.sin((time + this.offset) * this.speed) * 10;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        
        // Triángulo
        ctx.moveTo(0, -this.size);
        ctx.lineTo(-this.size * 0.866, this.size * 0.5);
        ctx.lineTo(this.size * 0.866, this.size * 0.5);
        ctx.closePath();
        
        ctx.stroke();
        ctx.restore();
    }
}

// Clase para patrones escalonados
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
        // Movimiento vertical suave
        this.y = this.baseY + Math.sin((time + this.offset) * this.speed) * 8;
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
    
    // Crear bandas horizontales (4 bandas)
    const numBands = 4;
    const bandColors = [colors.gray1, colors.gray2, colors.white, colors.ocre1];
    
    for (let i = 0; i < numBands; i++) {
        const y = (height / (numBands + 1)) * (i + 1);
        const speed = 0.015 + Math.random() * 0.01;
        horizontalBands.push(new HorizontalBand(y, bandColors[i], speed));
    }
    
    // Crear triángulos distribuidos (8 triángulos)
    const numTriangles = 8;
    const triangleColors = [colors.gray1, colors.gray2, colors.ocre1, colors.white];
    
    for (let i = 0; i < numTriangles; i++) {
        const x = (width / (numTriangles + 1)) * (i + 1) + (Math.random() - 0.5) * 100;
        const y = height * 0.25 + Math.random() * height * 0.5;
        const size = 15 + Math.random() * 20;
        const color = triangleColors[Math.floor(Math.random() * triangleColors.length)];
        const speed = 0.012 + Math.random() * 0.008;
        
        triangles.push(new Triangle(x, y, size, color, speed));
    }
    
    // Crear patrones escalonados (3 patrones)
    const numPatterns = 3;
    const patternColors = [colors.gray3, colors.ocre2, colors.white];
    
    for (let i = 0; i < numPatterns; i++) {
        const x = (width * 0.1) + Math.random() * (width * 0.2);
        const y = (height / (numPatterns + 1)) * (i + 1);
        const steps = 3 + Math.floor(Math.random() * 3);
        const stepSize = 18 + Math.random() * 12;
        const color = patternColors[i % patternColors.length];
        const speed = 0.018 + Math.random() * 0.01;
        
        steppedPatterns.push(new SteppedPattern(x, y, steps, stepSize, color, speed));
    }
}

// Loop de animación
function animate() {
    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);
    
    // Incrementar tiempo (60fps = 60 increments por segundo)
    time += 0.016; // ~1/60 para normalizar
    
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
    initGeometry();
});

// Pausar animación si la pestaña no está visible
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
