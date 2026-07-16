const offenderImage = new Image();
offenderImage.src = "assets/sprites/offender.png";

class Enemy {

    constructor(x, y) {
        this.speed = 2;
        this.width = 52;
        this.height = 64;
        this.health = 100;

        this.lastAttack = 0;
        this.attackRate = 500;

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
