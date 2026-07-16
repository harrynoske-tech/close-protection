document.addEventListener("contextmenu", (e) => e.preventDefault());

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
window.onerror = function (message, source, line, column, error) {
    alert(
        message +
        "\nLine: " + line +
        "\nColumn: " + column
    );
};

function resize() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    leftStick.y = canvas.height - 120;

rightStick.x = canvas.width - 120;
rightStick.y = canvas.height - 120;

}

    if (canvas.width < canvas.height) {

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "32px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "Rotate Device",
            canvas.width / 2,
            canvas.height / 2
        );

    }

}
window.addEventListener("resize", resize);
resize();

const vip = new Player(
    200,
    canvas.height / 2,
    "vip"
);
vip.health = 100;
vip.maxHealth = 100;

const guard = new Player(
    140,
    canvas.height / 2,
    "guard"
);
guard.weapon = "knife";
guard.damage = 25;
guard.range = 140;
guard.fireRate = 700;

guard.health = 100;
guard.maxHealth = 100;

let score = 0;
let wave = 1;
let enemiesRemaining = 3;
let cash = 0;
const bullets = [];
const MAX_BULLETS = 40;

function randomEnemy() {

    const side = Math.floor(Math.random() * 4);

    if (side === 0)
    return new Enemy(vip.x + 700, Math.random() * canvas.height);

    if (side === 1)
    return new Enemy(vip.x - 700, Math.random() * canvas.height);

    if (side === 2)
        return new Enemy(
            vip.x + (Math.random() * 300 - 150),
            50
        );

    return new Enemy(
        vip.x + (Math.random() * 300 - 150),
        canvas.height - 50
    );

}

let enemies = [];

for (let i = 0; i < 3; i++) {
    enemies.push(randomEnemy());
}

// Left joystick
let moveTouch = null;
let moveX = 0;
let moveY = 0;

// Right joystick
let shootTouch = null;
let aimX = 0;
let aimY = 0;
const leftStick = {
    x: 120,
    y: canvas.height - 120,
    radius: 70
};

const rightStick = {
    x: canvas.width - 120,
    y: canvas.height - 120,
    radius: 70
};

canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    touchX = e.clientX;
    touchY = e.clientY;
});

canvas.addEventListener("pointermove", (e) => {
    e.preventDefault();

    if (e.buttons || e.pointerType === "touch") {
        touchX = e.clientX;
        touchY = e.clientY;
    }
});

canvas.addEventListener("pointerup", (e) => {
    e.preventDefault();
    touchX = null;
    touchY = null;
});

function drawRoad(offset) {

    ctx.fillStyle = "#2e8b57";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#555";
    ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);

    ctx.fillStyle = "white";

    for (let i = -80; i < canvas.width + 80; i += 80) {
        ctx.fillRect(i - (offset % 80), canvas.height / 2 - 3, 40, 6);
    }

}

function gameLoop() {
    
    if (canvas.width < canvas.height) {
    requestAnimationFrame(gameLoop);
    return;
}


    // Update enemies
// Update enemies
for (const enemy of enemies) {

    enemy.update({
        x: vip.x + 100,
        y: vip.y
    });

}

// Respawn enemies that wander too far away

    const now = Date.now();

let closestEnemy = null;
let closestDistance = Infinity;

for (const enemy of enemies) {

    const d = Math.hypot(enemy.x - guard.x, enemy.y - guard.y);

    if (d < closestDistance) {
        closestDistance = d;
        closestEnemy = enemy;
    }

}

if (
    closestEnemy &&
    Math.hypot(
        closestEnemy.x - guard.x,
        closestEnemy.y - guard.y
    ) < guard.range &&
    now - guard.lastShot > guard.fireRate
) {

  if (bullets.length < MAX_BULLETS) {

    bullets.push(
        new Bullet(
            guard.x,
            guard.y,
            closestEnemy.x,
            closestEnemy.y
        )
    );

}

    guard.lastShot = now;

}

   if (touchX !== null) {

    const worldX = touchX + (guard.x - canvas.width / 2);
    const worldY = touchY;

    const dx = worldX - guard.x;
    const dy = worldY - guard.y;

    const dist = Math.hypot(dx, dy);

    if (dist > 2) {
        guard.x += (dx / dist) * 4;
        guard.y += (dy / dist) * 4;
    }

}

// VIP follows the bodyguard
const followX = guard.x - 60;
const followY = guard.y;

vip.x += (followX - vip.x) * 0.05;
vip.y += (followY - vip.y) * 0.05;

    const cameraX = guard.x - canvas.width / 2;

    drawRoad(cameraX);

    vip.draw(ctx, cameraX);
    // VIP Health Bar
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
    guard.draw(ctx, cameraX);
    for (const enemy of enemies) {
    enemy.draw(ctx, cameraX);
}
    for (const bullet of bullets) {

    bullet.update();
    bullet.draw(ctx, cameraX);

}
for (const bullet of bullets) {

    for (let i = enemies.length - 1; i >= 0; i--) {

        const enemy = enemies[i];

        if (
            Math.hypot(
                bullet.x - enemy.x,
                bullet.y - enemy.y
            ) < 14
        ) {

            bullet.dead = true;
            enemy.health = (enemy.health || 100) - guard.damage;

if (enemy.health > 0) {
    bullet.dead = true;
    break;
}

// Rewards
score += 10;
cash += 50;
enemiesRemaining--;

// Remove attacker
enemies.splice(i, 1);

// Wave finished?
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

for (let i = bullets.length - 1; i >= 0; i--) {

    if (bullets[i].dead) {

        bullets.splice(i, 1);

    }

}

    // Score
ctx.fillStyle = "white";
ctx.font = "18px monospace";

ctx.fillText("⭐ Score: " + score, 20, 30);
ctx.fillText("💰 Cash: $" + cash, 20, 55);
ctx.fillText("🌊 Wave: " + wave, 20, 80);
ctx.fillText("👥 Enemies: " + enemies.length, 20, 105);

ctx.fillText("🔪 " + guard.weapon.toUpperCase(), 20, 130);



    // VIP hit
// VIP hit
for (const enemy of enemies) {

    if (Math.hypot(enemy.x - vip.x, enemy.y - vip.y) < 18) {

        vip.health -= 25;

        enemies.splice(enemies.indexOf(enemy), 1);
        enemies.push(randomEnemy());

        if (vip.health <= 0) {

            alert("VIP DOWN!\nScore: " + score);
            location.reload();
            return;

        }

    }

}
// Auto upgrade to pistol
if (cash >= 500 && guard.weapon === "knife") {

    guard.weapon = "pistol";
    guard.damage = 100;
    guard.range = 220;
    guard.fireRate = 350;

}
    requestAnimationFrame(gameLoop);

}

gameLoop();