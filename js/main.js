document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

// --------------------
// GAME OBJECTS
// --------------------

const vip = new Player(200, canvas.height / 2, "yellow");
const guard = new Player(140, canvas.height / 2, "cyan");

const enemy = new Enemy(700, canvas.height / 2);

// --------------------
// TOUCH INPUT
// --------------------

let touchX = null;
let touchY = null;

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

// --------------------
// DRAW ROAD
// --------------------

function drawRoad(offset) {

    ctx.fillStyle = "#2e8b57";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#555";
    ctx.fillRect(
        0,
        canvas.height / 2 - 50,
        canvas.width,
        100
    );

    ctx.fillStyle = "white";

    for (let i = -80; i < canvas.width + 80; i += 80) {

        ctx.fillRect(
            i - (offset % 80),
            canvas.height / 2 - 3,
            40,
            6
        );

    }

}

// --------------------
// GAME LOOP
// --------------------

function gameLoop() {

    // VIP walks forward
    vip.x += 2;

    // Enemy chases VIP
    enemy.update(vip);

    // Player movement
    if (touchX !== null) {

        const worldX = touchX + (vip.x - canvas.width / 2);
        const worldY = touchY;

        const dx = worldX - guard.x;
        const dy = worldY - guard.y;

        const dist = Math.hypot(dx, dy);

        if (dist > 2) {

            guard.x += (dx / dist) * 4;
            guard.y += (dy / dist) * 4;

        }

    } else {

        // Escort position
        guard.x += (vip.x - 60 - guard.x) * 0.05;
        guard.y += (vip.y - guard.y) * 0.05;

    }

    const cameraX = vip.x - canvas.width / 2;

    drawRoad(cameraX);

    vip.draw(ctx, cameraX);
    guard.draw(ctx, cameraX);
    enemy.draw(ctx, cameraX);

    // Game Over
    const hit = Math.hypot(
        enemy.x - vip.x,
        enemy.y - vip.y
    );

    if (hit < 18) {

        alert("VIP DOWN!");

        location.reload();

        return;

    }

    requestAnimationFrame(gameLoop);

}

gameLoop();