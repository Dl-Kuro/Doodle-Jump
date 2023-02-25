const DOODLE_SPEED = 40;
const DOODLE_SIZE = 60;

const PLATFORM_WIDTH = 100;
const PLATFORM_HEIGHT = 20;
const NUM_PLATFORMS = 10;

const GAME_RECT = document.getElementById("game").getBoundingClientRect();
const GAME_WIDTH = GAME_RECT.width;
const GAME_HEIGHT = GAME_RECT.height;
const GAME_POS_ZERO = 0;
console.log(GAME_RECT);

class Element {
    constructor(width, height, px, py, speed) {
        this._status = true;    // not destroyed
        this._width = width;
        this._height = height;
        this._pos = {x: px, y: py};
        this._speed = speed;
    }

    get speed() {
        return this._speed;
    }

    get status() {
        return this._status;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    get pos() {
        return this._pos;
    }
}

class Doodler extends Element {
    constructor(width, height, x, y, speed) {
        super(width, height, x, y, speed);
        this._width = width;
        this._height = height;
        this._velocity = 0;
        document.addEventListener("keydown", this.moveDoodler.bind(this));
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    moveDoodler(event) {
        if (event.keyCode === 37) {
            this._pos.x -= this._speed;
        } else if (event.keyCode === 39) {
            this._pos.x += this._speed;
        }

        if (this._pos.x > (GAME_WIDTH)) {
            this.setDefaultLeft();
            window.requestAnimationFrame(this.moveDoodler.bind(this))
        } else if (this._pos.x < GAME_POS_ZERO) {
            this.setDefaultRight();
            window.requestAnimationFrame(this.moveDoodler.bind(this))
        }
    }

    setDefaultLeft() {
        this._pos.x = GAME_POS_ZERO;
    }

    setDefaultRight() {
        this._pos.x = GAME_WIDTH - this._width;
    }

    update() {
        this._velocity += 0.15;
        this._pos.y += this._velocity;
    }

    checkCollision(platform) {
        if (this._pos.x < platform.pos.x + platform.width && this._pos.x + this._width > platform.pos.x && this._pos.y < platform.pos.y + platform.height && this._height + this._pos.y > platform.pos.y) {
            this._velocity = -10;
        }
    }
}

class Platform extends Element {
    constructor(width, height, x, y, speed) {
        super(width, height, x, y, speed);
    }
}


class Model {
    constructor() {
        this._doodler = null;
        this._platforms = [];
        this._monsters = [];
    }

    init() {
        this._doodler = new Doodler(DOODLE_SIZE, DOODLE_SIZE, (GAME_WIDTH / 2), (GAME_HEIGHT - (DOODLE_SIZE + PLATFORM_HEIGHT)), DOODLE_SPEED);

        for (let i = 0; i < NUM_PLATFORMS; i++) {
            let randomX = Math.random() * (GAME_WIDTH - PLATFORM_WIDTH);
            let randomY = Math.random() * (GAME_HEIGHT - PLATFORM_HEIGHT);
            this._platforms.push(new Platform(PLATFORM_WIDTH, PLATFORM_HEIGHT, randomX, randomY, 0));
        }
    }

    update() {
        this._doodler.update();

        for (let i = 0; i < this._platforms.length; i++) {
            this._doodler.checkCollision(this._platforms[i]);
        }

        if (this._doodler.pos.y > GAME_HEIGHT) {
            this._doodler._status = false;
        }
    }

    get doodler() {
        return this._doodler;
    }

    get platforms() {
        return this._platforms;
    }

    get monsters() {
        return this._monsters;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class View {
    constructor() {
        this._game = document.querySelector("#game");
        this._template = document.querySelector("#template");
    }

    render(model) {
        this._game.innerHTML = "";

        let cloneTemplate = document.importNode(this._template.content, true);

        if (model.doodler.status) {
            let elemDoodler = cloneTemplate.querySelector(".defaultDoodler");
            let doodler = model.doodler
            elemDoodler.style.marginLeft = doodler.pos.x + "px";
            elemDoodler.style.marginTop = doodler.pos.y + "px";
            elemDoodler.style.width = doodler.width + "px";
            elemDoodler.style.height = doodler.height + "px";
            this._game.appendChild(elemDoodler);
        }

        let elemPlatform = cloneTemplate.querySelector(".defaultPlatform");
        let platform = model.platforms
        elemPlatform.style.marginLeft = platform[0].pos.x + "px";
        elemPlatform.style.marginTop = platform[0].pos.y + "px";
        elemPlatform.style.width = platform[0].width + "px";
        elemPlatform.style.height = platform[0].height + "px";

        this._game.append(elemPlatform);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Controller {
    constructor(model, view) {
        this._model = model;
        this._view = view;
        this._fps = 120;
        this._interval = 1000 / this._fps;
    }

    start() {
        this._model.init();
        window.requestAnimationFrame(this.step.bind(this));
    }

    step() {
        this._model.update();
        this._view.render(this._model);
        setTimeout(() => {
            window.requestAnimationFrame(this.step.bind(this));
        }, this._interval);
    }
}

let model = new Model();
let view = new View();
let game = new Controller(model, view);

game.start();
