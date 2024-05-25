const canvas = document.getElementById('pongCanvas');
const context = canvas.getContext('2d');

let player1 = { x: 10, y: canvas.height / 2 - 50, width: 10, height: 100, dy: 0 };
let player2 = { x: canvas.width - 20, y: canvas.height / 2 - 50, width: 10, height: 100, dy: 0 };
let ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 10, dx: 5, dy: 5 };

function drawRect(x, y, width, height, color) {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();
}

function update() {
    player1.y += player1.dy;
    player2.y += player2.dy;

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    if (ball.x - ball.radius < player1.x + player1.width && ball.y > player1.y && ball.y < player1.y + player1.height) {
        ball.dx *= -1;
    }

    if (ball.x + ball.radius > player2.x && ball.y > player2.y && ball.y < player2.y + player2.height) {
        ball.dx *= -1;
    }

    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx *= -1;
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawRect(player1.x, player1.y, player1.width, player1.height, 'white');
    drawRect(player2.x, player2.y, player2.width, player2.height, 'white');
    drawCircle(ball.x, ball.y, ball.radius, 'white');
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w':
            player1.dy = -5;
            break;
        case 's':
            player1.dy = 5;
            break;
        case 'p':
            player2.dy = -5;
            break;
        case ';':
            player2.dy = 5;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'w':
        case 's':
            player1.dy = 0;
            break;
        case 'p':
        case ';':
            player2.dy = 0;
            break;
    }
});

document.getElementById('startButton').addEventListener('click', () => {
    gameLoop();
});