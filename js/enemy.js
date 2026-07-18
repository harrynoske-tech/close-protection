const offenderImage = new Image();
offenderImage.src = "assets/sprites/offender.png";

const protesterImage = new Image();
protesterImage.src = "assets/sprites/protester.png";

class Enemy {

    constructor(x, y) {
        this.speed = 1.2;
        this.width = 52;
        this.height = 64;
        this.health = 100;
        
        this.sprayed = false;
        this.sprayEndTime = 0;

        this.knockbackX = 0;
        this.knockbackY = 0;

        this.lastAttack = 0;
        this.attackRate = 500;

        this.hasEnteredMap = false;
        
      this.bodyHits = 0;
this.falling = false;
this.fallTimer = 0;
        
        this.type = Math.random() < 0.5 ? "knife" : "gun";
 if (this.type === "knife") {
    this.health = 999999;
}

        this.respawn(x, y);
    }

    respawn(x, y) {
        this.x = x;
        this.y = y;
    }

   update(target) {

    if (this.falling) {
        this.fallTimer++;
        return;
    }

    const now = Date.now();

if (this.sprayed && now > this.sprayEndTime) {

    this.sprayed = false;

}
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

let speed = this.speed;

if (this.sprayed) {
    speed *= 0.25;
}

if (dist > 18) {
    this.x += (dx / dist) * speed;
    this.y += (dy / dist) * speed;
}
        if (
    this.x >= 0 &&
    this.x <= canvas.width &&
    this.y >= 0 &&
    this.y <= canvas.height
) {
    this.hasEnteredMap = true;
}
    }

    draw(ctx, cameraX) {

        if (this.sprayed) {
    ctx.globalAlpha = 0.4;
}
    const sprite =
    this.type === "knife"
        ? protesterImage
        : offenderImage;

ctx.drawImage(
    sprite,
    this.x - cameraX - this.width / 2,
    this.y - this.height / 2,
    this.width,
    this.height
);
        
        ctx.globalAlpha = 1;
    }
}
