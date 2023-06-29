const musicAudio = new Audio("audio/music.mp3");
const overAudio = new Audio("audio/over.mp3");
const foodAudio = new Audio("audio/food.mp3");
const moveAudio = new Audio("audio/move.mp3");

const element = document.documentElement;

let welcomeBox = document.getElementById("welcomeBox");
let highScoreElements = document.getElementsByClassName("highScore");
let scoreElements = document.getElementsByClassName("score");

let board = document.querySelector("canvas");
let context = board.getContext("2d");

const boxSize = window.innerWidth < 600 ? 26:40;

let boxes = {
    row: Math.floor(window.innerHeight * 1.00 / boxSize),
    col: Math.floor(window.innerWidth  * 0.98 / boxSize)
};

let direction = {
    x: 0, y: 0
};

let playAudio = true;

let speed = window.innerWidth < 600 ? 10:13;
let lastPaintTime = 0;
let play = true;

let bodyImagesPath = {
    head_up: "./images/head_up.png",
    head_down: "./images/head_down.png",
    head_right: "./images/head_right.png",
    head_left: "./images/head_left.png",
            
    tail_up: "./images/tail_up.png",
    tail_down: "./images/tail_down.png",
    tail_right: "./images/tail_right.png",
    tail_left: "./images/tail_left.png",

    body_vertical: "./images/body_vertical.png",
    body_horizontal: "./images/body_horizontal.png",

    body_tr: "./images/body_tr.png",
    body_tl: "./images/body_tl.png",
    body_br: "./images/body_br.png",
    body_bl: "./images/body_bl.png"
}

function loadImages(imagePaths) {
    let images = {};

    for (const key in imagePaths) {
        let image = new Image();

        image.src = imagePaths[key];

        images[key] = image;
    }

    return images;
}

let bodyImages = loadImages(bodyImagesPath);

class FRUIT {
    constructor () {
        this.apple = loadImages({apple: "./images/apple.png"}).apple;
        this.apple.style = {backgroundColor: "red"}
        this.move();
    }

    move () {
        let x = Math.floor(Math.random() * (boxes.col - 2) + 1)
        let y = Math.floor(Math.random() * (boxes.row - 2) + 1)

        this.position = {x, y};
    }

    draw () {
        context.drawImage(this.apple, this.position.x * boxSize, this.position.y * boxSize, boxSize, boxSize);
    }
}

let fruit = new FRUIT();
let snake = [{x: 5, y: 10}, {x: 4, y: 10}, {x: 3, y: 10}];

let highScore = 0;
let score = 0;

if (!localStorage.getItem("snake-mania-high-score")) {
    localStorage.setItem("snake-mania-high-score", JSON.stringify(highScore));
} else {
    highScore = JSON.parse(localStorage.getItem("snake-mania-high-score"));
}

for (const element of highScoreElements) {
    element.innerHTML = highScore;
}

const main = time => {
    if (play) {
        window.requestAnimationFrame(main);
        
        if ((time - lastPaintTime) / 1000  < 1 / speed) {
            return null;
        }
        
        lastPaintTime = time;
        
        GameLoop();
    }
}

const playGame = () => {
    element.requestFullscreen();
    
    playAudio ? musicAudio.play() : musicAudio.pause();
    welcomeBox.style.display = "none";

    board.width  = boxes.col * boxSize;
    board.height = boxes.row * boxSize;

    board.style.display = "block";
    play = true;

    window.requestAnimationFrame(main);
}

const quitGame = () => {
    board.style.display = "none";
    welcomeBox.style.display = "flex";

    document.exitFullscreen();
    play = false;

    snake = [{x: 5, y: 10}, {x: 4, y: 10}, {x: 3, y: 10}];
    direction = {x: 0, y: 0};
}

const handleAudio = (element) => {
    playAudio = !playAudio;
    playAudio ? musicAudio.play() : musicAudio.pause();

    element.src = playAudio ? "images/volume_up.png":"images/volume_off.png";
}

function draw_grass() {
    for (let row = 0; row < boxes.row; row++) {
        for (let col = 0; col < boxes.col; col++) {
            if ((row % 2 == 0 && col % 2 == 0) || (row % 2 != 0 && col % 2 != 0)) {
                context.fillStyle = "rgb(167, 209, 61)";
            } else {    
                context.fillStyle = "rgb(175, 215, 70)";
            }

            context.fillRect(col * boxSize, row * boxSize, boxSize, boxSize);
        }
    }
}

const collide = () => {
    if (snake[0].x <= 0 || snake[0].x >= boxes.col - 1 || snake[0].y <= 0 || snake[0].y >= boxes.row - 1) {
        return true;
    }

    for (const block of snake.slice(1)) {
        if (block.x == snake[0].x && block.y == snake[0].y) {
            return true;
        }
    }

    return false;
}

const GameLoop = () => {
    if (collide()) {
        if (playAudio) overAudio.play();

        snake = [{x: 5, y: 10}, {x: 4, y: 10}, {x: 3, y: 10}];
        direction = {x: 0, y: 0};
    
        score = 0;

        for (const element of scoreElements) {
            element.innerText = score;
        }
    }

    if (snake[0].y === fruit.position.y && snake[0].x === fruit.position.x) {
        if (playAudio) foodAudio.play();

        score += 1;
        
        for (const element of scoreElements) {
            element.innerText = score;
        }

        if (score > highScore) {
            highScore = score;
            for (const element of highScoreElements) {
                element.innerText = score;
            }

            localStorage.setItem("snake-mania-high-score", JSON.stringify(highScore));
        }

        snake.unshift({
            x: snake[0].x + direction.x,
            y: snake[0].y + direction.y
        });

        fruit.move();

        for (const block of snake.slice(1)) {
            if (block.x == fruit.position.x && block.y == fruit.position.y) {
                fruit.move();
            }
        }
    }

    draw_grass();
    fruit.draw();

    if (direction.x != 0 || direction.y != 0) {
        for (let i = snake.length - 2; i >= 0; i--) {
            snake[i+1] = {...snake[i]};
        }
    }

    snake[0].x += direction.x;
    snake[0].y += direction.y;

    snake.forEach((block, index) => {
        let x = block.x * boxSize;
        let y = block.y * boxSize;
        
        if (index === snake.length - 1) {
            let tail_relation = [snake[snake.length-2].x - snake[snake.length-1].x, snake[snake.length-2].y - snake[snake.length-1].y];
        
            if (tail_relation[0] == 1 && tail_relation[1] == 0) {
                tailImage = bodyImages.tail_left;
            } 
            
            else if (tail_relation[0] == -1 && tail_relation[1] == 0) {
                tailImage = bodyImages.tail_right;
            } 
            
            else if (tail_relation[0] == 0 && tail_relation[1] == 1) {
                tailImage = bodyImages.tail_up;
            } 
            
            else {
                tailImage = bodyImages.tail_down;
            }

            context.drawImage(tailImage, x, y, boxSize, boxSize);
        }

        else if (index === 0) {
            let head_relation = [snake[ 1].x - snake[ 0].x, snake[ 1].y - snake[ 0].y];
        
            if (head_relation[0] == 1 && head_relation[1] == 0) {
                headImage = bodyImages.head_left;
            } 
            
            else if (head_relation[0] == -1 && head_relation[1] == 0) {
                headImage = bodyImages.head_right;
            } 
            
            else if (head_relation[0] == 0 && head_relation[1] == 1) {
                headImage = bodyImages.head_up;
            } 
            
            else {
                headImage = bodyImages.head_down;
            }

            context.drawImage(headImage, x, y, boxSize, boxSize);
        }

        else {
            let prevBlock = [snake[index + 1].x - block.x, snake[index + 1].y - block.y];
            let nextBlock = [snake[index - 1].x - block.x, snake[index - 1].y - block.y];

            if (prevBlock[0] == nextBlock[0]) {
                context.drawImage(bodyImages.body_vertical, x, y, boxSize, boxSize);
            }

            else if (prevBlock[1] == nextBlock[1]) {
                context.drawImage(bodyImages.body_horizontal, x, y, boxSize, boxSize);
            }
            
            else {
                if (prevBlock[0] == -1 && nextBlock[1] == -1 || prevBlock[1] == -1 && nextBlock[0] == -1) {
                    context.drawImage(bodyImages.body_tl, x, y, boxSize, boxSize);
                }
                    
                else if (prevBlock[0] == -1 && nextBlock[1] == 1 || prevBlock[1] == 1 && nextBlock[0] == -1) {
                    context.drawImage(bodyImages.body_bl, x, y, boxSize, boxSize);
                }
                    
                else if (prevBlock[0] == 1 && nextBlock[1] == -1 || prevBlock[1] == -1 && nextBlock[0] == 1) {
                    context.drawImage(bodyImages.body_tr, x, y, boxSize, boxSize);
                }
                    
                else {
                    context.drawImage(bodyImages.body_br, x, y, boxSize, boxSize);
                }
            }
        }
    });
}

// For Keys

window.addEventListener("keydown", event => {
    if (playAudio) moveAudio.play();

    switch (event.key) {
        case "ArrowUp":
            if (direction.y != 1) {
                direction.x =  0;
                direction.y = -1;
            }
            break;
                
        case "ArrowDown":
            if (direction.y != -1) {
                direction.x = 0;
                direction.y = 1;
            }
            break;
            
        case "ArrowLeft":
            if (direction.x != 1) {
                direction.x = -1;
                direction.y =  0;
            }
            break;
            
        case "ArrowRight":
            if (direction.x != -1) {
                direction.x = 1;
                direction.y = 0;
            }
            break;
        
        default:
            break;
    }
});

// For Touch Screen

var down = {x: null, y: null};

document.addEventListener("touchstart", event => {
    const firstTouch = event.touches[0];

    down.x = firstTouch.clientX;
    down.y = firstTouch.clientY;
});

document.addEventListener("touchmove", event => {
    if (playAudio) moveAudio.play();

    if (!down.x || !down.y) return null;

    let up = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
    }

    let difference_x = down.x - up.x;
    let difference_y = down.y - up.y;

    if (Math.abs(difference_x) > Math.abs(difference_y)) {
        if (difference_x > 0 && direction.x != 1) {
            direction.x = -1;
            direction.y =  0;
        }
        
        else if (direction.x != -1) {
            direction.x = 1;
            direction.y = 0;
        }
    } 
    
    else {
        if (difference_y > 0 && direction.y != 1) {
            direction.x =  0;
            direction.y = -1;
        }

        else if (direction.y != -1) {
            direction.x = 0;
            direction.y = 1;
        } 
    }
    
    down = {x: null, y: null};
});