export class TypingGame {
    constructor() {
        this.startButton = null;
        this.restartButton = null;
        this.startDiv = null;
        this.gameDiv = null;
        this.resultDiv = null;
        this.wordDiv = null;
        this.timerDiv = null;
        this.scoreDiv = null;
        this.finalScoreDiv = null;
        this.inputLength = 0;
        this.timer = null;
        this.timeLeft = 0;
        this.score = 0;
        this.currentWord = '';
        this.socket = null;
    }

    async initialize() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeUI();
            this.connectWebSocket();
        });
    }

    connectWebSocket() {
        this.socket = new WebSocket('ws://' + window.location.host + '/ws/game/');

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.score = data.score;
            this.timeLeft = data.time_left;
            this.currentWord = data.word;
            this.updateScore(this.score);
            this.updateTimerDisplay(this.timeLeft);
            this.displayWord(this.currentWord);
        };

        this.socket.onclose = (event) => {
            console.error('WebSocket closed unexpectedly');
        };
    }

    async startGame() {
        this.socket.send(JSON.stringify({
            'action': 'start_game'
        }));
    }

    async checkInput(char) {
        this.socket.send(JSON.stringify({
            'char': char
        }));
    }

    initializeUI() {
        const app = document.getElementById('app');

        app.innerHTML = `
            <div id="start">
                <button id="startButton" class="button">スタート</button>
            </div>
            <div id="game" class="hidden">
                <div id="timer">10</div>
                <div id="word"></div>
                <div id="inputDisplay"></div>
                <div id="score">0</div>
                <canvas id="timerCanvas" width="200" height="200"></canvas>
            </div>
            <div id="result" class="hidden">
                <div id="finalScore"></div>
                <button id="restartButton" class="button">リスタート</button>
            </div>
        `;

        this.startButton = document.getElementById("startButton");
        this.startDiv = document.getElementById("start");
        this.gameDiv = document.getElementById("game");
        this.resultDiv = document.getElementById("result");
        this.wordDiv = document.getElementById("word");
        this.timerDiv = document.getElementById("timer");
        this.scoreDiv = document.getElementById("score");
        this.finalScoreDiv = document.getElementById("finalScore");

        this.startButton.addEventListener("click", async () => {
            this.startDiv.classList.add("hidden");
            this.gameDiv.classList.remove("hidden");
            this.enableTextInput();
            await this.startGame();
        });
    }

    enableTextInput() {
        document.addEventListener('keydown', async (event) => {
            if (event.key.length === 1) {
                await this.checkInput(event.key);
            }
        });
    }

    updateTimerDisplay(time) {
        this.timerDiv.textContent = time.toFixed(1);
    }

    updateScore(score) {
        this.scoreDiv.textContent = score;
    }

    displayWord(word) {
        this.wordDiv.innerHTML = '';
        for (let char of word) {
            const span = document.createElement('span');
            span.textContent = char;
            this.wordDiv.appendChild(span);
        }
    }

    showResult(score) {
        this.gameDiv.classList.add("hidden");
        this.resultDiv.classList.remove("hidden");
        this.finalScoreDiv.textContent = "スコア: " + score;
    }
}

const typingGame = new TypingGame();
typingGame.initialize();
