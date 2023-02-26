const DOODLER = {
    SPEED: 10,
    SIZE: 60,
};

const PLATFORM = {
    WIDTH: 100,
    HEIGHT: 20,
    NUM: 10,
};

const GAME_RECT = document.getElementById("game").getBoundingClientRect();
const GAME = {
    WIDTH: GAME_RECT.width,
    HEIGHT: GAME_RECT.height,
    POS_ZERO: 0,
}
console.log(GAME_RECT);

class Element {
    #status = true; // not destroyed
    #width;
    #height;
    #pos;
    #speed;

    constructor(width, height, px, py, speed) {
        this.#width = width;
        this.#height = height;
        this.#pos = { x: px, y: py };
        this.#speed = speed;
    }

    get width() {
        return this.#width;
    }

    set width(value) {
        this.#width = value;
    }

    get height() {
        return this.#height;
    }

    set height(value) {
        this.#height = value;
    }

    get speed() {
        return this.#speed;
    }

    set speed(value) {
        this.#speed = value;
    }

    get status() {
        return this.#status;
    }

    set status(value) {
        this.#status = value;
    }

    get pos() {
        return this.#pos;
    }

    set pos(value) {
        this.#pos = value;
    }
}

class Doodler extends Element {
    #velocity = 0;
    #gravity = 0.2;

    constructor(width, height, x, y, speed) {
        super(width, height, x, y, speed);
        document.addEventListener("keydown", this.moveDoodler.bind(this));
    }

    moveDoodler(event) {
        if (event.keyCode === 37) {
            this.pos.x -= this.speed;
        } else if (event.keyCode === 39) {
            this.pos.x += this.speed;
        }

        if (this.pos.x > (GAME.WIDTH)) {
            this.setDefaultLeft();
            window.requestAnimationFrame(this.moveDoodler.bind(this))
        } else if (this.pos.x < GAME.POS_ZERO) {
            this.setDefaultRight();
            window.requestAnimationFrame(this.moveDoodler.bind(this))
        }
    }

    setDefaultLeft() {
        this.pos.x = GAME.POS_ZERO;
    }

    setDefaultRight() {
        this.pos.x = GAME.WIDTH - this.width;
    }

    update() {
        this.#velocity += this.#gravity ;
        this.pos.y += this.#velocity;
    }

    checkCollision(platform) {
        if (this.pos.x < platform.pos.x + platform.width && this.pos.x + this.width > platform.pos.x &&
            this.pos.y < platform.pos.y - platform.height * 2 && this.pos.y + this.height > platform.pos.y &&
            this.#velocity > 0)
        {
            this.#velocity = -10;
        }
    }
}

class Platform extends Element {
    constructor(width, height, x, y, speed) {
        super(width, height, x, y, speed);
    }
}


class Model {
    #doodler = null;
    #platforms = [];
    #monsters = [];

    init() {
        this.#doodler = new Doodler(DOODLER.SIZE, DOODLER.SIZE, (GAME.WIDTH / 2 - DOODLER.SIZE / 2), (GAME.HEIGHT - (DOODLER.SIZE + PLATFORM.HEIGHT)), DOODLER.SPEED);

        let startingPlatformX = GAME.WIDTH / 2 - PLATFORM.WIDTH / 2;
        let startingPlatformY = GAME.HEIGHT - PLATFORM.HEIGHT;
        this.#platforms.push(new Platform(PLATFORM.WIDTH, PLATFORM.HEIGHT, startingPlatformX, startingPlatformY, 0));

        for (let i = 0; i < PLATFORM.NUM; i++) {
            let randomX = Math.random() * (GAME.WIDTH - PLATFORM.WIDTH);
            let randomY = Math.random() * (GAME.HEIGHT - PLATFORM.HEIGHT);
            this.#platforms.push(new Platform(PLATFORM.WIDTH, PLATFORM.HEIGHT, randomX, randomY, 0));
        }
    }

    get doodler() {
        return this.#doodler;
    }

    set doodler(value) {
        this.#doodler = value;
    }

    get platforms() {
        return this.#platforms;
    }

    set platforms(value) {
        this.#platforms = value;
    }

    get monsters() {
        return this.#monsters;
    }

    set monsters(value) {
        this.#monsters = value;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class View {
    #game = document.querySelector("#game");
    #template = document.querySelector("#template");

    render(model) {
        this.#game.innerHTML = "";
        let cloneTemplate = document.importNode(this.#template.content, true);

        if (model.doodler.status) {
            let doodler = model.doodler
            let elemDoodler = cloneTemplate.querySelector(".defaultDoodler");
            elemDoodler.style.marginLeft = doodler.pos.x + "px";
            elemDoodler.style.marginTop = doodler.pos.y + "px";
            elemDoodler.style.width = doodler.width + "px";
            elemDoodler.style.height = doodler.height + "px";
            this.#game.appendChild(elemDoodler);
        }

        model.platforms.forEach(platform => {
            let cloneTemplate = document.importNode(this.#template.content, true);
            let elemPlatform = cloneTemplate.querySelector(".defaultPlatform");
            elemPlatform.style.marginLeft = platform.pos.x + "px";
            elemPlatform.style.marginTop = platform.pos.y + "px";
            elemPlatform.style.width = platform.width + "px";
            elemPlatform.style.height = platform.height + "px";
            this.#game.appendChild(elemPlatform);
        })
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Controller {
    #model = model;
    #view = view;
    #fps = 120;
    #interval = 1000 / this.#fps;

    constructor(model, view) {
        this.#model = model;
        this.#view = view;
    }

    start() {
        this.#model.init();
        window.requestAnimationFrame(this.step.bind(this));
    }

    step() {
        this.loop();
        this.#view.render(this.#model);
        setTimeout(() => {
            if (!this.isGameOver()) {
                window.requestAnimationFrame(this.step.bind(this));
            }
        }, this.#interval);
    }

    loop() {
        this.checkScroll();
        this.#model.doodler.update();

        for (let i = 0; i < this.#model.platforms.length; i++) {
            this.#model.doodler.checkCollision(this.#model.platforms[i]);
        }

        if (this.#model.doodler.pos.y > GAME.HEIGHT) {
            this.#model.doodler.status = false;
        }
    }

    isGameOver() {
        if (!this.#model.doodler.status) {
            console.log("Game Over")
            return true
        }
        return false
    }

    checkScroll() {
        if (this.#model.doodler.pos.y < GAME.HEIGHT / 2) {
            let scrollY = GAME.HEIGHT / 2 - this.#model.doodler.pos.y;
            this.#model.platforms.forEach(platform => {
                platform.pos.y += scrollY;
            });
            this.#model.doodler.pos.y += scrollY;
        }
    }
}

let model = new Model();
let view = new View();
let game = new Controller(model, view);

game.start();
