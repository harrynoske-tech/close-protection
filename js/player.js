class Player {
    constructor(x, y, colour) {
        this.x = x;
        this.y = y;
        this.colour = colour;
        this.size = 16;

        // Combat
        this.range = 180;
        this.fireRate = 400; // milliseconds
        this.lastShot = 0;
    }

    canShoot(enemy) {
        return Math.hypot(
            enemy.x - this.x,
            enemy.y - this.y
        ) < this.range;
    }

    draw(ctx, cameraX) {
        ctx.fillStyle = this.colour;

        ctx.fillRect(
            this.x - cameraX - this.size / 2,
            this.y - this.size / 2,
            this.size,
            this.size
        );
    }
}