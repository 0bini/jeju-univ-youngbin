const Messages = {
    KEY_EVENT_UP: "KEY_EVENT_UP",
    KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
    KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
    KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
    KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
    COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
    COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
};

class EventEmitter {
    constructor() {
        this.listeners = {};
    }

    on(message, listener) {
        if (!this.listeners[message]) {
            this.listeners[message] = [];
        }
        this.listeners[message].push(listener);
    }

    emit(message, payload = null) {
        if (this.listeners[message]) {
            this.listeners[message].forEach((l) => l(message, payload));
        }
    }
}

const eventEmitter = new EventEmitter();

class GameObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dead = false;
        this.type = "";
        this.width = 0;
        this.height = 0;
        this.img = undefined;
    }

    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    rectFromGameObject() {
        return {
            top: this.y,
            left: this.x,
            bottom: this.y + this.height,
            right: this.x + this.width,
        };
    }
}

class Hero extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 99;
        this.height = 75;
        this.type = "Hero";
        this.speed = { x: 0, y: 0 };
        this.cooldown = 0;
    }

    fire() {
        if (this.canFire()) {
            gameObjects.push(new Laser(this.x + 45, this.y - 10));
            this.cooldown = 500;
            let id = setInterval(() => {
                if (this.cooldown > 0) {
                    this.cooldown -= 100;
                } else {
                    clearInterval(id);
                }
            }, 100);
        }
    }

    canFire() {
        return this.cooldown === 0;
    }
}

class Sidekick extends GameObject {
    constructor(x, y, isLeft) {
        super(x, y);
        this.width = 99 / 2;
        this.height = 75 / 2;
        this.type = "Sidekick";
        this.isLeft = isLeft;
        this.cooldown = 0;
        
        this.startAutoFire();
    }

    startAutoFire() {
        setInterval(() => {
            if (this.cooldown === 0 && !this.dead) {
                this.fire();
            }
        }, 1000);
    }

    fire() {
        gameObjects.push(new SmallLaser(this.x + this.width / 2 - 4, this.y - 10));
        this.cooldown = 1000;
        
        let id = setInterval(() => {
            if (this.cooldown > 0) {
                this.cooldown -= 100;
            } else {
                clearInterval(id);
            }
        }, 100);
    }
}

class Enemy extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 98;
        this.height = 50;
        this.type = "Enemy";
        
        let id = setInterval(() => {
            if (this.y < canvas.height - this.height) {
                this.y += 5;
            } else {
                console.log('Stopped at', this.y);
                clearInterval(id);
            }
        }, 300);
    }
}

class Laser extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 9;
        this.height = 33;
        this.type = 'Laser';
        this.img = laserRedImg;
        
        let id = setInterval(() => {
            if (this.y > 0) {
                this.y -= 15;
            } else {
                this.dead = true;
                clearInterval(id);
            }
        }, 100);
    }
}

class SmallLaser extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 9;
        this.height = 33;
        this.type = 'Laser';
        this.img = laserGreenImg;
        
        let id = setInterval(() => {
            if (this.y > 0) {
                this.y -= 15;
            } else {
                this.dead = true;
                clearInterval(id);
            }
        }, 100);
    }
}

class Explosion extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 50;
        this.height = 50;
        this.type = 'Explosion';
        this.img = laserRedShotImg;
        this.lifespan = 300;
        
        setTimeout(() => {
            this.dead = true;
        }, this.lifespan);
    }
}

function loadTexture(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            resolve(img);
        };
    });
}

function intersectRect(r1, r2) {
    return !(
        r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top
    );
}

let hero;
let leftSidekick;
let rightSidekick;
let gameObjects = [];
let canvas;
let ctx;
let heroImg;
let enemyImg;
let laserRedImg;
let laserGreenImg;
let laserRedShotImg;

function createEnemies() {
    const MONSTER_TOTAL = 5;
    const MONSTER_WIDTH = MONSTER_TOTAL * 98;
    const START_X = (canvas.width - MONSTER_WIDTH) / 2;
    const STOP_X = START_X + MONSTER_WIDTH;

    for (let x = START_X; x < STOP_X; x += 98) {
        for (let y = 0; y < 50 * 5; y += 50) {
            const enemy = new Enemy(x, y);
            enemy.img = enemyImg;
            gameObjects.push(enemy);
        }
    }
}

function createHero() {
    hero = new Hero(
        canvas.width / 2 - 45,
        canvas.height - canvas.height / 4
    );
    hero.img = heroImg;
    gameObjects.push(hero);
}

function createSidekicks() {
    const mainShipX = canvas.width / 2 - 45;
    const mainShipY = canvas.height - canvas.height / 4;
    const auxWidth = 99 / 2;
    
    leftSidekick = new Sidekick(
        mainShipX - auxWidth - 20,
        mainShipY + 10,
        true
    );
    leftSidekick.img = heroImg;
    gameObjects.push(leftSidekick);
    
    rightSidekick = new Sidekick(
        mainShipX + 99 + 20,
        mainShipY + 10,
        false
    );
    rightSidekick.img = heroImg;
    gameObjects.push(rightSidekick);
}

function drawGameObjects(ctx) {
    gameObjects.forEach((go) => go.draw(ctx));
}

function updateGameObjects() {
    const enemies = gameObjects.filter((go) => go.type === "Enemy");
    const lasers = gameObjects.filter((go) => go.type === "Laser");

    lasers.forEach((l) => {
        enemies.forEach((m) => {
            if (intersectRect(l.rectFromGameObject(), m.rectFromGameObject())) {
                eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
                    first: l,
                    second: m,
                });
            }
        });
    });

    gameObjects = gameObjects.filter((go) => !go.dead);
}

function initGame() {
    gameObjects = [];
    createEnemies();
    createHero();
    createSidekicks();

    eventEmitter.on(Messages.KEY_EVENT_UP, () => {
        hero.y -= 20;
    });
    
    eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
        hero.y += 20;
    });
    
    eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
        hero.x -= 20;
        if (leftSidekick) leftSidekick.x -= 20;
        if (rightSidekick) rightSidekick.x -= 20;
    });
    
    eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
        hero.x += 20;
        if (leftSidekick) leftSidekick.x += 20;
        if (rightSidekick) rightSidekick.x += 20;
    });
    
    eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
        if (hero.canFire()) {
            hero.fire();
        }
    });
    
    eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
        first.dead = true;
        second.dead = true;
        
        const explosion = new Explosion(second.x + second.width / 2 - 25, second.y + second.height / 2 - 25);
        gameObjects.push(explosion);
    });
}

window.onload = async () => {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");

    heroImg = await loadTexture("assets/player.png");
    enemyImg = await loadTexture("assets/enemyShip.png");
    laserRedImg = await loadTexture("assets/png/laserRed.png");
    laserGreenImg = await loadTexture("assets/png/laserGreen.png");
    laserRedShotImg = await loadTexture("assets/png/laserRedShot.png");
    
    const bgImg = await loadTexture('assets/starBackground.png');
    const pattern = ctx.createPattern(bgImg, 'repeat');

    initGame();

    let gameLoopId = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        drawGameObjects(ctx);
        updateGameObjects();
    }, 100);
};

window.addEventListener("keydown", (evt) => {
    if ([32, 37, 38, 39, 40].includes(evt.keyCode)) {
        evt.preventDefault();
    }
});

window.addEventListener("keyup", (evt) => {
    if (evt.key === "ArrowUp") {
        eventEmitter.emit(Messages.KEY_EVENT_UP);
    } else if (evt.key === "ArrowDown") {
        eventEmitter.emit(Messages.KEY_EVENT_DOWN);
    } else if (evt.key === "ArrowLeft") {
        eventEmitter.emit(Messages.KEY_EVENT_LEFT);
    } else if (evt.key === "ArrowRight") {
        eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
    } else if (evt.keyCode === 32) {
        eventEmitter.emit(Messages.KEY_EVENT_SPACE);
    }
});
