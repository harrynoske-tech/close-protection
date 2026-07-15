const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

const vip = {
    x: 200,
    y: canvas.height / 2,
    speed: 2
};

const guard = {
    x: 140,
    y: canvas.height / 2
};

function drawRoad(offset) {

    ctx.fillStyle = "#2e8b57";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#555";
    ctx.fillRect(
        0,
        canvas.height/2-50,
        canvas.width,
        100
    );

    ctx.fillStyle="white";

    for(let i=-80;i<canvas.width+80;i+=80){

        ctx.fillRect(
            i-(offset%80),
            canvas.height/2-3,
            40,
            6
        );

    }

}

function update(){

    vip.x += vip.speed;

    guard.x += (vip.x-60-guard.x)*0.05;
    guard.y += (vip.y-guard.y)*0.05;

    const camera = vip.x-canvas.width/2;

    drawRoad(camera);

    ctx.fillStyle="yellow";
    ctx.fillRect(
        vip.x-camera-8,
        vip.y-8,
        16,
        16
    );

    ctx.fillStyle="cyan";
    ctx.fillRect(
        guard.x-camera-8,
        guard.y-8,
        16,
        16
    );

    requestAnimationFrame(update);

}

update();
