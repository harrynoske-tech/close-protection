class Bullet {

    constructor(x, y, targetX, targetY) {

        this.x = x;
        this.y = y;

        this.radius = 4;
        this.speed = 12;

        const dx = targetX - x;
        const dy = targetY - y;

        const dist = Math.hypot(dx, dy);

        this.vx = dx / dist;
        this.vy = dy / dist;

        this.dead = false;

    }

    update() {

        this.x += this.vx * this.speed;
        this.y += this.vy * this.speed;

    }

    draw(ctx, cameraX) {

        ctx.fillStyle = "white";

        ctx.beginPath();

        ctx.arc(
            this.x - cameraX,
            this.y,
            this.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

}