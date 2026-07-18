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

const shopButtons = [];

const upgradeLevels = {
    fire: 0,
    damage: 0,
    speed: 0,
    health: 0
};

const upgradeCosts = [
    500,
    1000,
    5000,
    10000
];

// ----------------------------
// Shop scrolling
// ----------------------------
let shopScroll = 0;
let shopDragging = false;
let shopStartY = 0;
let shopStartScroll = 0;
let shopMoved = false;

function getShopLayout() {

    const margin = 20;
    const cardWidth = canvas.width - margin * 2;
    const cardHeight = 150;
    const spacing = 20;

    const cards = [

        {
            type: "fire",
            title: "🔥 Trigger Speed",
            description: "Fire faster.",
            x: margin,
            y: 100,
            w: cardWidth,
            h: cardHeight
        },

        {
            type: "damage",
            title: "💥 Stopping Power",
            description: "Increase bullet damage.",
            x: margin,
            y: 100 + (cardHeight + spacing),
            w: cardWidth,
            h: cardHeight
        },

        {
            type: "speed",
            title: "👟 Mobility",
            description: "Move faster while protecting the VIP.",
            x: margin,
            y: 100 + (cardHeight + spacing) * 2,
            w: cardWidth,
            h: cardHeight
        },

        {
            type: "health",
            title: "❤️ VIP Protection",
            description: "Increase the VIP's maximum health.",
            x: margin,
            y: 100 + (cardHeight + spacing) * 3,
            w: cardWidth,
            h: cardHeight
        }

    ];

    const startButton = {

        type: "start",

        x: margin,

        y:
            100 +
            (cardHeight + spacing) * cards.length +
            40,

        w: cardWidth,

        h: 70

    };

    return {
        cards,
        startButton,
        totalHeight:
            startButton.y +
            startButton.h +
            40
    };

}

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

const firstWaveEnemies = 3;

enemiesRemaining = firstWaveEnemies;

for (let i = 0; i < firstWaveEnemies; i++) {
    enemies.push(randomEnemy());
}
// --------------------------------------------------
// INPUT
// --------------------------------------------------

canvas.addEventListener("pointerdown", (e) => {

 if (shopOpen) {

    shopDragging = true;
    shopMoved = false;

    shopStartY = e.clientY;
    shopStartScroll = shopScroll;

    return;

}

    e.preventDefault();

    moveTouch = e.pointerId;
    moveX = e.clientX;
    moveY = e.clientY;

});
canvas.addEventListener("pointermove", (e) => {

    if (shopOpen && shopDragging) {

        const distance = Math.abs(e.clientY - shopStartY);

if (distance > 10)
    shopMoved = true;

shopScroll =
    shopStartScroll + (shopStartY - e.clientY);

if (shopScroll < 0)
    shopScroll = 0;

return;

    }

    if (e.pointerId === moveTouch) {

        moveX = e.clientX;
        moveY = e.clientY;

    }

});

canvas.addEventListener("pointerup", (e) => {

    if (shopOpen) {

        if (!shopMoved) {

            handleShopClick(
                e.clientX,
                e.clientY
            );

        }

        shopDragging = false;
        return;
    }

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

    for (let i = enemies.length - 1; i >= 0; i--) {

        const enemy = enemies[i];

        enemy.update({
            x: vip.x,
            y: vip.y
        });

        // Remove fallen protesters after 30 frames
        if (
            enemy.type === "knife" &&
            enemy.falling &&
            enemy.fallTimer > 30
        ) {

            score += 25;
            cash += 75;
            enemiesRemaining--;

            enemies.splice(i, 1);

            if (
                enemiesRemaining === 0 &&
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

function getClosestEnemy() {

    let closestEnemy = null;
    let closestDistance = Infinity;

    for (const enemy of enemies) {

        if (enemy.type === "knife") continue;

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
    enemiesRemaining === 0 &&
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

        // Only knife enemies can be body-checked
        if (enemy.type !== "knife") {
            continue;
        }

        const dx = enemy.x - guard.x;
        const dy = enemy.y - guard.y;

        const dist = Math.hypot(dx, dy);

       if (dist < 40 && !enemy.falling) {

    enemy.knockbackX = (dx / dist) * 10;
    enemy.knockbackY = (dy / dist) * 10;

    enemy.bodyHits++;

    if (enemy.bodyHits >= 3) {
        enemy.falling = true;
    }

}
        // Remove knife enemy once knocked off the map
        if (
            enemy.x < -80 ||
            enemy.x > canvas.width + 80 ||
            enemy.y < -80 ||
            enemy.y > canvas.height + 80
        ) {

            score += 10;
            cash += 50;
            enemiesRemaining--;

            enemies.splice(i, 1);

            if (
                enemiesRemaining === 0 &&
                !betweenWaves &&
                !shopOpen
            ) {

                betweenWaves = true;
                shopOpen = false;
                waveCountdown = 180;

            }

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

        // Fallen protesters can't hurt the VIP
        if (enemy.falling) continue;

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

    const layout = getShopLayout();

    shopButtons.length = 0;

    // Background
    ctx.fillStyle = "rgba(0,0,0,0.95)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.fillStyle = "white";
    ctx.font = "bold 34px Arial";
    ctx.textAlign = "center";
    ctx.fillText("UPGRADE SHOP", canvas.width / 2, 45);

    ctx.fillStyle = "gold";
    ctx.font = "24px Arial";
    ctx.fillText("$" + cash, canvas.width / 2, 78);

    // Cards
    for (const card of layout.cards) {

        const drawY = card.y - shopScroll;

        // Don't draw cards off screen
        if (drawY > canvas.height || drawY + card.h < 0)
            continue;

        const level = upgradeLevels[card.type];

        shopButtons.push({

            type: card.type,

            x: card.x,

            y: drawY,

            w: card.w,

            h: card.h

        });

        ctx.fillStyle = "#2c2c2c";
        ctx.fillRect(card.x, drawY, card.w, card.h);

        ctx.strokeStyle = "#444";
        ctx.lineWidth = 2;
        ctx.strokeRect(card.x, drawY, card.w, card.h);

        ctx.textAlign = "left";

        ctx.fillStyle = "white";
        ctx.font = "bold 24px Arial";
        ctx.fillText(card.title, card.x + 18, drawY + 34);

        ctx.font = "18px Arial";
        ctx.fillStyle = "#cccccc";
        ctx.fillText(card.description, card.x + 18, drawY + 64);

        // Stars
        let stars = "";

        for (let i = 0; i < 4; i++) {
            stars += i < level ? "★" : "☆";
        }

        ctx.font = "26px Arial";
        ctx.fillStyle = "gold";
        ctx.fillText(stars, card.x + 18, drawY + 104);

        // Upgrade button
        const buttonWidth = 120;
        const buttonHeight = 40;

        const buttonX = card.x + card.w - buttonWidth - 15;
        const buttonY = drawY + card.h - buttonHeight - 15;

        shopButtons.push({

            type: card.type + "_upgrade",

            x: buttonX,
            y: buttonY,
            w: buttonWidth,
            h: buttonHeight

        });

        if (level >= 4) {

            ctx.fillStyle = "#3d8cff";
            ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("MAXED", buttonX + 60, buttonY + 27);

        } else {

            const affordable = cash >= upgradeCosts[level];

            ctx.fillStyle = affordable ? "#24b34b" : "#555";
            ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.font = "18px Arial";

            ctx.fillText(

                "$" + upgradeCosts[level],

                buttonX + 60,

                buttonY + 26

            );

        }

    }

    // Start button

    const start = layout.startButton;

    const startY = start.y - shopScroll;

    shopButtons.push({

        type: "start",

        x: start.x,

        y: startY,

        w: start.w,

        h: start.h

    });

    ctx.fillStyle = "#1aad42";
    ctx.fillRect(start.x, startY, start.w, start.h);

    ctx.fillStyle = "white";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.fillText(

        "START NEXT WAVE",

        start.x + start.w / 2,

        startY + 44

    );

    ctx.textAlign = "left";
}

if (confirmUpgrade) {

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    const w = 340;
    const h = 230;

    const x = canvas.width/2 - w/2;
    const y = canvas.height/2 - h/2;

    ctx.fillStyle = "#2f2f2f";
    ctx.fillRect(x,y,w,h);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(x,y,w,h);

    ctx.fillStyle = "white";
    ctx.font = "bold 26px Arial";
    ctx.textAlign = "center";
    ctx.fillText("AUTHORISE UPGRADE",canvas.width/2,y+40);

    ctx.font = "22px Arial";
    ctx.fillStyle = "gold";
    ctx.fillText(confirmUpgrade.toUpperCase(),canvas.width/2,y+85);

    const cost = upgradeCosts[upgradeLevels[confirmUpgrade]];

    ctx.fillStyle="white";
    ctx.fillText("$"+cost,canvas.width/2,y+120);

    // Cancel
    ctx.fillStyle="#666";
    ctx.fillRect(canvas.width/2-150,y+150,130,50);

    ctx.fillStyle="white";
    ctx.fillText("CANCEL",canvas.width/2-85,y+182);

    // Purchase
    ctx.fillStyle="#1aad42";
    ctx.fillRect(canvas.width/2+20,y+150,130,50);

    ctx.fillStyle="white";
    ctx.fillText("PURCHASE",canvas.width/2+85,y+182);

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

    if (!shopOpen) {
    
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

    }

    requestAnimationFrame(gameLoop);

}

gameLoop();
if ("serviceWorker" in navigator) {

    navigator.serviceWorker.register("sw.js");

}
