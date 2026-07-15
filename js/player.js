class Player {
    constructor(x, y, colour) {
        this.x = x;
        this.y = y;
        this.colour = colour;
        this.size = 16;
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
