const offenderImage = new Image();
offenderImage.src = "assets/sprites/offender.png";

class Enemy {

    constructor(x, y) {
        this.speed = 1.2;
        this.width = 52;
        this.height = 64;
        this.health = 100;

        this.knockbackX = 0;
        this.knockbackY = 0;

        this.lastAttack = 0;
        this.attackRate = 500;

        this.respawn(x, y);
    }

    respawn(x, y) {
        this.x = x;
        this.y = y;
    }

    update(target) {
        if (
    Math.abs(this.knockbackX) > 0.1 ||
    Math.abs(this.knockbackY) > 0.1
) {

    this.x += this.knockbackX;
    this.y += this.knockbackY;

    this.knockbackX *= 0.85;
    this.knockbackY *= 0.85;

    return;

}

        const dx = target.x - this.x;
        const dy = target.y - this.y;

        const dist = Math.hypot(dx, dy);

        if (dist > 18) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
    }

    draw(ctx, cameraX) {

        ctx.drawImage(
            offenderImage,
            this.x - cameraX - this.width / 2,
            this.y - this.height / 2,
            this.width,
            this.height
        );
    }
}
