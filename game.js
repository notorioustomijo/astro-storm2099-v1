import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Spaceship
const shipGeometry = new THREE.BoxGeometry(1, 1, 1);
const shipMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00});
const ship = new THREE.Mesh(shipGeometry, shipMaterial);
scene.add(ship);
ship.position.y = -3;
camera.position.z = 5;

const move = { up: false, down: false, left: false, right: false };
const speed = 0.1;
const projectiles = [];
const aliens = [];
let score = 0;
let level = 1;
let gameOver = false;
let shootCooldown = 500;
let lastShot = 0;

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

document.addEventListener('keydown', (e) => {
    if (gameOver) return;
    if (e.key === 'ArrowUp' || e.key === 'w') move.up = true;
    if (e.key === 'ArrowDown' || e.key === 's') move.down = true;
    if (e.key === 'ArrowLeft' || e.key === 'a') move.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') move.right = true;
    if (e.key === ' ' && Date.now() - lastShot > shootCooldown) {
        lastShot = Date.now();
        const laserGeometry = new THREE.BoxGeometry(0.2, 0.5, 0.2);
        const laserMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const laser = new THREE.Mesh(laserGeometry, laserMaterial);
        laser.position.set(ship.position.x, ship.position.y + 0.5, 0);
        scene.add(laser);
        projectiles.push(laser);
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w') move.up = false;
    if (e.key === 'ArrowDown' || e.key === 's') move.down = false;
    if (e.key === 'ArrowLeft' || e.key === 'a') move.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') move.right = false;
});

let spawnInterval = 3000;
setInterval(() => {
    if (gameOver) return;
    const alienGeometry = new THREE.BoxGeometry(1, 1, 1);
    const alienMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const alien = new THREE.Mesh(alienGeometry, alienMaterial);
    alien.position.set(Math.random() * 10 - 5, 5, 0);
    scene.add(alien);
    aliens.push(alien);
}, spawnInterval);

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
    aliens.forEach((alien) => {
        const distance = Math.sqrt(
            (ship.position.x - alien.position.x) ** 2 + (ship.position.y - alien.position.y) ** 2
        );
        if (distance < 1) {
            gameOver = true;
            gameOverElement.textContent = `Game Over - Score: ${score}`;
            gameOverElement.style.display = 'block';
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    if (gameOver) return;
    
    if (move.up && ship.position.y < 4) ship.position.y += speed;
    if (move.down && ship.position.y > -4) ship.position.y -= speed;
    if (move.left && ship.position.x > -6) ship.position.x -= speed;
    if (move.right && ship.position.x < 6) ship.position.x += speed;

    projectiles.forEach((laser, pIndex) => {
        laser.position.y += 0.2;
        if (laser.position.y > 5) {
            scene.remove(laser);
            projectiles.splice(pIndex, 1);
        }
    });

    aliens.forEach((alien, aIndex) => {
        alien.position.y -= 0.05;
        if (alien.position.y < -5) {
            scene.remove(alien);
            aliens.splice(aIndex, 1);
        }
        projectiles.forEach((laser, pIndex) => {
            const distance = Math.sqrt(
                (laser.position.x - alien.position.x) ** 2 + (laser.position.y - alien.position.y) ** 2
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

    checkGameOver();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

