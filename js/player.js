const guardImage = new Image();
guardImage.src = "assets/sprites/bodyguard.png";

const vipImage = new Image();
vipImage.src = "assets/sprites/vip.png";

class Player {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;

        this.width = 48;
        this.height = 64;

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

        const image =
            this.type === "guard"
                ? guardImage
                : vipImage;

        ctx.drawImage(
            image,
            this.x - cameraX - this.width / 2,
            this.y - this.height / 2,
            this.width,
            this.height
        );
    }
}
