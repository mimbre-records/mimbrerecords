/* ============================================
   MIMBRE RECORDS - GEOMETRIC ANIMATION V2
   Geometría andina animada - Ciclo infinito con reset suave
   ============================================ */

// Configuración del canvas
const canvas = document.getElementById('geometric-canvas');
const ctx = canvas.getContext('2d');

// Variables globales
let width, height;
let animationFrame;
let time = 0;
const CYCLE_DURATION = 5000; // 5000 frames ≈ 83 segundos a 60fps
const RESET_DURATION = 200; // 200 frames para reset suave ≈ 3.3 seg

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

// Clase para líneas geométricas horizontales (SIEMPRE VISIBLES)
class HorizontalBand {
    constructor(y, width, color, speed) {
        this.baseY = y;
        this.y = y;
        this.width = width;
        this.color = color;
        this.speed = speed;
        this.offset = Math.random() * Math.PI * 2;
        this.amplitude = 3; // Oscilación máxima en píxeles
    }
    
    update(time) {
        // Movimiento ondulatorio contenido (nunca sale)
        this.y = this.baseY + Math.sin(time * this.speed + this.offset) * this.amplitude;
    }
    
    draw() {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, this.y);
        ctx.lineTo(this.width, this.y);
        ctx.stroke();
    }
    
    reset() {
        // No necesita reset, siempre está en rango
    }
}

// Clase para triángulos geométricos andinos (CON RESET SUAVE)
class Triangle {
    constructor(x, y, size, color, speed) {
        this.initialX = x;
        this.initialY = y;
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.initialSize = size;
        this.size = size;
        this.color = color;
        this.speed = speed;
        this.offset = Math.random() * Math.PI * 2;
        this.rotation = 0;
        this.isResetting = false;
        this.resetProgress = 0;
    }
    
    update(time, cycleProgress) {
        if (this.isResetting) {
            // Reset suave hacia posición inicial
            this.resetProgress += 1 / RESET_DURATION;
            
            if (this.resetProgress >= 1) {
                this.isResetting = false;
                this.resetProgress = 0;
                this.baseX = this.initialX;
                this.baseY = this.initialY;
                this.size = this.initialSize;
                this.rotation = 0;
            } else {
                // Interpolación suave (ease-out)
                const easeProgress = 1 - Math.pow(1 - this.resetProgress, 3);
                this.x = this.baseX + (this.initialX - this.baseX) * easeProgress;
                this.y = this.baseY + (this.initialY - this.baseY) * easeProgress;
                this.size = this.size + (this.initialSize - this.size) * easeProgress;
                this.rotation = this.rotation * (1 - easeProgress);
            }
        } else {
            // Movimiento normal contenido
            const breathe = Math.sin(time * this.speed + this.offset) * 0.08;
            this.size = this.initialSize * (1 + breathe);
            this.rotation = Math.sin(time * this.speed * 0.5 + this.offset) * 0.03;
            
            // Desplazamiento vertical muy contenido
            this.y = this.baseY + Math.sin(time * this.speed + this.offset) * 8;
            
            // Trigger reset cuando ciclo completa
            if (cycleProgress > 0.95) {
                this.isResetting = true;
                this.resetProgress = 0;
            }
        }
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

// Clase para patrones escalonados (CON RESET SUAVE)
class SteppedPattern {
    constructor(x, y, steps, stepSize, color, speed) {
        this.initialX = x;
        this.initialY = y;
        this.x = x;
        this.baseY = y;
        this.y = y;
        this.steps = steps;
        this.stepSize = stepSize;
        this.color = color;
        this.speed = speed;
        this.offset = Math.random() * Math.PI * 2;
        this.isResetting = false;
        this.resetProgress = 0;
    }
    
    update(time, cycleProgress) {
        if (this.isResetting) {
            this.resetProgress += 1 / RESET_DURATION;
            
            if (this.resetProgress >= 1) {
                this.isResetting = false;
                this.resetProgress = 0;
                this.baseY = this.initialY;
            } else {
                const easeProgress = 1 - Math.pow(1 - this.resetProgress, 3);
                this.y = this.baseY + (this.initialY - this.baseY) * easeProgress;
            }
        } else {
            this.y = this.baseY + Math.sin(time * this.speed + this.offset) * 6;
            
            if (cycleProgress > 0.95) {
                this.isResetting = true;
                this.resetProgress = 0;
            }
        }
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
    
    // Crear bandas horizontales (4 bandas siempre visibles)
    const numBands = 4;
    for (let i = 0; i < numBands; i++) {
        const y = (height / (numBands + 1)) * (i + 1);
        const colorKeys = Object.keys(colors);
        const randomColor = colors[colorKeys[Math.floor(Math.random() * colorKeys.length)]];
        horizontalBands.push(new HorizontalBand(y, width, randomColor, 0.0003 + Math.random() * 0.0002));
    }
    
    // Crear triángulos distribuidos (8 triángulos)
    const numTriangles = 8;
    for (let i = 0; i < numTriangles; i++) {
        const x = (width / (numTriangles + 1)) * (i + 1) + (Math.random() - 0.5) * 100;
        const y = height * 0.2 + Math.random() * height * 0.6; // Mantener en zona central
        const size = 15 + Math.random() * 25;
        const colorKeys = ['gray1', 'gray2', 'ocre1', 'white'];
        const randomColor = colors[colorKeys[Math.floor(Math.random() * colorKeys.length)]];
        triangles.push(new Triangle(x, y, size, randomColor, 0.0002 + Math.random() * 0.0003));
    }
    
    // Crear patrones escalonados (3 patrones)
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
    
    // Incrementar tiempo
    time += 1;
    
    // Calcular progreso del ciclo (0 a 1)
    const cycleProgress = (time % CYCLE_DURATION) / CYCLE_DURATION;
    
    // Reset del ciclo completo
    if (time % CYCLE_DURATION === 0 && time > 0) {
        // Ciclo completo, elementos con reset se regenerarán
    }
    
    // Actualizar y dibujar bandas horizontales (siempre visibles)
    horizontalBands.forEach(band => {
        band.update(time);
        band.draw();
    });
    
    // Actualizar y dibujar triángulos (con reset)
    triangles.forEach(triangle => {
        triangle.update(time, cycleProgress);
        triangle.draw();
    });
    
    // Actualizar y dibujar patrones escalonados (con reset)
    steppedPatterns.forEach(pattern => {
        pattern.update(time, cycleProgress);
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
    time = 0; // Reset time en resize
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
