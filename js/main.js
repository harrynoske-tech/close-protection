document.addEventListener("contextmenu", (e) => e.preventDefault());

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const crosshairImage = new Image();
const maxAimDistance = Math.max(canvas.width, canvas.height);
crosshairImage.src = "assets/sprites/crosshair.png";

// --------------------------------------------------
// SCREEN
// --------------------------------------------------

function resize() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    leftStick.y = canvas.height - 120;

    rightStick.x = canvas.width - 120;
    rightStick.y = canvas.height - 120;

}


// --------------------------------------------------
// JOYSTICKS
// --------------------------------------------------

const leftStick = {
    x: 120,
    y: 0,
    radius: 70
};

const rightStick = {
    x: 0,
    y: 0,
    radius: 70
};

window.addEventListener("resize", resize);
resize();

let moveTouch = null;
let shootTouch = null;

let moveX = 0;
let moveY = 0;

let aimX = 0;
let aimY = 0;
let aimAngle = 0;
let aiming = false;

let crosshairX = 0;
let crosshairY = 0;

let maxAimDistance = 0;

// --------------------------------------------------
// PLAYERS
// --------------------------------------------------

const vip = new Player(
    canvas.width / 2,
    canvas.height / 2,
    "vip"
);

vip.health = 100;
vip.maxHealth = 100;

const guard = new Player(
    canvas.width / 2 - 80,
    canvas.height / 2,
    "guard"
);

guard.weapon = "knife";
guard.damage = 25;
guard.range = 140;
guard.fireRate = 700;

guard.health = 100;
guard.maxHealth = 100;

guard.weapon = "knife";
guard.damage = 25;
guard.range = 140;
guard.fireRate = 700;

guard.health = 100;
guard.maxHealth = 100;

// --------------------------------------------------
// GAME
// --------------------------------------------------

let score = 0;
let cash = 0;
let wave = 1;
let enemiesRemaining = 3;

const bullets = [];
const MAX_BULLETS = 40;

const enemies = [];

resize();

function randomEnemy() {

    const side = Math.floor(Math.random() * 4);

    switch (side) {

        // Left
        case 0:
            return new Enemy(
                -80,
                Math.random() * canvas.height
            );

        // Right
        case 1:
            return new Enemy(
                canvas.width + 80,
                Math.random() * canvas.height
            );

        // Top
        case 2:
            return new Enemy(
                Math.random() * canvas.width,
                -80
            );

        // Bottom
        default:
            return new Enemy(
                Math.random() * canvas.width,
                canvas.height + 80
            );

    }

}

for (let i = 0; i < 3; i++) {
    enemies.push(randomEnemy());
}
// --------------------------------------------------
// INPUT
// --------------------------------------------------

canvas.addEventListener("pointerdown", (e) => {

    e.preventDefault();

    if (e.clientX < canvas.width / 2) {

        moveTouch = e.pointerId;
        moveX = e.clientX;
        moveY = e.clientY;

    } else {

        shootTouch = e.pointerId;
        aimX = e.clientX;
        aimY = e.clientY;

    }

});

canvas.addEventListener("pointermove", (e) => {

    if (e.pointerId === moveTouch) {

        moveX = e.clientX;
        moveY = e.clientY;

    }

  if (e.pointerId === shootTouch) {

    aimX = e.clientX;
    aimY = e.clientY;

    const dx = aimX - rightStick.x;
    const dy = aimY - rightStick.y;

    aimAngle = Math.atan2(dy, dx);

    aiming = true;

}

});

canvas.addEventListener("pointerup", (e) => {

    if (e.pointerId === moveTouch) {
        moveTouch = null;
    }
    
if (e.pointerId === shootTouch) {

    shootTouch = null;
    aiming = false;

}

});

// --------------------------------------------------
// WORLD
// --------------------------------------------------

function drawRoad() {

    ctx.fillStyle = "#2e8b57";
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle = "#555";
    ctx.fillRect(
        0,
        canvas.height / 2 - 120,
        canvas.width,
        240
    );

    ctx.fillStyle = "white";

    for (let i = 0; i < canvas.width; i += 80) {

        ctx.fillRect(
            i,
            canvas.height / 2 - 3,
            40,
            6
        );

    }

}


// --------------------------------------------------
// MOVEMENT
// --------------------------------------------------

function updateMovement() {

    if (moveTouch !== null) {

        const dx = moveX - leftStick.x;
        const dy = moveY - leftStick.y;

        const dist = Math.hypot(dx, dy);

        if (dist > 10) {

            const nx = dx / dist;
            const ny = dy / dist;

            guard.x += nx * 5;
            guard.y += ny * 5;

        }

    }

}
// --------------------------------------------------
// ENEMIES
// --------------------------------------------------

function updateEnemies() {

    for (const enemy of enemies) {

        enemy.update({
            x: vip.x + 100,
            y: vip.y
        });

    }

}

function getClosestEnemy() {

    let closestEnemy = null;
    let closestDistance = Infinity;

    for (const enemy of enemies) {

        const d = Math.hypot(
            enemy.x - guard.x,
            enemy.y - guard.y
        );

        if (d < closestDistance) {

            closestDistance = d;
            closestEnemy = enemy;

        }

    }

    return closestEnemy;

}

// --------------------------------------------------
// SHOOTING
// --------------------------------------------------

function updateShooting() {

    if (!aiming) return;

    const now = Date.now();

    if (now - guard.lastShot < guard.fireRate)
        return;

    if (bullets.length >= MAX_BULLETS)
        return;

const targetX = crosshairX;
const targetY = crosshairY;

    bullets.push(
        new Bullet(
            guard.x,
            guard.y,
            targetX,
            targetY
        )
    );

    guard.lastShot = now;

}

// --------------------------------------------------
// BULLETS
// --------------------------------------------------

function updateBullets(cameraX) {

    for (const bullet of bullets) {

        bullet.update();
        bullet.draw(ctx, cameraX);

    }

}
// --------------------------------------------------
// COLLISIONS
// --------------------------------------------------

function updateCollisions() {

    for (const bullet of bullets) {

        if (bullet.dead) continue;

        for (let i = enemies.length - 1; i >= 0; i--) {

            const enemy = enemies[i];

            if (
                Math.hypot(
                    bullet.x - enemy.x,
                    bullet.y - enemy.y
                ) < 14
            ) {

                bullet.dead = true;

                enemy.health -= guard.damage;

                if (enemy.health > 0) {
                    break;
                }

                // Enemy defeated
                score += 10;
                cash += 50;
                enemiesRemaining--;

                enemies.splice(i, 1);

                if (enemiesRemaining <= 0) {

                    wave++;

                    enemiesRemaining = wave * 3;

                    for (let j = 0; j < enemiesRemaining; j++) {
                        enemies.push(randomEnemy());
                    }

                } else {

                    enemies.push(randomEnemy());

                }

                break;

            }

        }

    }

    // Remove dead bullets
    for (let i = bullets.length - 1; i >= 0; i--) {

        if (bullets[i].dead) {
            bullets.splice(i, 1);
        }

    }

}

// --------------------------------------------------
// VIP DAMAGE
// --------------------------------------------------

function updateVIPDamage() {

    for (const enemy of enemies) {

        if (
            Math.hypot(
                enemy.x - vip.x,
                enemy.y - vip.y
            ) < 20
        ) {

            vip.health -= 25;

            enemies.splice(
                enemies.indexOf(enemy),
                1
            );

            enemies.push(randomEnemy());

            if (vip.health <= 0) {

                alert(
                    "VIP DOWN!\nScore: " +
                    score
                );

                location.reload();

                return;

            }

        }

    }

}
// --------------------------------------------------
// DRAWING
// --------------------------------------------------

function drawPlayers(cameraX) {

    vip.draw(ctx, cameraX);
    guard.draw(ctx, cameraX);

}

function drawEnemies(cameraX) {

    for (const enemy of enemies) {
        enemy.draw(ctx, cameraX);
    }

}

function drawHealthBars(cameraX) {

    // VIP
    ctx.fillStyle = "red";
    ctx.fillRect(
        vip.x - cameraX - 25,
        vip.y - 45,
        50,
        6
    );

    ctx.fillStyle = "lime";
    ctx.fillRect(
        vip.x - cameraX - 25,
        vip.y - 45,
        50 * (vip.health / vip.maxHealth),
        6
    );

    // Guard
    ctx.fillStyle = "red";
    ctx.fillRect(
        guard.x - cameraX - 25,
        guard.y - 45,
        50,
        6
    );

    ctx.fillStyle = "deepskyblue";
    ctx.fillRect(
        guard.x - cameraX - 25,
        guard.y - 45,
        50 * (guard.health / guard.maxHealth),
        6
    );

}

function drawCrosshair(cameraX) {

    if (!aiming) return;

    const dx = aimX - rightStick.x;
    const dy = aimY - rightStick.y;

    const stickDistance = Math.min(
        Math.hypot(dx, dy),
        rightStick.radius
    );

 const distance =
    (stickDistance / rightStick.radius) * maxAimDistance;

    crosshairX =
        guard.x +
        Math.cos(aimAngle) * distance;

    crosshairY =
        guard.y +
        Math.sin(aimAngle) * distance;

    ctx.drawImage(
        crosshairImage,
        crosshairX - cameraX - 20,
        crosshairY - 20,
        40,
        40
    );

}

function drawHUD() {

    ctx.fillStyle = "white";
    ctx.font = "18px monospace";

    ctx.fillText(
        "⭐ Score: " + score,
        20,
        30
    );

    ctx.fillText(
        "💰 Cash: $" + cash,
        20,
        55
    );

    ctx.fillText(
        "🌊 Wave: " + wave,
        20,
        80
    );

    ctx.fillText(
        "👥 Enemies: " + enemies.length,
        20,
        105
    );

    ctx.fillText(
        "🔪 " + guard.weapon.toUpperCase(),
        20,
        130
    );

}
// --------------------------------------------------
// GAME LOOP
// --------------------------------------------------

function gameLoop() {

    if (canvas.width < canvas.height) {

        ctx.fillStyle = "black";
        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle = "white";
        ctx.font = "32px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "Rotate Device",
            canvas.width / 2,
            canvas.height / 2
        );

        requestAnimationFrame(gameLoop);
        return;

    }

    // Keep VIP fixed in the centre
    vip.x = canvas.width / 2;
vip.y = canvas.height / 2;

    // Update game
    updateMovement();
    updateEnemies();
    updateShooting();

    // Camera follows guard
    const cameraX = 0;

    // Draw world
    drawRoad();

    // Draw players
    drawPlayers(cameraX);

    drawCrosshair(cameraX);

    // Draw health bars
    drawHealthBars(cameraX);

    // Draw enemies
    drawEnemies(cameraX);

    // Bullets
    updateBullets(cameraX);

    // Combat
    updateCollisions();

    // VIP
    updateVIPDamage();

    // HUD
    drawHUD();
    
        // --------------------------------------------------
    // JOYSTICKS
    // --------------------------------------------------

    ctx.globalAlpha = 0.30;

    // Left joystick base
    ctx.beginPath();
    ctx.arc(
        leftStick.x,
        leftStick.y,
        leftStick.radius,
        0,
        Math.PI * 2
    );
    ctx.fillStyle = "white";
    ctx.fill();

    // Right joystick base
    ctx.beginPath();
    ctx.arc(
        rightStick.x,
        rightStick.y,
        rightStick.radius,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.globalAlpha = 1;

    // Left thumb
    const leftThumbX =
        moveTouch === null
            ? leftStick.x
            : moveX;

    const leftThumbY =
        moveTouch === null
            ? leftStick.y
            : moveY;

    ctx.beginPath();
    ctx.arc(
        leftThumbX,
        leftThumbY,
        28,
        0,
        Math.PI * 2
    );
    ctx.fillStyle = "#4da6ff";
    ctx.fill();

    // Right thumb
    const rightThumbX =
        shootTouch === null
            ? rightStick.x
            : aimX;

    const rightThumbY =
        shootTouch === null
            ? rightStick.y
            : aimY;

    ctx.beginPath();
    ctx.arc(
        rightThumbX,
        rightThumbY,
        28,
        0,
        Math.PI * 2
    );
    ctx.fillStyle = "#ff5555";
    ctx.fill();

    requestAnimationFrame(gameLoop);

}

gameLoop();
if ("serviceWorker" in navigator) {

    navigator.serviceWorker.register("sw.js");

}
