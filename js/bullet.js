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

        // Remove bullets that fly off-screen
        if (
            this.x < -1000 ||
            this.x > 20000 ||
            this.y < -500 ||
            this.y > 5000
        ) {
            this.dead = true;
        }

    }

    draw(ctx, cameraX) {

        ctx.fillStyle = "#ffff66";

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