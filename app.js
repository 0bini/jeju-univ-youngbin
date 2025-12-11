const Messages = {
    KEY_EVENT_UP: "KEY_EVENT_UP",
    KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
    KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
    KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
    KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
    KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
    COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
    COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
    COLLISION_SHIELD_HERO: "COLLISION_SHIELD_HERO",
    GAME_END_LOSS: "GAME_END_LOSS",
    GAME_END_WIN: "GAME_END_WIN",
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

    clear() {
        this.listeners = {};
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
        this.life = 3;
        this.points = 0;
        this.shielded = false;
        this.shieldTime = 0;
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

    incrementPoints() {
        this.points += 100;
    }

    decrementLife() {
        if (this.shielded) {
            return;
        }
        
        this.life--;
        if (this.life === 0) {
            this.dead = true;
        }
    }

    activateShield() {
        this.shielded = true;
        this.shieldTime = 3000;
        
        let id = setInterval(() => {
            if (this.shieldTime > 0) {
                this.shieldTime -= 100;
            } else {
                this.shielded = false;
                clearInterval(id);
            }
        }, 100);
    }

    draw(ctx) {
        if (this.shielded) {
            const blink = Math.floor(Date.now() / 100) % 2;
            if (blink) {
                ctx.globalAlpha = 0.5;
            }
        }
        
        super.draw(ctx);
        ctx.globalAlpha = 1.0;
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
        this.autoFireIntervalId = null;
        
        this.startAutoFire();
    }

    startAutoFire() {
        this.autoFireIntervalId = setInterval(() => {
            if (this.cooldown === 0 && !this.dead) {
                this.fire();
            }
        }, 1000);
    }

    stopAutoFire() {
        if (this.autoFireIntervalId) {
            clearInterval(this.autoFireIntervalId);
            this.autoFireIntervalId = null;
        }
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

class Shield extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 50;
        this.height = 50;
        this.type = "Shield";
        this.img = shieldImg;
        
        let id = setInterval(() => {
            if (this.y < canvas.height - this.height) {
                this.y += 3;
            } else {
                this.dead = true;
                clearInterval(id);
            }
        }, 100);
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
let lifeImg;
let shieldImg;
let gameLoopId;
let shieldSpawnId;
let bgPattern;
let currentStage = 1;
let isWaitingForNextStage = false;

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

function createShieldItem() {
    const x = Math.random() * (canvas.width - 50);
    const shield = new Shield(x, 0);
    shield.img = shieldImg;
    gameObjects.push(shield);
}

function createHero() {
    const previousPoints = hero ? hero.points : 0;
    const previousLife = hero ? hero.life : 3;
    
    hero = new Hero(
        canvas.width / 2 - 45,
        canvas.height - canvas.height / 4
    );
    hero.img = heroImg;
    hero.points = previousPoints;
    hero.life = previousLife;
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

function drawText(message, x, y) {
    ctx.fillText(message, x, y);
}

function drawLife() {
    if (!hero || !lifeImg) return;
    
    const START_POS = canvas.width - 180;
    for(let i = 0; i < hero.life; i++) {
        ctx.drawImage(
            lifeImg,
            START_POS + (45 * (i + 1)),
            canvas.height - 37
        );
    }
}

function drawPoints() {
    if (!hero) return;
    
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "left";
    drawText("Points: " + hero.points, 10, canvas.height - 20);
}

function drawStage() {
    ctx.font = "25px Arial";
    ctx.fillStyle = "yellow";
    ctx.textAlign = "center";
    drawText("Stage " + currentStage, canvas.width / 2, 40);
}

function drawShieldStatus() {
    if (!hero) return;
    
    if (hero.shielded) {
        const shieldSeconds = Math.ceil(hero.shieldTime / 1000);
        ctx.font = "20px Arial";
        ctx.fillStyle = "cyan";
        ctx.textAlign = "center";
        drawText("🛡️ SHIELD: " + shieldSeconds + "s", canvas.width / 2, canvas.height - 20);
    }
}

function displayMessage(message, color = "red") {
    ctx.font = "30px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

function endGame(win) {
    clearInterval(gameLoopId);
    if (shieldSpawnId) clearInterval(shieldSpawnId);
    
    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (win) {
            displayMessage(
                "Victory!!! Pew Pew... - Press [Enter] to start a new game Captain Pew Pew",
                "green"
            );
        } else {
            displayMessage(
                "You died !!! Press [Enter] to start a new game Captain Pew Pew"
            );
        }
    }, 200);
}

function resetGame() {
    if (gameLoopId) {
        clearInterval(gameLoopId);
        if (shieldSpawnId) clearInterval(shieldSpawnId);
        currentStage = 1;
        isWaitingForNextStage = false;
        hero = null;
        
        eventEmitter.clear();
        initGame();
        
        gameLoopId = setInterval(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = bgPattern;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            drawStage();
            drawPoints();
            drawLife();
            drawShieldStatus();
            updateGameObjects();
            drawGameObjects(ctx);
        }, 100);
    }
}

function isHeroDead() {
    return hero.life <= 0;
}

function isEnemiesDead() {
    const enemies = gameObjects.filter((go) => go.type === "Enemy" && !go.dead);
    return enemies.length === 0;
}

function nextStage() {
    currentStage++;
    if (currentStage > 3) {
        eventEmitter.emit(Messages.GAME_END_WIN);
    } else {
        isWaitingForNextStage = true;
        clearInterval(gameLoopId);
        if (shieldSpawnId) clearInterval(shieldSpawnId);
        
        setTimeout(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            displayMessage("Stage " + (currentStage - 1) + " Clear! Press [Enter] to continue", "green");
        }, 200);
    }
}

function startNextStage() {
    isWaitingForNextStage = false;
    eventEmitter.clear();
    initGame();
    
    gameLoopId = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = bgPattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        drawStage();
        drawPoints();
        drawLife();
        drawShieldStatus();
        updateGameObjects();
        drawGameObjects(ctx);
    }, 100);
}

function updateGameObjects() {
    const enemies = gameObjects.filter((go) => go.type === "Enemy");
    const lasers = gameObjects.filter((go) => go.type === "Laser");
    const shields = gameObjects.filter((go) => go.type === "Shield");

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

    shields.forEach((shield) => {
        const heroRect = hero.rectFromGameObject();
        if (intersectRect(heroRect, shield.rectFromGameObject())) {
            eventEmitter.emit(Messages.COLLISION_SHIELD_HERO, { shield });
        }
    });

    enemies.forEach((enemy) => {
        const heroRect = hero.rectFromGameObject();
        if (intersectRect(heroRect, enemy.rectFromGameObject())) {
            eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
        }
    });

    gameObjects = gameObjects.filter((go) => !go.dead);
}

function initGame() {
    gameObjects = [];
    
    createEnemies();
    createHero();

    if (shieldSpawnId) clearInterval(shieldSpawnId);
    shieldSpawnId = setInterval(() => {
        createShieldItem();
    }, 10000);

    eventEmitter.on(Messages.KEY_EVENT_UP, () => {
        hero.y -= 20;
    });
    
    eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
        hero.y += 20;
    });
    
    eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
        hero.x -= 20;
    });
    
    eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
        hero.x += 20;
    });
    
    eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
        if (hero.canFire()) {
            hero.fire();
        }
    });
    
    eventEmitter.on(Messages.COLLISION_SHIELD_HERO, (_, { shield }) => {
        shield.dead = true;
        hero.activateShield();
    });
    
    eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
        first.dead = true;
        second.dead = true;
        hero.incrementPoints();
        
        const explosion = new Explosion(second.x + second.width / 2 - 25, second.y + second.height / 2 - 25);
        gameObjects.push(explosion);

        if (isEnemiesDead()) {
            if (currentStage < 3) {
                displayMessage("Stage " + currentStage + " Clear! Next Stage...", "green");
                nextStage();
            } else {
                eventEmitter.emit(Messages.GAME_END_WIN);
            }
        }
    });

    eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, { enemy }) => {
        enemy.dead = true;
        hero.decrementLife();
        
        if (isHeroDead()) {
            eventEmitter.emit(Messages.GAME_END_LOSS);
            return;
        }
        
        if (isEnemiesDead()) {
            if (currentStage < 3) {
                displayMessage("Stage " + currentStage + " Clear! Next Stage...", "green");
                nextStage();
            } else {
                eventEmitter.emit(Messages.GAME_END_WIN);
            }
        }
    });

    eventEmitter.on(Messages.GAME_END_WIN, () => {
        endGame(true);
    });

    eventEmitter.on(Messages.GAME_END_LOSS, () => {
        endGame(false);
    });

    eventEmitter.on(Messages.KEY_EVENT_ENTER, () => {
        if (isWaitingForNextStage) {
            startNextStage();
        } else {
            resetGame();
        }
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
    lifeImg = await loadTexture("assets/png/life.png");
    shieldImg = await loadTexture("assets/png/shield2.png");
    
    const bgImg = await loadTexture('assets/starBackground.png');
    bgPattern = ctx.createPattern(bgImg, 'repeat');

    initGame();

    gameLoopId = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = bgPattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        drawStage();
        drawPoints();
        drawLife();
        drawShieldStatus();
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
    } else if (evt.key === "Enter") {
        eventEmitter.emit(Messages.KEY_EVENT_ENTER);
    }
});
