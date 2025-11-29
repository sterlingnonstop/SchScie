
function initAnimation() {
    const canvas = document.getElementById('waveCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    const ctx = canvas.getContext('2d');

    const playPauseBtn = document.getElementById('playPauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const speedRange = document.getElementById('speedRange');
    const speedValue = document.getElementById('speedValue');
    const frequencyRange = document.getElementById('frequencyRange');
    const frequencyValue = document.getElementById('frequencyValue');
    
    // Fallback for announceStatus if a11y.js fails or loads late
    const announceStatus = window.announceStatus || ((msg) => {
        console.log('Status announcement:', msg);
        const statusRegion = document.getElementById('statusRegion');
        if (statusRegion) {
            statusRegion.textContent = msg;
        }
    });

    let width, height, centerY, amplitude;
    let phase = 0;
    let speed = 0.05;
    let frequency = 3;
    let isPlaying = false;
    let animationId;

    function resizeCanvas() {
        // Read the actual display size of the canvas as determined by CSS
        width = canvas.clientWidth;
        height = canvas.clientHeight;

        // Set the canvas drawing buffer size to match its display size
        canvas.width = width;
        canvas.height = height;

        // Recalculate dependent properties
        centerY = height / 2;
        amplitude = height * 0.4;
        draw(); // Redraw after resizing
    }

    function draw() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        // Draw center horizontal line
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--bs-secondary-bg');
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw vertical dashed lines for particle positions
        const dotRadius = 6;
        const dotPositionsX = [dotRadius, width / 2, width - dotRadius];

        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--bs-border-color');
        dotPositionsX.forEach(x => {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        });

        // Draw the sine wave
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
            const angle = (x / width) * frequency * 2 * Math.PI + phase;
            const y = centerY + amplitude * Math.sin(angle);
            (x === 0) ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#0d6efd'; // Bootstrap primary
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Draw the particles (red dots)
        function drawDot(x, y) {
            ctx.beginPath();
            ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#dc3545'; // Bootstrap danger
            ctx.fill();
            ctx.strokeStyle = '#b02a37';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        dotPositionsX.forEach(x => {
            const angle = (x / width) * frequency * 2 * Math.PI + phase;
            const y = centerY + amplitude * Math.sin(angle);
            drawDot(x, y);
        });
    }

    function animate() {
        if (!isPlaying) return;
        phase -= speed;
        draw();
        animationId = requestAnimationFrame(animate);
    }

    function togglePlayPause() {
        isPlaying = !isPlaying;
        playPauseBtn.setAttribute('aria-pressed', isPlaying);
        if (isPlaying) {
            playPauseBtn.innerHTML = '<i class="fa-solid fa-pause" aria-hidden="true"></i> <span>暫停</span>';
            playPauseBtn.classList.replace('btn-primary', 'btn-warning');
            animate();
            announceStatus('動畫已開始');
        } else {
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play" aria-hidden="true"></i> <span>開始</span>';
            playPauseBtn.classList.replace('btn-warning', 'btn-primary');
            cancelAnimationFrame(animationId);
            announceStatus('動畫已暫停');
        }
    }

    function reset() {
        isPlaying = false;
        playPauseBtn.setAttribute('aria-pressed', 'false');
        playPauseBtn.innerHTML = '<i class="fa-solid fa-play" aria-hidden="true"></i> <span>開始</span>';
        playPauseBtn.classList.replace('btn-warning', 'btn-primary');
        cancelAnimationFrame(animationId);
        
        phase = 0;
        speedRange.value = 0.05;
        frequencyRange.value = 3;
        
        speed = 0.05;
        frequency = 3;
        
        speedValue.textContent = speed.toFixed(2);
        frequencyValue.textContent = frequency;
        
        speedRange.setAttribute('aria-valuenow', speed);
        frequencyRange.setAttribute('aria-valuenow', frequency);
        
        draw();
        announceStatus('已重置為初始狀態');
    }

    // Event Listeners
    playPauseBtn.addEventListener('click', togglePlayPause);
    resetBtn.addEventListener('click', reset);

    speedRange.addEventListener('input', (e) => {
        speed = parseFloat(e.target.value);
        speedValue.textContent = speed.toFixed(2);
        speedRange.setAttribute('aria-valuenow', speed);
    });

    frequencyRange.addEventListener('input', (e) => {
        frequency = parseInt(e.target.value);
        frequencyValue.textContent = frequency;
        frequencyRange.setAttribute('aria-valuenow', frequency);
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT') return;
        const keyMap = {
            ' ': togglePlayPause,
            'Spacebar': togglePlayPause,
            'r': reset, 'R': reset
        };
        if (keyMap[e.key]) {
            e.preventDefault();
            keyMap[e.key]();
        }
    });

    window.addEventListener('resize', resizeCanvas);

    // Initial setup
    reset();
    resizeCanvas();
}

// Attach to window to be called by the main module
window.initAnimation = initAnimation;
