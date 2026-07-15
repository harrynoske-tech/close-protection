const spriteSheet = new Image();
spriteSheet.src = "assets/sprites/characters.png";

class Player {

    constructor(x, y, type) {

        this.x = x;
        this.y = y;

        this.size = 32;

        this.type = type;

        this.range = 180;
        this.fireRate = 400;
        this.lastShot = 0;

    }

    canShoot(enemy) {

        return Math.hypot(
            enemy.x - this.x,
            enemy.y - this.y
        ) < this.range;

    }

    draw(ctx, cameraX) {

        let frame = 0;

        if (this.type === "guard") frame = 0;
        if (this.type === "vip") frame = 1;

        ctx.drawImage(

            spriteSheet,

            frame * 32,
            0,
            32,
            32,

            this.x - cameraX - 16,
            this.y - 16,
            32,
            32

        );

    }

}