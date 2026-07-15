const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

const vip = new Player(200, canvas.height / 2, "yellow");
const guard = new Player(140, canvas.height / 2, "cyan");

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
    vip.x += 2;

    guard.x += (vip.x - 60 - guard.x) * 0.05;
    guard.y += (vip.y - guard.y) * 0.05;

    const cameraX = vip.x - canvas.width / 2;

    drawRoad(cameraX);

    vip.draw(ctx, cameraX);
    guard.draw(ctx, cameraX);

    requestAnimationFrame(gameLoop);
}

gameLoop();
