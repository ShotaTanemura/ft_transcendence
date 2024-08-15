import { Component } from "../core/component.js";
import { wordsArray } from "../data/words.js";


export class TypingGame extends Component {
    constructor(router, parameters, state) {
        super(router, parameters, state);
        this.startButton = null;
        this.restartButton = null;
        this.startDiv = null;
        this.gameDiv = null;
        this.resultDiv = null;
        this.wordDiv = null;
        this.timerDiv = null;
        this.scoreDiv = null;
        this.finalScoreDiv = null;
        this.amount = 2;
        this.inputLength = 0;
        this.timer = null;
        this.timeLeft = 0;
        this.score = 0;
        this.currentWord = '';
        this.startTime = 0;
        this.maxTime = 15;
        this.penaltyTime = 0;
        this.canvas = null;
        this.ctx = null;
        this.words = [];
        this.initialize();
    }

    async initialize() {
        document.addEventListener('DOMContentLoaded', async () => {
            this.initializeUI();
            const gameInitialized = await this.initializeGame();
            if (gameInitialized) {
                this.startButton.addEventListener('click', () => {
                    this.startGame();
                });
            } else {
                console.error('Failed to initialize game.');
            }
        });
    }

    get html() {
        return (`
<div id="typing-game">
    <div id="start">
        <button id="startButton" class="button">スタート</button>
    </div>
    <div id="game" class="hidden">
        <div id="timer"></div>
        <div id="word"></div>
        <div id="inputDisplay"></div>
        <div id="score"></div>
        <canvas id="timerCanvas" width="200" height="200"></canvas>
    </div>
    <div id="result" class="hidden">
        <div id="finalScore"></div>
        <button id="restartButton" class="button">リスタート</button>
    </div>
</div>
        `);
    }
    
    initializeUI() {
        const app = document.getElementById('typing-game');
        app.innerHTML = this.html;
        this.startButton = document.getElementById("startButton");
        this.restartButton = document.getElementById("restartButton");
        this.startDiv = document.getElementById("start");
        this.gameDiv = document.getElementById("game");
        this.resultDiv = document.getElementById("result");
        this.wordDiv = document.getElementById("word");
        this.timerDiv = document.getElementById("timer");
        this.scoreDiv = document.getElementById("score");
        this.finalScoreDiv = document.getElementById("finalScore");

        this.startButton.addEventListener("click", () => {
            this.startDiv.classList.add("hidden");
            this.gameDiv.classList.remove("hidden");
            this.enableTextInput();
            this.inputLength = 0;
        });

        this.restartButton.addEventListener("click", () => {
            this.resultDiv.classList.add("hidden");
            this.startDiv.classList.remove("hidden");
            this.disableTextInput();
        });
    }
        async initializeGame() {
            const loadedWords = await this.loadWords();
            if (loadedWords.length > 0) {
                this.words = loadedWords;
                console.log("Words loaded:", this.words);
                return true;
            } else {
                console.error("No words loaded.");
                return false;
            }
        }

    enableTextInput() {
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
    }

    disableTextInput() {
        document.removeEventListener('keydown', (event) => this.handleKeyDown(event));
    }

    async loadWords() {
        try {
            // 単語データが存在するかチェック
            if (wordsArray && wordsArray.length > 0) {
                console.log("単語データが正常に読み込まれました。");
                return wordsArray;
            } else {
                console.error("単語データが空です。");
                return [];
            }
        } catch (error) {
            console.error("Error:", error);
            return [];
        }
    }

    parseCSV(data) {
        const rows = data.split("\n");
        return rows.slice(1).map((row) => row.trim());
    }

    initializeCanvas() {
        this.canvas = document.getElementById("timerCanvas");
        this.ctx = this.canvas.getContext("2d");
    }

    startGame() {
        this.initializeCanvas();
        this.score = 0;
        this.timeLeft = this.maxTime;
        this.penaltyTime = 0;
        this.updateScore(this.score);
        this.nextWord();
        this.startTimer();
    }

    nextWord() {
        if (this.score % 4 === 0 && this.score !== 0 && this.maxTime > 3) {
            this.maxTime -= 1;
        }

        this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
        console.log("Next word: ", this.currentWord);
        this.displayWord(this.currentWord);
        this.resetInput();
    }

    startTimer() {
        this.startTime = performance.now();
        requestAnimationFrame((currentTime) => this.updateTimer(currentTime));
    }

    updateTimer(currentTime) {
        const elapsed = (currentTime - this.startTime) / 1000;
        this.timeLeft = this.maxTime - elapsed - this.penaltyTime;
        this.updateTimerDisplay(this.timeLeft.toFixed(1));
        this.drawTimer(this.timeLeft);

        if (this.timeLeft > 0) {
            requestAnimationFrame((currentTime) => this.updateTimer(currentTime));
        } else {
            this.endGame();
        }
    }

    handleKeyDown(event) {
        const currentWord = this.currentWord;
        event.preventDefault();
        if (event.key.length === 1 && event.key === currentWord[this.inputLength]) {
            this.wordDiv.children[this.inputLength].classList.remove('incorrect');
            this.wordDiv.children[this.inputLength].classList.add('correct');
            this.inputLength++;

            this.handleInput(currentWord.substring(0, this.inputLength));
        } else if (event.key.length === 1) {
            this.reduceTime(this.amount);
        }
    }

    handleInput(value) {
        const currentWord = this.currentWord;
        if (value === currentWord) {
            this.handleCorrectInput();
        }
    }

    resetInput() {
        const inputDisplay = document.getElementById('inputDisplay');
        if (inputDisplay) {
            inputDisplay.textContent = '';
        }
    }

    updateTimerDisplay(time) {
        this.timerDiv.textContent = time;
    }

    updateScore(score) {
        this.scoreDiv.textContent = score;
    }

    drawTimer(timeLeft) {
        const radius = 50;
        const center = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        const startAngle = -0.5 * Math.PI;
        const endAngle = (1 - timeLeft / this.maxTime) * 2 * Math.PI - 0.5 * Math.PI;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.beginPath();
        this.ctx.arc(center.x, center.y, radius, startAngle, endAngle, false);
        this.ctx.lineTo(center.x, center.y);
        this.ctx.closePath();
        this.ctx.fillStyle = "red";
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = "black";
        this.ctx.stroke();
    }

    endGame() {
        clearInterval(this.timer);
        this.showResult(this.score);
    }

    handleCorrectInput() {
        this.score++;
        this.updateScore(this.score);
        this.timeLeft = this.maxTime;
        this.penaltyTime = 0;
        this.nextWord();
        this.startTimer();
    }

    getCurrentWord() {
        return this.currentWord;
    }

    reduceTime(amount) {
        this.penaltyTime += amount;
        if (this.timeLeft - amount <= 0) {
            this.timeLeft = 0;
            this.endGame();
        }
    }

    displayWord(word) {
        this.wordDiv.innerHTML = '';
        for (let char of word) {
            const span = document.createElement('span');
            span.textContent = char;
            span.classList.add('incorrect');
            this.wordDiv.appendChild(span);
        }
        this.inputLength = 0;
    }

    showResult(score) {
        this.gameDiv.classList.add("hidden");
        this.resultDiv.classList.remove("hidden");
        this.finalScoreDiv.textContent = "スコア: " + score;
        this.disableTextInput();
    }
}
