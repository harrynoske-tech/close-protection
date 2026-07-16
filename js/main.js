document.addEventListener("contextmenu", (e) => e.preventDefault());

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let maxAimDistance = 0;

// --------------------------------------------------
// SCREEN
// --------------------------------------------------
function resize() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    leftStick.y = canvas.height - 120;

    maxAimDistance = Math.max(
        canvas.width,
        canvas.height
    );

}


// --------------------------------------------------
// JOYSTICKS
// --------------------------------------------------

const leftStick = {
    x: 120,
    y: 0,
    radius: 70
};


window.addEventListener("resize", resize);
resize();

let moveTouch = null;

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
guard.damage = 90;
guard.range = 140;
guard.fireRate = 250;

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

    moveTouch = e.pointerId;
    moveX = e.clientX;
    moveY = e.clientY;

});
canvas.addEventListener("pointermove", (e) => {

    if (e.pointerId === moveTouch) {

        moveX = e.clientX;
        moveY = e.clientY;

    }

});

canvas.addEventListener("pointerup", (e) => {

    if (e.pointerId === moveTouch) {

        moveTouch = null;

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

        guard.x += nx * guard.speed;
        guard.y += ny * guard.speed;

        }

    }

}
// --------------------------------------------------
// ENEMIES
// --------------------------------------------------

function updateEnemies() {

    for (const enemy of enemies) {

    enemy.update({
    x: vip.x,
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

    const enemy = getClosestEnemy();

    if (!enemy) return;

    const now = Date.now();

    if (now - guard.lastShot < guard.fireRate)
        return;

    if (bullets.length >= MAX_BULLETS)
        return;

    const distance = Math.hypot(
        enemy.x - guard.x,
        enemy.y - guard.y
    );

    if (distance > guard.range)
        return;

    bullets.push(
        new Bullet(
            guard.x,
            guard.y,
            enemy.x,
            enemy.y
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

    const now = Date.now();

    for (const enemy of enemies) {

        const dist = Math.hypot(
            enemy.x - vip.x,
            enemy.y - vip.y
        );

        if (
            dist < 20 &&
            now - enemy.lastAttack > enemy.attackRate
        ) {

            enemy.lastAttack = now;

            vip.health -= 10;

            if (vip.health <= 0) {

                alert(
                    "VIP DOWN!\nScore: " + score
                );

                location.reload();
                return;

            }

        }

    }

}

function updateBodyChecks() {

    for (const enemy of enemies) {

        const dx = enemy.x - guard.x;
        const dy = enemy.y - guard.y;

        const dist = Math.hypot(dx, dy);

        if (dist < 40) {

            enemy.knockbackX =
                (dx / dist) * 10;

            enemy.knockbackY =
                (dy / dist) * 10;

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

    ctx.globalAlpha = 1;

    // Left thumb
let leftThumbX = leftStick.x;
let leftThumbY = leftStick.y;

if (moveTouch !== null) {

    const dx = moveX - leftStick.x;
    const dy = moveY - leftStick.y;

    const dist = Math.hypot(dx, dy);

    if (dist <= leftStick.radius) {

        leftThumbX = moveX;
        leftThumbY = moveY;

    } else {

        leftThumbX =
            leftStick.x +
            (dx / dist) * leftStick.radius;

        leftThumbY =
            leftStick.y +
            (dy / dist) * leftStick.radius;

    }

}

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

    requestAnimationFrame(gameLoop);

}

gameLoop();
if ("serviceWorker" in navigator) {

    navigator.serviceWorker.register("sw.js");

}
