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

    leftStick.x = canvas.width - 120;
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
    x: canvas.width - 120,
    y: canvas.height - 120,
    radius: 70
};


window.addEventListener("resize", resize);
resize();

let moveTouch = null;

// --------------------------------------------------
// PLAYERS
// --------------------------------------------------

const WEAPONS = {

    MK6: {
        name: "MK6",
        damage: 0,
        fireRate: 500,
        range: 120,
        bulletSpeed: 0
    },

    PISTOL: {
        name: "Pistol",
        damage: 100,
        fireRate: 250,
        range: 280,
        bulletSpeed: 12
    },

    MCX: {
        name: "MCX",
        damage: 50,
        fireRate: 120,
        range: 360,
        bulletSpeed: 16
    },

    FIFTY_CAL: {
        name: ".50 CAL",
        damage: 300,
        fireRate: 800,
        range: 600,
        bulletSpeed: 20
    }

};

const vip = new Player(
    canvas.width / 2,
    canvas.height / 2,
    "vip"
);
vip.targetX = vip.x;
vip.targetY = vip.y;
vip.walkSpeed = 1.3;
vip.nextMove = Date.now();

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

const shopButtons = [
    { x: canvas.width / 2 - 170, y: 180, w: 340, h: 55, type: "fire" },
    { x: canvas.width / 2 - 170, y: 245, w: 340, h: 55, type: "damage" },
    { x: canvas.width / 2 - 170, y: 310, w: 340, h: 55, type: "range" },
    { x: canvas.width / 2 - 170, y: 375, w: 340, h: 55, type: "heal" }
];

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

    if (shopOpen) {

    handleShopClick(
        e.clientX,
        e.clientY
    );

    return;

}

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

    if (guard.weapon.name === "MK6") {
        return;
    }

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

  function updateMK6() {

    if (guard.weapon.name !== "MK6")
        return;

    const target = getClosestEnemy();

    if (!target)
        return;

    const guardAngle = Math.atan2(
        target.y - guard.y,
        target.x - guard.x
    );

    for (const enemy of enemies) {

        const dist = Math.hypot(
            enemy.x - guard.x,
            enemy.y - guard.y
        );

        const angleToEnemy = Math.atan2(
            enemy.y - guard.y,
            enemy.x - guard.x
        );

        const angleDiff = Math.abs(angleToEnemy - guardAngle);

               if (
            dist < guard.weapon.range &&
            angleDiff < 0.6
        ) {
            enemy.sprayed = true;
            enemy.sprayEndTime = Date.now() + 2000;
        }

    }

}
    function drawMK6Cone() {

    if (guard.weapon.name !== "MK6")
        return;

const enemy = getClosestEnemy();

if (!enemy) return;

const angle = Math.atan2(
    enemy.y - guard.y,
    enemy.x - guard.x
);

    ctx.fillStyle = "rgba(255,120,0,0.25)";

    ctx.beginPath();
    ctx.moveTo(guard.x, guard.y);

    ctx.arc(
        guard.x,
        guard.y,
        guard.weapon.range,
        angle - 0.6,
        angle + 0.6
    );

    ctx.closePath();
    ctx.fill();

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

function updateVIP() {

    const now = Date.now();

    // Pick a random point anywhere on the map
    if (now > vip.nextMove) {

        vip.targetX = Math.random() * canvas.width;
        vip.targetY = Math.random() * canvas.height;

        vip.nextMove = now + 4000 + Math.random() * 4000;

    }

    const dx = vip.targetX - vip.x;
    const dy = vip.targetY - vip.y;

    const dist = Math.hypot(dx, dy);

    if (dist > 5) {

        vip.x += (dx / dist) * vip.walkSpeed;
        vip.y += (dy / dist) * vip.walkSpeed;

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

                if (enemy.type === "gun") {
    enemy.health -= guard.damage;
}

                if (enemy.health > 0) {
                    break;
                }

                // Enemy defeated
                score += 10;
                cash += 50;
                enemiesRemaining--;

  enemies.splice(i, 1);

if (
    enemies.length === 0 &&
    !betweenWaves &&
    !shopOpen
) {

    betweenWaves = true;
shopOpen = false;
waveCountdown = 180;

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

function updateBodyChecks() {

    for (let i = enemies.length - 1; i >= 0; i--) {

    const enemy = enemies[i];

        const dx = enemy.x - guard.x;
        const dy = enemy.y - guard.y;

        const dist = Math.hypot(dx, dy);

        if (dist < 40) {

           const power =
    enemy.type === "knife" ? 22 : 10;

enemy.knockbackX =
    (dx / dist) * power;

enemy.knockbackY =
    (dy / dist) * power;
    
    }
    
    if (
    enemy.type === "knife" &&
    (
        enemy.x < -100 ||
        enemy.x > canvas.width + 100 ||
        enemy.y < -100 ||
        enemy.y > canvas.height + 100
    )
) {

    score += 25;
    cash += 75;
    enemiesRemaining--;

    enemies.splice(i, 1);
    
    if (
    enemies.length === 0 &&
    !betweenWaves &&
    !shopOpen
) {

    betweenWaves = true;
    shopOpen = false;
    waveCountdown = 180;

}
    continue;


        }

    }

}

function separateEnemies() {

    for (let i = 0; i < enemies.length; i++) {

        for (let j = i + 1; j < enemies.length; j++) {

            const a = enemies[i];
            const b = enemies[j];

            const dx = b.x - a.x;
            const dy = b.y - a.y;

            const dist = Math.hypot(dx, dy);

            if (dist > 0 && dist < 35) {

                const overlap = (35 - dist) / 2;

                const nx = dx / dist;
                const ny = dy / dist;

                a.x -= nx * overlap;
                a.y -= ny * overlap;

                b.x += nx * overlap;
                b.y += ny * overlap;

            }

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

    ctx.fillText("⭐ Score: " + score, 20, 30);
    ctx.fillText("💰 Cash: $" + cash, 20, 55);
    ctx.fillText("🌊 Wave: " + wave, 20, 80);
    ctx.fillText("👥 Enemies: " + enemies.length, 20, 105);
    ctx.fillText("🔪 " + guard.weapon.toUpperCase(), 20, 130);

    // Countdown
    if (betweenWaves) {

        ctx.textAlign = "center";
        ctx.fillStyle = "white";

        ctx.font = "48px Arial";
        ctx.fillText(
            "WAVE " + wave + " COMPLETE",
            canvas.width / 2,
            canvas.height / 2 - 40
        );

        ctx.font = "32px Arial";
        ctx.fillText(
            "Next Wave In",
            canvas.width / 2,
            canvas.height / 2 + 20
        );

        ctx.font = "64px Arial";
        ctx.fillText(
            Math.ceil(waveCountdown / 60),
            canvas.width / 2,
            canvas.height / 2 + 90
        );

        ctx.textAlign = "left";
    }

    // Shop
    if (shopOpen) {

        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(
            60,
            80,
            canvas.width - 120,
            canvas.height - 160
        );

        ctx.fillStyle = "#444";

for (const button of shopButtons) {

    ctx.fillRect(
        button.x,
        button.y,
        button.w,
        button.h
    );

}

        ctx.fillStyle = "white";
        ctx.textAlign = "center";

        ctx.font = "40px Arial";
        ctx.fillText(
            "UPGRADE SHOP",
            canvas.width / 2,
            140
        );

        ctx.font = "28px Arial";

        ctx.fillText("Fire Rate", canvas.width / 2, 218);
ctx.fillText("Damage", canvas.width / 2, 283);
ctx.fillText("Range", canvas.width / 2, 348);
ctx.fillText("Heal VIP", canvas.width / 2, 413);

        ctx.textAlign = "left";
    }

}
function handleShopClick(x, y) {

    for (const button of shopButtons) {

        if (
            x >= button.x &&
            x <= button.x + button.w &&
            y >= button.y &&
            y <= button.y + button.h
        ) {

            switch (button.type) {

                case "fire":
                    guard.fireRate = Math.max(
                        80,
                        guard.fireRate - 25
                    );
                    break;

                case "damage":
                    guard.damage += 10;
                    break;

                case "range":
                    guard.range += 20;
                    break;

                case "heal":
                    vip.health = vip.maxHealth;
                    break;

            }

            shopOpen = false;
            betweenWaves = false;
            
            wave++;

const enemyCount = wave + 2;

for (let i = 0; i < enemyCount; i++) {
    enemies.push(randomEnemy());
}


            return;

        }

    }

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

// Update game
if (!betweenWaves && !shopOpen) {

 updateMovement();
    updateVIP();
updateEnemies();
separateEnemies();
updateBodyChecks();
updateShooting();
    updateMK6();

} else if (betweenWaves) {

    waveCountdown--;

    if (waveCountdown <= 0) {

    betweenWaves = false;
    shopOpen = true;
    waveCountdown = 180;

}

}

    // Camera follows guard
    const cameraX = 0;

    drawMK6Cone();
    
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
