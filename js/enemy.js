class Enemy {

    constructor(x, y) {
        this.size = 16;
        this.speed = 1.6;
        this.respawn(x, y);
    }

    respawn(x, y) {
        this.x = x;
        this.y = y;
    }

    update(target) {

        const dx = target.x - this.x;
        const dy = target.y - this.y;

        const dist = Math.hypot(dx, dy);

        if (dist > 1) {
            this.x += dx / dist * this.speed;
            this.y += dy / dist * this.speed;
        }

    }

    draw(ctx, cameraX) {
        ctx.fillStyle = "red";
        ctx.fillRect(
            this.x - cameraX - this.size / 2,
            this.y - this.size / 2,
            this.size,
            this.size
        );
    }

}