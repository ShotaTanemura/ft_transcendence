function startPongGame() {
    const canvas = document.getElementById('pongCanvas');
    const context = canvas.getContext('2d');

    const PLAYER_WIDTH = 10;
    const PLAYER_HEIGHT = 100;
    const BALL_RADIUS = 10;
    const BALL_SPEED = 5;
    const PLAYER_SPEED = 10;

    let player1 = createPlayer(10, canvas.height / 2 - PLAYER_HEIGHT / 2);
    let player2 = createPlayer(canvas.width - 20, canvas.height / 2 - PLAYER_HEIGHT / 2);
    let ball = createBall(canvas.width / 2, canvas.height / 2);

    function createPlayer(x, y) {
        return { x, y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT, dy: 0 };
    }

    function createBall(x, y) {
        return { x, y, radius: BALL_RADIUS, dx: BALL_SPEED, dy: BALL_SPEED };
    }

    function setupEventListeners() {
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
    }

    function handleKeyDown(event) {
        switch (event.key) {
            case 'w':
                player1.dy = -PLAYER_SPEED;
                break;
            case 's':
                player1.dy = PLAYER_SPEED;
                break;
            case 'p':
                player2.dy = -PLAYER_SPEED;
                break;
            case ';':
                player2.dy = PLAYER_SPEED;
                break;
        }
    }

    function handleKeyUp(event) {
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
    }

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

    function updatePlayer(player) {
        player.y += player.dy;
        if (player.y < 0) {
            player.y = 0;
        } else if (player.y + player.height > canvas.height) {
            player.y = canvas.height - player.height;
        }
    }

    function updateBall() {
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

    function update() {
        updatePlayer(player1);
        updatePlayer(player2);
        updateBall();
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

    setupEventListeners();
    gameLoop();
}