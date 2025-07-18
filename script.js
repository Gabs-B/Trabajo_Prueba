let display = document.getElementById('result');
let currentInput = '';
let operator = '';
let previousInput = '';
let shouldResetDisplay = false;

let audioContext;
let isPlaying = false;
let bgAudio;

function appendToDisplay(value) {
    if (shouldResetDisplay) {
        clearDisplay();
        shouldResetDisplay = false;
    }
    
    if (value === '.' && currentInput.includes('.')) {
        return;
    }
    
    if (isOperator(value) && isOperator(currentInput.slice(-1))) {
        currentInput = currentInput.slice(0, -1);
    }
    
    currentInput += value;
    display.value = currentInput;
    
    playClickSound();
}

function isOperator(char) {
    return ['+', '-', '*', '/'].includes(char);
}

function clearDisplay() {
    currentInput = '';
    operator = '';
    previousInput = '';
    display.value = '';
    playClickSound();
}

function deleteLast() {
    if (currentInput.length > 0) {
        currentInput = currentInput.slice(0, -1);
        display.value = currentInput;
        playClickSound();
    }
}

function calculate() {
    try {
        if (currentInput === '') {
            return;
        }
        
        let expression = currentInput.replace(/×/g, '*');
        
        if (isOperator(expression.slice(-1))) {
            expression = expression.slice(0, -1);
        }
        
        let result = evaluateExpression(expression);
        
        result = Math.round(result * 100000000) / 100000000;
        
        display.value = result;
        currentInput = result.toString();
        shouldResetDisplay = true;
        
        playResultSound();
        
    } catch (error) {
        display.value = 'Error';
        currentInput = '';
        shouldResetDisplay = true;
        playErrorSound();
    }
}

function evaluateExpression(expr) {
    expr = expr.replace(/\s/g, '');
    
    if (!/^[0-9+\-*/.]+$/.test(expr)) {
        throw new Error('Expresión inválida');
    }
    
    return Function('"use strict"; return (' + expr + ')')();
}

function handleKeyPress(event) {
    const key = event.key;
    
    if (/[0-9.]/.test(key)) {
        appendToDisplay(key);
    }
    else if (['+', '-', '*', '/'].includes(key)) {
        appendToDisplay(key);
    }
    else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    }
    else if (key === 'Escape' || key.toLowerCase() === 'c') {
        clearDisplay();
    }
    else if (key === 'Backspace') {
        deleteLast();
    }
}

document.addEventListener('keydown', handleKeyPress);

function animateButton(element) {
    element.style.transform = 'scale(0.95)';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 100);
}

function formatNumber(num) {
    if (num.toString().length > 12) {
        return num.toExponential(6);
    }
    return num;
}

function initAudio() {
    bgAudio = document.getElementById('bg-audio');
    bgAudio.volume = 0.3;
    
    document.addEventListener('click', function initAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        document.removeEventListener('click', initAudioContext);
    });
}

function playClickSound() {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playResultSound() {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 600;
    oscillator.type = 'triangle';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

function playErrorSound() {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 200;
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

function toggleBackgroundMusic() {
    const musicBtn = document.getElementById('music-toggle');
    const musicIcon = document.getElementById('music-icon');
    
    if (isPlaying) {
        bgAudio.pause();
        isPlaying = false;
        musicBtn.className = 'music-btn paused';
        musicIcon.textContent = '🎵';
    } else {
        bgAudio.play().then(() => {
            isPlaying = true;
            musicBtn.className = 'music-btn playing';
            musicIcon.textContent = '⏸️';
        }).catch(error => {
            console.error('Error al reproducir audio:', error);
        });
    }
}

function init() {
    clearDisplay();
    console.log('Calculadora inicializada');
    
    initAudio();
    
    document.getElementById('music-toggle').addEventListener('click', toggleBackgroundMusic);
}

document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            animateButton(this);
        });
    });
    
    init();
}); 