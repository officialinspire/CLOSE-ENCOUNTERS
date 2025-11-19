// Game State
const game = {
    specimens: 0,
    currency: 0,
    specimensPerClick: 1,
    cowsAbducted: 0,
    chickensAbducted: 0,
    farmersAbducted: 0,
    totalAbducted: 0,
    maxWeight: 20,
    cargoWeight: 0,
    altitude: 100,
    altitudeDecrease: 0.5,
    combo: 0,
    comboTimer: 0,
    comboMultiplier: 1,
    lastAbductTime: 0,
    upgrades: {
        cargoCapacity: { level: 0, cost: 50 },
        enginePower: { level: 0, cost: 100 },
        beamPower: { level: 0, cost: 75 },
        comboTime: { level: 0, cost: 150 },
        tradeBonus: { level: 0, cost: 200 }
    },
    isPlaying: false,
    isGameOver: false,
    soundsEnabled: true,
    musicEnabled: true,
    isPaused: false,
    difficulty: 'normal', // normal, easy, hard
    isCrashing: false,
    crashAnimationFrame: 0,
    explosionParticles: []
};

// Audio elements
const sounds = {
    chicken: document.getElementById('chickenSound'),
    cow: document.getElementById('cowSound'),
    tractorBeam: document.getElementById('tractorBeamSound'),
    ufoFlying: document.getElementById('ufoFlyingSound'),
    startScreen: document.getElementById('startScreenMusic'),
    gameMusic: document.getElementById('gameMusic')
};

// Set volume levels for better balance
sounds.ufoFlying.volume = 0.25;
sounds.startScreen.volume = 0.4;
sounds.gameMusic.volume = 0.85; // Primary dominant audio - increased to be louder than other SFX
sounds.tractorBeam.volume = 0.18; // Reduced to be less distracting
sounds.chicken.volume = 0.5;
sounds.cow.volume = 0.5;

// Play sound function with error handling
function playSound(soundName) {
    if (!game.soundsEnabled) return;
    
    try {
        const sound = sounds[soundName];
        if (sound) {
            // Clone the sound for overlapping effects
            const soundClone = sound.cloneNode();
            soundClone.volume = sound.volume;
            soundClone.play().catch(e => console.log('Audio play prevented:', e));
        }
    } catch (e) {
        console.log('Error playing sound:', e);
    }
}

// Start background music
function startBackgroundMusic() {
    if (!game.soundsEnabled) return;
    
    try {
        sounds.startScreen.play().catch(e => {
            console.log('Background music play prevented:', e);
            // Enable sound on first user interaction
            document.addEventListener('click', () => {
                sounds.startScreen.play().catch(() => {});
            }, { once: true });
        });
    } catch (e) {
        console.log('Error starting background music:', e);
    }
}

// Fade audio function
function fadeAudio(audio, targetVolume, duration = 1000) {
    const startVolume = audio.volume;
    const volumeChange = targetVolume - startVolume;
    const steps = 20;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
        currentStep++;
        audio.volume = Math.max(0, Math.min(1, startVolume + (volumeChange * currentStep / steps)));

        if (currentStep >= steps) {
            clearInterval(interval);
            if (targetVolume === 0) {
                audio.pause();
                audio.currentTime = 0;
            }
        }
    }, stepDuration);
}

// Stop menu music and start game sounds
function startGameSounds() {
    try {
        // Fade out menu music
        fadeAudio(sounds.startScreen, 0, 1000);

        // Fade in game music
        if (game.musicEnabled) {
            setTimeout(() => {
                sounds.gameMusic.volume = 0;
                sounds.gameMusic.play().catch(e => console.log('Game music prevented:', e));
                fadeAudio(sounds.gameMusic, 0.85, 1500);
            }, 500);
        }

        if (game.soundsEnabled) {
            sounds.ufoFlying.play().catch(e => console.log('UFO sound prevented:', e));
        }
    } catch (e) {
        console.log('Error transitioning sounds:', e);
    }
}

// Stop all sounds
function stopGameSounds() {
    try {
        sounds.ufoFlying.pause();
        sounds.ufoFlying.currentTime = 0;

        if (sounds.gameMusic && !sounds.gameMusic.paused) {
            fadeAudio(sounds.gameMusic, 0, 500);
        }
    } catch (e) {
        console.log('Error stopping sounds:', e);
    }
}

// Pause game sounds
function pauseGameSounds() {
    try {
        if (sounds.ufoFlying && !sounds.ufoFlying.paused) {
            sounds.ufoFlying.pause();
        }
        if (sounds.gameMusic && !sounds.gameMusic.paused) {
            sounds.gameMusic.pause();
        }
    } catch (e) {
        console.log('Error pausing sounds:', e);
    }
}

// Resume game sounds
function resumeGameSounds() {
    try {
        if (game.soundsEnabled && sounds.ufoFlying.paused) {
            sounds.ufoFlying.play().catch(e => console.log('UFO sound prevented:', e));
        }
        if (game.musicEnabled && sounds.gameMusic.paused) {
            sounds.gameMusic.play().catch(e => console.log('Game music prevented:', e));
        }
    } catch (e) {
        console.log('Error resuming sounds:', e);
    }
}

// Target types with INCREASED spawn rates and speeds for better gameplay balance
const targetTypes = {
    cow: {
        emoji: '🐄',
        value: 1,
        weight: 2,
        speed: 0.5,  // Increased from 0.4
        size: 45,
        spawnWeight: 50,
        color: '#ffffff'
    },
    chicken: {
        emoji: '🐔',
        value: 2,
        weight: 1,
        speed: 1.2,  // Increased from 1
        size: 35,
        spawnWeight: 35,
        color: '#ffeecc'
    },
    farmer: {
        emoji: '👨‍🌾',
        value: 5,
        weight: 3,
        speed: 0.7,  // Increased from 0.6
        size: 50,
        spawnWeight: 15,
        color: '#8b4513'
    }
};

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    // Optimize for all devices - desktop, Android, and iOS
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // iOS Safari specific: fix viewport height including address bar
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    // Recenter UFO on resize
    if (game.isPlaying) {
        ufo.targetX = canvas.width / 2;
    }
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 100);
});

// Additional iOS viewport fix on scroll/focus
window.addEventListener('scroll', () => {
    window.scrollTo(0, 0);
});

// Game objects
const ufo = {
    x: canvas.width / 2,
    y: 100,
    baseY: 100,
    width: 100,
    height: 50,
    targetX: canvas.width / 2,
    speed: 8,
    rotation: 0,
    beamSpeed: 3 // Base beam capture speed (upgradeable)
};

const targets = [];
const beams = [];
const stars = [];
const clouds = [];

// Initialize stars
for (let i = 0; i < 120; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5,
        speed: Math.random() * 0.3 + 0.1,
        brightness: Math.random()
    });
}

// Initialize clouds
for (let i = 0; i < 4; i++) {
    clouds.push({
        x: Math.random() * canvas.width,
        y: canvas.height - 200 - Math.random() * 100,
        width: 80 + Math.random() * 60,
        speed: 0.2 + Math.random() * 0.3
    });
}

// Weighted random target type selection
function getRandomTargetType() {
    let totalWeight = 0;
    const weights = {};
    
    for (let type in targetTypes) {
        weights[type] = targetTypes[type].spawnWeight;
        totalWeight += weights[type];
    }
    
    let random = Math.random() * totalWeight;
    for (let type in weights) {
        random -= weights[type];
        if (random <= 0) return type;
    }
    return 'cow';
}

// Spawn target with type
function spawnTarget() {
    const type = getRandomTargetType();
    const typeData = targetTypes[type];
    const padding = 50;

    targets.push({
        type: type,
        x: Math.random() * (canvas.width - 100) + padding,
        y: canvas.height - 120 - Math.random() * 120,
        width: typeData.size,
        height: typeData.size,
        isAbducted: false,
        isBeaming: false,
        beamY: 0,
        beamProgress: 0,
        speed: typeData.speed,
        direction: Math.random() > 0.5 ? 1 : -1,
        emoji: typeData.emoji,
        value: typeData.value,
        weight: typeData.weight,
        wobble: 0
    });
}

// Initial spawn - INCREASED count for better gameplay
function spawnInitialTargets() {
    const count = 6; // Increased from 4
    for (let i = 0; i < count; i++) {
        spawnTarget();
    }
}

spawnInitialTargets();

// Drawing functions
function drawBackground() {
    // Night sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#000814');
    gradient.addColorStop(0.4, '#001d3d');
    gradient.addColorStop(0.7, '#001845');
    gradient.addColorStop(1, '#001233');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars with twinkling
    stars.forEach(star => {
        star.brightness += (Math.random() - 0.5) * 0.1;
        star.brightness = Math.max(0.3, Math.min(1, star.brightness));
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });

    // Clouds
    clouds.forEach(cloud => {
        ctx.fillStyle = 'rgba(30, 50, 80, 0.4)';
        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.width, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        
        cloud.x += cloud.speed;
        if (cloud.x > canvas.width + 100) {
            cloud.x = -100;
        }
    });

    // Ground with depth
    const groundGradient = ctx.createLinearGradient(0, canvas.height - 100, 0, canvas.height);
    groundGradient.addColorStop(0, '#1a4d2e');
    groundGradient.addColorStop(1, '#0d2818');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
    
    // Grass details
    ctx.fillStyle = '#245d38';
    for (let i = 0; i < canvas.width; i += 15) {
        const height = Math.random() * 10 + 5;
        ctx.fillRect(i, canvas.height - 100, 8, -height);
    }

    // Fence
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 3;
    for (let i = 0; i < canvas.width; i += 80) {
        ctx.beginPath();
        ctx.moveTo(i, canvas.height - 90);
        ctx.lineTo(i, canvas.height - 140);
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 120);
    ctx.lineTo(canvas.width, canvas.height - 120);
    ctx.stroke();
}

function drawUFO() {
    ctx.save();
    ctx.translate(ufo.x, ufo.y);
    ctx.rotate(ufo.rotation);
    
    // UFO shadow
    ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#00ff88';
    ctx.beginPath();
    ctx.ellipse(0, 30, 60, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // UFO body - cartoon style
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#00ff88';
    
    // Bottom saucer
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.ellipse(0, 5, 55, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Middle band
    ctx.fillStyle = '#00cc70';
    ctx.fillRect(-50, 0, 100, 10);
    
    // Top dome
    ctx.fillStyle = '#00ffaa';
    ctx.beginPath();
    ctx.arc(0, -5, 25, 0, Math.PI, true);
    ctx.closePath();
    ctx.fill();
    
    // Cockpit window
    ctx.fillStyle = 'rgba(0, 200, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(0, -8, 15, 12, 0, 0, Math.PI, true);
    ctx.fill();
    
    // Alien silhouette
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(0, -10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-2, -5, 4, 8);
    
    // Lights on UFO
    const time = Date.now() / 200;
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + time;
        const x = Math.cos(angle) * 40;
        const lightColor = i % 2 === 0 ? '#00ffff' : '#ff00ff';
        ctx.fillStyle = lightColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = lightColor;
        ctx.beginPath();
        ctx.arc(x, 5, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

function drawBeam(beam) {
    ctx.save();
    const gradient = ctx.createLinearGradient(beam.x, beam.y, beam.targetX, beam.targetY);
    gradient.addColorStop(0, 'rgba(0, 255, 136, 0.6)');
    gradient.addColorStop(0.5, 'rgba(0, 255, 200, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 255, 136, 0.1)');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 20;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ff88';
    
    ctx.beginPath();
    ctx.moveTo(beam.x, beam.y);
    ctx.lineTo(beam.targetX, beam.targetY);
    ctx.stroke();
    
    // Beam particles
    for (let i = 0; i < 3; i++) {
        const t = i / 3;
        const x = beam.x + (beam.targetX - beam.x) * t;
        const y = beam.y + (beam.targetY - beam.y) * t;
        ctx.fillStyle = 'rgba(0, 255, 200, 0.8)';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

function drawTarget(target) {
    if (target.isAbducted) {
        // Smooth beam up animation
        const beamSpeed = ufo.beamSpeed + (game.upgrades.beamPower.level * 0.5);
        target.beamY = Math.max(target.beamY - beamSpeed, ufo.y);
        target.y = target.beamY;
        target.wobble += 0.2;

        if (target.beamY <= ufo.y) {
            return false;
        }
    } else {
        // Move target
        target.x += target.speed * target.direction;
        target.wobble += 0.1;

        // Bounce off edges
        if (target.x < 50 || target.x > canvas.width - 50) {
            target.direction *= -1;
        }
    }

    // Draw target
    ctx.save();
    ctx.translate(target.x, target.y);
    ctx.rotate(Math.sin(target.wobble) * 0.1);

    ctx.font = `${target.width}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(target.emoji, 0, 0);

    // Selection indicator
    if (!target.isAbducted && !target.isBeaming) {
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, target.width / 2 + 5, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.restore();
    return true;
}

// Explosion particle system
function createExplosion(x, y) {
    for (let i = 0; i < 50; i++) {
        const angle = (Math.PI * 2 * i) / 50;
        const speed = Math.random() * 5 + 2;
        game.explosionParticles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 10 + 5,
            life: 60,
            maxLife: 60,
            color: Math.random() > 0.5 ? '#ff4444' : '#ffaa00'
        });
    }
}

function drawExplosion() {
    game.explosionParticles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.2; // Gravity
        particle.life--;

        const alpha = particle.life / particle.maxLife;
        ctx.fillStyle = particle.color.replace(')', `, ${alpha})`).replace('#', 'rgba(').replace(/(.{2})(.{2})(.{2})/, (_, r, g, b) => {
            return `rgba(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, ${alpha})`;
        });

        ctx.shadowBlur = 15;
        ctx.shadowColor = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        if (particle.life <= 0) {
            game.explosionParticles.splice(index, 1);
        }
    });
    ctx.shadowBlur = 0;
}

// Game loop
let lastSpawnTime = 0;
const spawnInterval = 1800; // DECREASED from 2000 for faster spawning

function gameLoop() {
    if (!game.isPlaying || game.isGameOver) return;
    if (game.isPaused) {
        requestAnimationFrame(gameLoop);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    // Handle crash animation
    if (game.isCrashing) {
        game.crashAnimationFrame++;

        // Continue moving ship down during crash
        ufo.y += 3;

        // Draw explosion effects
        drawExplosion();
        drawUFO();

        // End crash animation after enough frames
        if (game.crashAnimationFrame > 60) {
            stopGameSounds();
            gameOver();
            return;
        }

        requestAnimationFrame(gameLoop);
        return;
    }

    // Calculate weight-based ship descent - MORE DRAMATIC AND STARTS FROM 0%
    const weightRatio = game.cargoWeight / game.maxWeight;

    // Ship descends progressively as it gains weight (quadratic for more drama)
    // At 0% weight: 0 descent
    // At 50% weight: ~75 pixels descent
    // At 100% weight: ~300 pixels descent
    const descentAmount = Math.pow(weightRatio, 1.5) * 300;
    ufo.baseY = 100 + descentAmount;

    // Smooth UFO horizontal movement toward target
    const dx = ufo.targetX - ufo.x;
    if (Math.abs(dx) > 1) {
        ufo.x += dx * 0.1;
        ufo.rotation = dx * 0.001;
    } else {
        ufo.rotation *= 0.95;
    }

    // Bob UFO slightly
    ufo.y = ufo.baseY + Math.sin(Date.now() / 500) * 8;

    // Draw beams
    beams.forEach((beam, index) => {
        drawBeam(beam);
        beam.life--;
        if (beam.life <= 0) {
            beams.splice(index, 1);
        }
    });

    // Draw and update targets
    for (let i = targets.length - 1; i >= 0; i--) {
        const target = targets[i];
        const keep = drawTarget(target);
        if (!keep) {
            // Target's beam animation completed, remove it
            targets.splice(i, 1);
        }
    }

    // Spawn new targets - INCREASED spawn rate
    const now = Date.now();
    if (now - lastSpawnTime > spawnInterval && targets.length < 10) {
        spawnTarget();
        lastSpawnTime = now;
    }

    drawUFO();

    // Update altitude based on weight
    const altitudeLoss = game.altitudeDecrease * weightRatio * 0.5;
    game.altitude -= altitudeLoss;

    // Gradual altitude recovery when weight is low (encourages strategic trading)
    if (weightRatio < 0.3 && game.altitude < 100) {
        const recoveryRate = 0.15; // Slow recovery
        game.altitude = Math.min(100, game.altitude + recoveryRate);
    }

    // Combo timer
    if (game.combo > 0) {
        game.comboTimer--;
        if (game.comboTimer <= 0) {
            game.combo = 0;
            game.comboMultiplier = 1;
            document.getElementById('comboDisplay').classList.remove('active');
        }
    }

    // Check for critical altitude and trigger crash
    if (game.altitude <= 0 && !game.isCrashing) {
        game.isCrashing = true;
        game.crashAnimationFrame = 0;
        createExplosion(ufo.x, ufo.y);
    }

    updateUI();
    requestAnimationFrame(gameLoop);
}

// Process abduction rewards
function processAbduction(target) {
    // Combo system
    const now = Date.now();
    const baseComboTime = 2000;
    const comboExtension = game.upgrades.comboTime.level * 500;
    const comboWindow = baseComboTime + comboExtension;

    if (now - game.lastAbductTime < comboWindow) {
        game.combo++;
        game.comboMultiplier = 1 + (game.combo * 0.1);
    } else {
        game.combo = 1;
        game.comboMultiplier = 1;
    }
    game.lastAbductTime = now;
    game.comboTimer = 120;

    // Add specimens with multiplier
    const baseValue = target.value * game.specimensPerClick;
    const totalValue = Math.floor(baseValue * game.comboMultiplier);
    game.specimens += totalValue;
    game.cargoWeight += target.weight;
    game.totalAbducted++;

    // Play appropriate sound based on target type
    if (target.type === 'cow') {
        game.cowsAbducted++;
        playSound('cow');
    } else if (target.type === 'chicken') {
        game.chickensAbducted++;
        playSound('chicken');
    } else if (target.type === 'farmer') {
        game.farmersAbducted++;
    }

    updateUI();

    // Particle effect
    const displayText = game.combo > 1 ?
        `+${totalValue} x${game.comboMultiplier.toFixed(1)}` :
        `+${totalValue}`;
    createParticle(target.x, target.y, displayText);

    // Show combo display
    if (game.combo > 2) {
        document.getElementById('comboMultiplier').textContent = game.comboMultiplier.toFixed(1);
        document.getElementById('comboDisplay').classList.add('active');
    }
}

// Input handling - Enhanced for instant, smooth clicker gameplay
function handleInput(x, y) {
    if (!game.isPlaying || game.isGameOver || game.isPaused) return;

    // Update UFO target position for smooth movement
    ufo.targetX = x;

    // Play tractor beam sound
    playSound('tractorBeam');

    let abducted = false;

    // Check if clicked on a target
    targets.forEach(target => {
        if (target.isAbducted) return;

        const distance = Math.sqrt(
            Math.pow(target.x - x, 2) +
            Math.pow(target.y - y, 2)
        );

        if (distance < target.width) {
            // Check if we can carry more weight
            if (game.cargoWeight + target.weight <= game.maxWeight) {
                target.isAbducted = true;
                target.beamY = target.y;

                // Combo system
                const now = Date.now();
                const baseComboTime = 2000;
                const comboExtension = game.upgrades.comboTime.level * 500;
                const comboWindow = baseComboTime + comboExtension;

                if (now - game.lastAbductTime < comboWindow) {
                    game.combo++;
                    game.comboMultiplier = 1 + (game.combo * 0.1);
                } else {
                    game.combo = 1;
                    game.comboMultiplier = 1;
                }
                game.lastAbductTime = now;
                game.comboTimer = 120;

                // Add specimens with multiplier
                const baseValue = target.value * game.specimensPerClick;
                const totalValue = Math.floor(baseValue * game.comboMultiplier);
                game.specimens += totalValue;
                game.cargoWeight += target.weight;
                game.totalAbducted++;

                // Play appropriate sound based on target type
                if (target.type === 'cow') {
                    game.cowsAbducted++;
                    playSound('cow');
                } else if (target.type === 'chicken') {
                    game.chickensAbducted++;
                    playSound('chicken');
                } else if (target.type === 'farmer') {
                    game.farmersAbducted++;
                }

                updateUI();
                abducted = true;

                // Create beam effect
                beams.push({
                    x: ufo.x,
                    y: ufo.y + 20,
                    targetX: target.x,
                    targetY: target.y,
                    life: 30
                });

                // Particle effect
                const displayText = game.combo > 1 ?
                    `+${totalValue} x${game.comboMultiplier.toFixed(1)}` :
                    `+${totalValue}`;
                createParticle(target.x, target.y, displayText);

                // Show combo display
                if (game.combo > 2) {
                    document.getElementById('comboMultiplier').textContent = game.comboMultiplier.toFixed(1);
                    document.getElementById('comboDisplay').classList.add('active');
                }
            } else {
                // Ship is too heavy!
                createParticle(target.x, target.y, '⚠️ TOO HEAVY!', '#ff4444');
            }
        }
    });

    // Visual feedback for missed clicks
    if (!abducted) {
        beams.push({
            x: ufo.x,
            y: ufo.y + 20,
            targetX: x,
            targetY: y,
            life: 15
        });
    }
}

// Mouse/Touch event listeners with improved cross-platform support
// Optimized for desktop, Android Chrome, and iOS Safari
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleInput(x, y);
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    handleInput(x, y);
}, { passive: false });

// Handle multi-touch (prevents zoom on double-tap for iOS)
canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

// Prevent context menu on long press (mobile)
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// iOS-specific: prevent elastic scrolling
document.addEventListener('touchmove', (e) => {
    if (e.target === canvas) {
        e.preventDefault();
    }
}, { passive: false });

function createParticle(x, y, text, color = '#00ff88') {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.textContent = text;
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.color = color;
    particle.style.textShadow = `0 0 10px ${color}`;
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
}

function updateUI() {
    document.getElementById('score').textContent = `SPECIMENS: ${game.specimens}`;
    document.getElementById('cowsAbducted').textContent = game.cowsAbducted;
    document.getElementById('chickensAbducted').textContent = game.chickensAbducted;
    document.getElementById('farmersAbducted').textContent = game.farmersAbducted;
    document.getElementById('altitudeValue').textContent = Math.floor(game.altitude);
    
    // Update weight bar
    const weightPercent = (game.cargoWeight / game.maxWeight) * 100;
    const weightFill = document.getElementById('weightFill');
    weightFill.style.width = weightPercent + '%';
    
    // Update weight status
    const weightStatus = document.getElementById('weightStatus');
    if (weightPercent < 50) {
        weightStatus.textContent = 'OPTIMAL';
        weightStatus.className = 'weight-status optimal';
    } else if (weightPercent < 80) {
        weightStatus.textContent = 'WARNING';
        weightStatus.className = 'weight-status warning';
    } else {
        weightStatus.textContent = 'CRITICAL';
        weightStatus.className = 'weight-status critical';
    }
    
    // Update currency display in shop if open
    const currencyDisplay = document.getElementById('currencyAmount');
    if (currencyDisplay) {
        currencyDisplay.textContent = game.currency;
    }
}

// Trade specimens for currency
function tradeSpecimens() {
    if (game.specimens > 0) {
        const tradeValue = game.specimens * (1 + game.upgrades.tradeBonus.level * 0.2);
        game.currency += Math.floor(tradeValue);
        game.cargoWeight = 0; // Empty cargo
        game.specimens = 0;

        // Restore altitude when emptying cargo - CRITICAL BUG FIX
        // This prevents random crashes when trading
        game.altitude = Math.min(100, game.altitude + 30);

        createParticle(canvas.width / 2, canvas.height / 2, `💰 +${Math.floor(tradeValue)} CURRENCY`, '#ffaa00');
        updateUI();
    }
}

// Upgrades
const upgradeData = [
    {
        id: 'cargoCapacity',
        name: '📦 CARGO CAPACITY',
        desc: 'Increase max weight capacity by 5',
        getCost: () => 50 + (game.upgrades.cargoCapacity.level * 25),
        apply: () => {
            game.upgrades.cargoCapacity.level++;
            game.maxWeight += 5;
        }
    },
    {
        id: 'enginePower',
        name: '🚀 ENGINE POWER',
        desc: 'Reduce weight impact on altitude',
        getCost: () => 100 + (game.upgrades.enginePower.level * 50),
        apply: () => {
            game.upgrades.enginePower.level++;
            game.altitudeDecrease *= 0.8;
        }
    },
    {
        id: 'beamPower',
        name: '⚡ BEAM POWER',
        desc: 'Increase specimens per click',
        getCost: () => 75 + (game.upgrades.beamPower.level * 40),
        apply: () => {
            game.upgrades.beamPower.level++;
            game.specimensPerClick = 1 + game.upgrades.beamPower.level;
        }
    },
    {
        id: 'comboTime',
        name: '⏱️ COMBO EXTENDER',
        desc: 'Longer combo window',
        getCost: () => 150 + (game.upgrades.comboTime.level * 75),
        apply: () => {
            game.upgrades.comboTime.level++;
        }
    },
    {
        id: 'tradeBonus',
        name: '💎 TRADE BONUS',
        desc: '+20% currency from trades',
        getCost: () => 200 + (game.upgrades.tradeBonus.level * 100),
        apply: () => {
            game.upgrades.tradeBonus.level++;
        }
    }
];

function renderShop() {
    const list = document.getElementById('upgradeList');
    list.innerHTML = '';
    
    upgradeData.forEach(upgrade => {
        const cost = upgrade.getCost();
        const level = game.upgrades[upgrade.id].level;
        const canAfford = game.currency >= cost;
        
        const item = document.createElement('div');
        item.className = 'upgrade-item';
        item.style.opacity = canAfford ? '1' : '0.5';
        item.innerHTML = `
            <div class="upgrade-name">${upgrade.name} [Lv.${level}]</div>
            <div class="upgrade-desc">${upgrade.desc}</div>
            <div class="upgrade-cost">💰 ${cost} Currency</div>
        `;
        
        if (canAfford) {
            item.style.cursor = 'pointer';
            item.onclick = () => {
                game.currency -= cost;
                upgrade.apply();
                updateUI();
                renderShop();
                createParticle(canvas.width / 2, 150, '⬆️ UPGRADED!', '#00ff88');
            };
        }
        
        list.appendChild(item);
    });
}

// Game Over
function gameOver() {
    game.isGameOver = true;
    game.isPlaying = false;
    
    document.getElementById('finalSpecimens').textContent = game.specimens;
    document.getElementById('finalCurrency').textContent = game.currency;
    document.getElementById('finalAbductions').textContent = game.totalAbducted;
    document.getElementById('gameOverScreen').classList.add('active');
}

function resetGame() {
    // Keep currency and upgrades
    const savedCurrency = game.currency;
    const savedUpgrades = JSON.parse(JSON.stringify(game.upgrades));
    const savedSettings = {
        soundsEnabled: game.soundsEnabled,
        musicEnabled: game.musicEnabled,
        difficulty: game.difficulty
    };

    // Reset game state
    game.specimens = 0;
    game.currency = savedCurrency;
    game.specimensPerClick = 1 + game.upgrades.beamPower.level;
    game.cowsAbducted = 0;
    game.chickensAbducted = 0;
    game.farmersAbducted = 0;
    game.totalAbducted = 0;
    game.maxWeight = 20 + (game.upgrades.cargoCapacity.level * 5);
    game.cargoWeight = 0;
    game.altitude = 100;
    game.combo = 0;
    game.comboTimer = 0;
    game.comboMultiplier = 1;
    game.upgrades = savedUpgrades;
    game.isPlaying = true;
    game.isGameOver = false;
    game.isPaused = false;
    game.isCrashing = false;
    game.crashAnimationFrame = 0;
    game.explosionParticles = [];
    game.soundsEnabled = savedSettings.soundsEnabled;
    game.musicEnabled = savedSettings.musicEnabled;
    game.difficulty = savedSettings.difficulty;

    // Reset UFO position
    ufo.x = canvas.width / 2;
    ufo.y = 100;
    ufo.baseY = 100;
    ufo.targetX = canvas.width / 2;

    // Clear targets
    targets.length = 0;
    beams.length = 0;
    spawnInitialTargets();

    document.getElementById('gameOverScreen').classList.remove('active');

    // Restart game sounds
    startGameSounds();

    updateUI();
    gameLoop();
}

// Pause/Resume game
function togglePause() {
    game.isPaused = !game.isPaused;

    const pauseModal = document.getElementById('pauseModal');
    if (game.isPaused) {
        pauseModal.classList.add('active');
        pauseGameSounds();
        // Fade in menu music
        sounds.startScreen.volume = 0;
        sounds.startScreen.play().catch(e => console.log('Menu music prevented:', e));
        fadeAudio(sounds.startScreen, 0.4, 500);
    } else {
        pauseModal.classList.remove('active');
        resumeGameSounds();
        // Fade out menu music
        fadeAudio(sounds.startScreen, 0, 500);
    }
}

// Update settings
function updateSettings() {
    const sfxCheckbox = document.getElementById('sfxToggle');
    const musicCheckbox = document.getElementById('musicToggle');
    const difficultySelect = document.getElementById('difficultySelect');

    game.soundsEnabled = sfxCheckbox.checked;
    game.musicEnabled = musicCheckbox.checked;
    game.difficulty = difficultySelect.value;

    // Apply music setting immediately
    if (!game.musicEnabled && sounds.gameMusic && !sounds.gameMusic.paused) {
        fadeAudio(sounds.gameMusic, 0, 300);
    } else if (game.musicEnabled && game.isPlaying && !game.isPaused && sounds.gameMusic.paused) {
        sounds.gameMusic.volume = 0;
        sounds.gameMusic.play().catch(e => console.log('Game music prevented:', e));
        fadeAudio(sounds.gameMusic, 0.85, 300);
    }

    createParticle(canvas.width / 2, 150, '✓ SETTINGS SAVED', '#00ff88');
}

// Event listeners
document.getElementById('startBtn').addEventListener('click', () => {
    document.getElementById('menuScreen').style.display = 'none';
    game.isPlaying = true;
    
    // Transition from menu music to game sounds
    startGameSounds();
    
    gameLoop();
});

document.getElementById('tradeBtn').addEventListener('click', () => {
    tradeSpecimens();
});

document.getElementById('shopBtn').addEventListener('click', () => {
    document.getElementById('shopModal').classList.add('active');
    renderShop();
});

document.querySelector('.close-btn').addEventListener('click', () => {
    document.getElementById('shopModal').classList.remove('active');
});

document.getElementById('restartBtn').addEventListener('click', () => {
    resetGame();
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    togglePause();
});

document.getElementById('resumeBtn').addEventListener('click', () => {
    togglePause();
});

document.getElementById('applySettingsBtn').addEventListener('click', () => {
    updateSettings();
});

document.getElementById('quitBtn').addEventListener('click', () => {
    // Stop game
    game.isPlaying = false;
    game.isPaused = false;
    game.isGameOver = true;

    // Close pause modal
    document.getElementById('pauseModal').classList.remove('active');

    // Stop all game sounds
    stopGameSounds();

    // Show menu screen
    document.getElementById('menuScreen').style.display = 'flex';

    // Start menu music
    sounds.startScreen.volume = 0;
    sounds.startScreen.play().catch(e => console.log('Menu music prevented:', e));
    fadeAudio(sounds.startScreen, 0.4, 1000);

    // Reset game state for next play
    game.specimens = 0;
    game.cargoWeight = 0;
    game.altitude = 100;
    game.cowsAbducted = 0;
    game.chickensAbducted = 0;
    game.farmersAbducted = 0;
    game.totalAbducted = 0;
    game.combo = 0;
    game.comboMultiplier = 1;
    game.isCrashing = false;
    game.crashAnimationFrame = 0;
    game.explosionParticles = [];
    targets.length = 0;
    beams.length = 0;
    ufo.x = canvas.width / 2;
    ufo.y = 100;
    ufo.baseY = 100;

    updateUI();
});

// Animate menu stars
function animateMenuStars() {
    const menu = document.getElementById('menuScreen');
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'menu-stars';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        menu.appendChild(star);
    }
}
animateMenuStars();

// Start menu music on page load
startBackgroundMusic();

// Initialize
updateUI();
