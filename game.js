import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.module.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Hide the default cursor on the canvas
renderer.domElement.style.cursor = 'none';

// Starry background
const starGeometry = new THREE.BufferGeometry();
const starCount = 1000;
const positions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 50;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

//Player data
const selfUsername = 'spacePilot';
const playerColor = "E0E0E0";
let currentSpeed = 0;
const gameUrl = 'https://astro-stormv1.netlify.app/';

// Spaceship
const spaceship = new THREE.Group();
scene.add(spaceship);
spaceship.position.set(0, 0, 0);
spaceship.visible = true;

// Main body: Triangular shape
const shipShape = new THREE.Shape();
shipShape.moveTo(0, 0.5);
shipShape.lineTo(-0.25, -0.25);
shipShape.lineTo(0.25, -0.25);
shipShape.lineTo(0, 0.5);
const shipGeometry = new THREE.ShapeGeometry(shipShape);
const shipMaterial = new THREE.MeshBasicMaterial({ color: 0xE0E0E0 });
const shipBody = new THREE.Mesh(shipGeometry, shipMaterial);
spaceship.add(shipBody);

// Cockpit: Small dome near the tip
const cockpitGeometry = new THREE.SphereGeometry(0.1, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
const cockpitMaterial = new THREE.MeshBasicMaterial({ color: 0x00008B, transparent: true, opacity: 0.5 });
const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
cockpit.position.set(0, 0.125, 0);
spaceship.add(cockpit);

// Weapons: L-shaped, connected to the spaceship body
const weaponMaterial = new THREE.MeshBasicMaterial({ color: 0xE0E0E0 });

// Left weapon
const weaponLeft = new THREE.Group();
spaceship.add(weaponLeft);
const weaponHorizontalLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.02, 0.02),
    weaponMaterial
);
weaponHorizontalLeft.position.set(-0.2167, 0, 0);
weaponLeft.add(weaponHorizontalLeft);
const weaponVerticalLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.05, 0.02),
    weaponMaterial
);
weaponVerticalLeft.position.set(-0.2667, 0.025, 0);
weaponLeft.add(weaponVerticalLeft);

// Right weapon
const weaponRight = new THREE.Group();
spaceship.add(weaponRight);
const weaponHorizontalRight = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.02, 0.02),
    weaponMaterial
);
weaponHorizontalRight.position.set(0.2167, 0, 0);
weaponRight.add(weaponHorizontalRight);
const weaponVerticalRight = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.05, 0.02),
    weaponMaterial
);
weaponVerticalRight.position.set(0.2667, 0.025, 0);
weaponRight.add(weaponVerticalRight);

// Firing effects for weapons
const firingEffectGeometry = new THREE.ConeGeometry(0.015, 0.05, 8);
const firingEffectMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.8 });

// Left weapon firing effect
const firingEffectLeft = new THREE.Mesh(firingEffectGeometry, firingEffectMaterial);
firingEffectLeft.position.set(-0.2667, 0.05, 0);
firingEffectLeft.rotation.x = Math.PI / 2;
firingEffectLeft.visible = false;
weaponLeft.add(firingEffectLeft);

// Right weapon firing effect
const firingEffectRight = new THREE.Mesh(firingEffectGeometry, firingEffectMaterial);
firingEffectRight.position.set(0.2667, 0.05, 0);
firingEffectRight.rotation.x = Math.PI / 2;
firingEffectRight.visible = false;
weaponRight.add(firingEffectRight);

// Boosters: Small cones at the back
const boosterGeometry = new THREE.ConeGeometry(0.025, 0.1, 8);
const boosterMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const boosterLeft = new THREE.Mesh(boosterGeometry, boosterMaterial);
boosterLeft.position.set(-0.1, -0.25, 0);
boosterLeft.rotation.x = Math.PI;
spaceship.add(boosterLeft);
const boosterRight = new THREE.Mesh(boosterGeometry, boosterMaterial);
boosterRight.position.set(0.1, -0.25, 0);
boosterRight.rotation.x = Math.PI;
spaceship.add(boosterRight);

// Booster flames
const flameGeometry = new THREE.ConeGeometry(0.02, 0.1, 8);
const flameMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500, transparent: true, opacity: 0.8 });
const flameLeft = new THREE.Mesh(flameGeometry, flameMaterial);
flameLeft.position.set(-0.1, -0.3, 0);
flameLeft.rotation.x = Math.PI;
spaceship.add(flameLeft);
const flameRight = new THREE.Mesh(flameGeometry, flameMaterial);
flameRight.position.set(0.1, -0.3, 0);
flameRight.rotation.x = Math.PI;
spaceship.add(flameRight);

//Create start portal (if entering via portal)
let startPortalBox = null;
if (new URLSearchParams(window.location.search).get('portal')) {
    const startPortalGroup = new THREE.Group();
    startPortalGroup.position.set(0, 0, 0);
    startPortalGroup.rotation.z = 0;

    const startPortalGeometry = new THREE.TorusGeometry(0.5, 0.05, 16, 100);
    const startPortalMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.8
    });
    const startPortal = new THREE.Mesh(startPortalGeometry, startPortalMaterial);
    startPortalGroup.add(startPortal);

    const startPortalInnerGeometry = new THREE.CircleGeometry(0.4, 32);
    const startPortalInnerMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });
    const startPortalInner = new THREE.Mesh(startPortalInnerGeometry, startPortalInnerMaterial);
    startPortalGroup.add(startPortalInner);

    const startPortalParticleCount = 100;
    const startPortalParticles = new THREE.BufferGeometry();
    const startPortalPositions = new Float32Array(startPortalParticleCount * 3);
    const startPortalColors = new Float32Array(startPortalParticleCount * 3);

    for (let i = 0; i < startPortalParticleCount * 3; i += 3) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.5 + (Math.random() - 0.5) * 0.2;
        startPortalPositions[i] = Math.cos(angle) * radius;
        startPortalPositions[i + 1] = Math.sin(angle) * radius;
        startPortalPositions[i + 2] = 0;

        startPortalColors[i] = 0.8 + Math.random() * 0.2;
        startPortalColors[i + 1] = 0;
        startPortalColors[i + 2] = 0;
    }

    startPortalParticles.setAttribute('position', new THREE.BufferAttribute(startPortalPositions, 3));
    startPortalParticles.setAttribute('color', new THREE.BufferAttribute(startPortalColors, 3));

    const startPortalParticleMaterial = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
        transparent: true,
        opacity: 0.6
    });

    const startPortalParticleSystem = new THREE.Points(startPortalParticles, startPortalParticleMaterial);
    startPortalGroup.add(startPortalParticleSystem);

    scene.add(startPortalGroup);
    startPortalBox = new THREE.Box3().setFromObject(startPortalGroup);

    function animateStartPortal() {
        const positions = startPortalParticles.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += 0.005 * Math.sin(Date.now() * 0.001 + i);
        }
        startPortalParticles.attributes.position.needsUpdate = true;
        requestAnimationFrame(animateStartPortal);
    }
    animateStartPortal();
}

//Create exit portal
let exitPortalBox = null;
const exitPortalGroup = new THREE.Group();
exitPortalGroup.position.set(5, 3, 0);
exitPortalGroup.rotation.z = 0;

const exitPortalGeometry = new THREE.TorusGeometry(0.5, 0.05, 16, 100);
const exitPortalMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
});
const exitPortalInner = new THREE.Mesh(exitPortalInnerGeometry, exitPortalInnerMaterial);
exitPortalGroup.add(exitPortalInner);

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
canvas.width = 256;
canvas.height = 32;
context.fillStyle = '#00ff00';
context.font = 'bold 16px Arial';
context.textAlign = 'center';
context.fillText('VIBEVERSE PORTAL', canvas.width / 2, canvas.height / 2);
const texture = new THREE.CanvasTexture(canvas);
const labelGeometry = new THREE.PlaneGeometry(1.5, 0.2);
const labelMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
});
const label = new THREE.Mesh(labelGeometry, labelMaterial);
label.position.y = 0.7;
exitPortalGroup.add(label);

const exitPortalParticleCount = 100;
const exitPortalParticles = new THREE.BufferGeometry();
const exitPortalPositions = new Float32Array(exitPortalParticleCount * 3);
const exitPortalColors = new Float32Array(exitPortalParticleCount * 3);

for (let i = 0; i < exitPortalParticleCount * 3; i += 3) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.5 + (Math.random() - 0.5) * 0.2;
    exitPortalPositions[i] = Math.cos(angle) * radius;
    exitPortalPositions[i + 1] = Math.sin(angle) * radius;
    exitPortalPositions[i + 2] = 0;

    exitPortalColors[i] = 0;
    exitPortalColors[i + 1] = 0.8 + Math.random() * 0.2;
    exitPortalColors[i + 2] = 0;
}

exitPortalParticles.setAttribute('position', new THREE.BufferAttribute(exitPortalPositions, 3));
exitPortalParticles.setAttribute('color', new THREE.BufferAttribute(exitPortalColors, 3));

const exitPortalParticleMaterial = new THREE.PointsMaterial({
    size: 0.02,
    vertexColors: true,
    transparent: true,
    opacity: 0.6
});

const exitPortalParticleSystem = new THREE.Points(exitPortalParticles, exitPortalParticleMaterial);
exitPortalGroup.add(exitPortalParticleSystem);

scene.add(exitPortalGroup);

exitPortalBox = new THREE.Box3().setFromObject(exitPortalGroup);

function animateExitPortal() {
    const positions = exitPortalParticles.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += 0.005 * Math.sin(Date.now() * 0.001 + i);
    }
    exitPortalParticles.attributes.positon.needsUpdate = true;
    requestAnimationFrame(animateExitPortal);
}
animateExitPortal();

camera.position.z = 5;

// Game state
const projectiles = [];
const aliens = [];
const powerUps = [];
const indicators = [];
let score = 0;
let level = 1;
let gameOver = false;
let shootCooldown = 200;
let lastShot = 0;

// HUD Elements
const scoreElement = document.createElement('div');
scoreElement.style.position = 'absolute';
scoreElement.style.top = '10px';
scoreElement.style.left = '10px';
scoreElement.style.color = 'white';
scoreElement.style.fontSize = '20px';
document.body.appendChild(scoreElement);
scoreElement.textContent = `Score: ${score} | Level: ${level}`;

const gameOverElement = document.createElement('div');
gameOverElement.style.position = 'absolute';
gameOverElement.style.top = '50%';
gameOverElement.style.left = '50%';
gameOverElement.style.transform = 'translate(-50%, -50%)';
gameOverElement.style.color = 'red';
gameOverElement.style.fontSize = '40px';
gameOverElement.style.display = 'none';
document.body.appendChild(gameOverElement);

const laserGeometry = new THREE.SphereGeometry(0.025, 16, 16);
const laserMaterial = new THREE.MeshBasicMaterial({ color: 0xffff99 });

// Mouse direction indicator
const mouseIndicatorGeometry = new THREE.RingGeometry(0.04, 0.05, 16);
const mouseIndicatorMaterial = new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.DoubleSide });
const mouseIndicator = new THREE.Mesh(mouseIndicatorGeometry, mouseIndicatorMaterial);
scene.add(mouseIndicator);

// Mouse movement
let targetPosition = new THREE.Vector2(spaceship.position.x, spaceship.position.y);
document.addEventListener('mousemove', (e) => {
    if (gameOver) return;
    const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    const vector = new THREE.Vector3(mouseX, mouseY, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
    targetPosition.set(pos.x, pos.y);
});

document.addEventListener('click', () => {
    if (gameOver) return;
    if (Date.now() - lastShot > shootCooldown) {
        lastShot = Date.now();
        const angle = spaceship.rotation.z;
        const firingAngle = angle + Math.PI / 2;

        // Left weapon position
        const weaponOffsetLeft = new THREE.Vector2(-0.2667, 0.05).rotateAround(new THREE.Vector2(0, 0), angle);
        const laserLeft = new THREE.Mesh(laserGeometry, laserMaterial);
        laserLeft.position.set(
            spaceship.position.x + weaponOffsetLeft.x,
            spaceship.position.y + weaponOffsetLeft.y,
            0
        );
        laserLeft.userData = { direction: new THREE.Vector2(Math.cos(firingAngle), Math.sin(firingAngle)) };
        scene.add(laserLeft);
        projectiles.push(laserLeft);

        // Show firing effect for left weapon
        firingEffectLeft.visible = true;
        firingEffectLeft.scale.set(1, 1, 1);
        setTimeout(() => {
            firingEffectLeft.visible = false;
        }, 100);

        // Right weapon position
        const weaponOffsetRight = new THREE.Vector2(0.2667, 0.05).rotateAround(new THREE.Vector2(0, 0), angle);
        const laserRight = new THREE.Mesh(laserGeometry, laserMaterial);
        laserRight.position.set(
            spaceship.position.x + weaponOffsetRight.x,
            spaceship.position.y + weaponOffsetRight.y,
            0
        );
        laserRight.userData = { direction: new THREE.Vector2(Math.cos(firingAngle), Math.sin(firingAngle)) };
        scene.add(laserRight);
        projectiles.push(laserRight);

        // Show firing effect for right weapon
        firingEffectRight.visible = true;
        firingEffectRight.scale.set(1, 1, 1);
        setTimeout(() => {
            firingEffectRight.visible = false;
        }, 100);
    }
});

// Enemy spawning with radar indicators
let spawnInterval = 3000;
const spawnWarningDuration = 1000;

function spawnEnemyWithIndicator() {
    if (gameOver) return;

    const side = Math.floor(Math.random() * 4);
    let spawnX, spawnY;

    switch (side) {
        case 0: // Top
            spawnX = Math.random() * 12 - 6;
            spawnY = 4.5;
            break;
        case 1: // Bottom
            spawnX = Math.random() * 12 - 6;
            spawnY = -4.5;
            break;
        case 2: // Left
            spawnX = -6.5;
            spawnY = Math.random() * 8 - 4;
            break;
        case 3: // Right
            spawnX = 6.5;
            spawnY = Math.random() * 8 - 4;
            break;
    }

    //Create the indicator as a line
    const indicatorPath = new THREE.Path();
    indicatorPath.moveTo(0, 0.5); //Top point
    indicatorPath.lineTo(-0.15, 0.3); //First segment of the top curve
    indicatorPath.lineTo(-0.25, 0.1); //Second segment of the top curve
    indicatorPath.lineTo(-0.2, 0); //Sharp inward point
    indicatorPath.lineTo(-0.25, -0.1); //First segment of the bottom curve
    indicatorPath.lineTo(-0.15, -0.3); //Second segment of the bottom curve
    indicatorPath.lineTo(0, -0.5); //Bottom point

    const indicatorCurve = new THREE.CatmullRomCurve3(indicatorPath.getPoints(10).map(p => new THREE.Vector3(p.x, p.y, 0)));
    const indicatorGeometry = new THREE.TubeGeometry(indicatorCurve, 20, 0.005, 8, false); //small radius for a thin tube
    const indicator = new THREE.Line(indicatorGeometry, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    indicator.visible = true;
    spaceship.add(indicator);
    indicators.push({ mesh: indicator, spawnX, spawnY, spawnTime: Date.now() });
    console.log("Indicator created:", indicators);

    const directionToEnemy = new THREE.Vector2(spawnX - spaceship.position.x, spawnY - spaceship.position.y).normalize();
    const distanceFromShip = 0.4;
    indicator.position.set(
        directionToEnemy.x * distanceFromShip,
        directionToEnemy.y * distanceFromShip,
        0.1
    );
    indicator.rotation.z = Math.atan2(directionToEnemy.y, directionToEnemy.x) + Math.PI / 2;

    setTimeout(() => {
        const alienGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const alienMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const alien = new THREE.Mesh(alienGeometry, alienMaterial);
        alien.position.set(spawnX, spawnY, 0);

        const direction = new THREE.Vector2(0 - spawnX, 0 - spawnY).normalize();
        alien.userData = { direction: direction };

        scene.add(alien);
        aliens.push(alien);
    }, spawnWarningDuration);
}

setInterval(spawnEnemyWithIndicator, spawnInterval);

// Power-up spawning
setInterval(() => {
    if (gameOver || Math.random() > 0.1) return;
    const powerUpGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const powerUpMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const powerUp = new THREE.Mesh(powerUpGeometry, powerUpMaterial);
    powerUp.position.set(Math.random() * 10 - 5, 5, 0);
    scene.add(powerUp);
    powerUps.push(powerUp);
}, 3000);

function updateLevel() {
    if (score >= level * 10) {
        level += 1;
        spawnInterval = Math.max(500, 2000 - (level * 200));
        if (level % 3 === 0) {
            shootCooldown = 200;
            setTimeout(() => shootCooldown = 500, 5000);
        }
    }
}

function checkGameOver() {
    aliens.forEach((alien, aIndex) => {
        const distance = Math.sqrt(
            (spaceship.position.x - alien.position.x) ** 2 +
            (spaceship.position.y - alien.position.y) ** 2
        );
        if (distance < 1) {
            gameOver = true;
            gameOverElement.textContent = `Game Over - Score: ${score}`;
            gameOverElement.style.display = 'block';
        }
    });
}

function wrapAround(object, xLimit = 6, yLimit = 4) {
    if (object.position.x > xLimit) object.position.x = -xLimit;
    if (object.position.x < -xLimit) object.position.x = xLimit;
    if (object.position.y > yLimit) object.position.y = -yLimit;
    if (object.position.y < -yLimit) object.position.y = yLimit;
}

function animate() {
    requestAnimationFrame(animate);
    if (gameOver) return;

    // Calculate distance between spaceship and ring (mouse position)
    const distanceToMouse = Math.sqrt(
        (spaceship.position.x - targetPosition.x) ** 2 +
        (spaceship.position.y - targetPosition.y) ** 2
    );

    // Rotate spaceship to face the ring
    const dx = targetPosition.x - spaceship.position.x;
    const dy = targetPosition.y - spaceship.position.y;
    const angle = Math.atan2(dy, dx);
    spaceship.rotation.z = angle - Math.PI / 2;

    // Adjust speed based on distance
    const stopThreshold = 0.1;
    let speedFactor = 0;
    if (distanceToMouse > stopThreshold) {
        speedFactor = Math.min(distanceToMouse / 5, 1);
        const maxSpeed = 0.1;
        const currentSpeed = maxSpeed * speedFactor;
        const direction = new THREE.Vector2(dx, dy).normalize();
        spaceship.position.x += direction.x * currentSpeed;
        spaceship.position.y += direction.y * currentSpeed;
    }

    // Adjust booster size and flames based on speed
    const boosterScale = 0.5 + (1.5 - 0.5) * speedFactor;
    boosterLeft.scale.set(1, boosterScale, 1);
    boosterRight.scale.set(1, boosterScale, 1);
    const flameScale = 0.5 + (2.0 - 0.5) * speedFactor;
    flameLeft.scale.set(1, flameScale, 1);
    flameRight.scale.set(1, flameScale, 1);

    // Set ring position to mouse position
    mouseIndicator.position.set(targetPosition.x, targetPosition.y, 0);

    // Update indicators
    indicators.forEach((indicatorData, i) => {
        const { mesh, spawnX, spawnY, spawnTime } = indicatorData;
        const directionToEnemy = new THREE.Vector2(spawnX - spaceship.position.x, spawnY - spaceship.position.y).normalize();
        const distanceFromShip = 0.4;
        mesh.position.set(
            directionToEnemy.x * distanceFromShip,
            directionToEnemy.y * distanceFromShip,
            0.1
        );
        mesh.rotation.z = Math.atan2(directionToEnemy.y, directionToEnemy.x) + Math.PI / 2;

        const enemyPos = new THREE.Vector2(spawnX, spawnY);
        const speed = 0.05;
        const direction = new THREE.Vector2(0 - spawnX, 0 - spawnY).normalize();
        const timeElapsed = (Date.now() - spawnTime) - spawnWarningDuration;
        if (timeElapsed > 0) {
            enemyPos.x += direction.x * speed * (timeElapsed / 16);
            enemyPos.y += direction.y * speed * (timeElapsed / 16);
        }

        if (
            enemyPos.x >= -6 && enemyPos.x <= 6 &&
            enemyPos.y >= -4 && enemyPos.y <= 4
        ) {
            spaceship.remove(mesh);
            indicators.splice(i, 1);
        }
    });

    // Projectiles
    projectiles.forEach((laser, pIndex) => {
        if (laser.userData.direction) {
            laser.position.x += laser.userData.direction.x * 0.2;
            laser.position.y += laser.userData.direction.y * 0.2;
        } else {
            laser.position.y += 0.2;
        }
        if (laser.position.y > 10 || laser.position.y < -10 || laser.position.x > 10 || laser.position.x < -10) {
            scene.remove(laser);
            projectiles.splice(pIndex, 1);
        }
    });

    // Aliens
    aliens.forEach((alien, aIndex) => {
        const speed = 0.05;
        alien.position.x += alien.userData.direction.x * speed;
        alien.position.y += alien.userData.direction.y * speed;

        if (
            alien.position.x < -7 || alien.position.x > 7 ||
            alien.position.y < -5 || alien.position.y > 5
        ) {
            scene.remove(alien);
            aliens.splice(aIndex, 1);
        }

        projectiles.forEach((laser, pIndex) => {
            const distance = Math.sqrt(
                (laser.position.x - alien.position.x) ** 2 +
                (laser.position.y - alien.position.y) ** 2
            );
            if (distance < 0.7) {
                scene.remove(laser);
                scene.remove(alien);
                projectiles.splice(pIndex, 1);
                aliens.splice(aIndex, 1);
                score += 1;
                scoreElement.textContent = `Score: ${score} | Level: ${level}`;
                updateLevel();
            }
        });
    });

    // Power-ups
    powerUps.forEach((powerUp, pIndex) => {
        powerUp.position.y -= 0.03;
        if (powerUp.position.y < -5) {
            scene.remove(powerUp);
            powerUps.splice(pIndex, 1);
        }
        const distance = Math.sqrt(
            (spaceship.position.x - powerUp.position.x) ** 2 +
            (spaceship.position.y - powerUp.position.y) ** 2
        );
        if (distance < 0.7) {
            scene.remove(powerUp);
            powerUps.splice(pIndex, 1);
            shootCooldown = 100;
            setTimeout(() => shootCooldown = 500, 5000);
        }
    });

    //Update current speed
    currentSpeed = speedFactor * 0.1;

    //Check if player has entered start portal
    if (new URLSearchParams(window.location.search).get('portal') && startPortalBox) {
        const playerBox = new THREE.Box3().setFromObject(spaceship);
        const portalDistance = playerBox.getCenter(new THREE.Vector3()).distanceTo(startPortalBox.getCenter(new THREE.Vector3()));
        if (portalDistance < 0.5) {
            const urlParams = new URLSearchParams(window.location.search);
            const refUrl = urlParams.get('ref');
            if (refUrl) {
                let url = refUrl;
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = 'https://' + url;
                }
                const currentParams = new URLSearchParams(window.location.search);
                const newParams = new URLSearchParams();
                for (const [key, value] of currentParams) {
                    if (key !== 'ref') {
                        newParams.append(key, value);
                    }
                }
                newParams.append('portal', 'true');
                const paramString = newParams.toString();
                window.location.href = url + (paramString ? '?' + paramString : '');
            }
        }
    }

    //Check if player has entered exit portal
    if (exitPortalBox) {
        const playerBox = new THREE.Box3().setFromObject(spaceship);
        const portalDistance = playerBox.getCenter(new THREE.Vector3()).distanceTo(exitPortalBox.getCenter(new THREE.Vector3()));
        if (portalDistance < 0.5) {
            const currentParams = new URLSearchParams(window.location.search);
            const newParams = new URLSearchParams();
            newParams.append('portal', 'true');
            newParams.append('username', selfUsername);
            newParams.append('color', playerColor);
            newParams.append('speed', currentSpeed.toFixed(2));
            newParams.append('ref', gameUrl);

            newParams.append('speed_x', (speedFactor * 0.1 * Math.cos(angle)).toFixed(2));
            newParams.append('speed_y', (speedFactor * 0.1 * Math.sin(angle)).toFixed(2));
            newParams.append('speed_z', '0');
            newParams.append('rotation_x', '0');
            newParams.append('rotation_y', '0');
            newParams.append('rotation_z', spaceship.rotation.z.toFixed(2));

            const paramString = newParams.toString();
            const nextPage = 'http://portal.pieter.com' + (paramString ? '?' + paramString : '');

            if (!document.getElementById('preloadFrame')) {
                const iframe = document.createElement('iframe');
                iframe.id = 'preloadFrame';
                iframe.style.display = 'none';
                iframe.src = nextPage;
                document.body.appendChild(iframe);
            }

            if (playerBox.intersectsBox(exitPortalBox)) {
                window.location.href = nextPage;
            }
        }
    }

    checkGameOver();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});