import { gameController, inputHandler } from './main.js';

const uiController = (function() {
    let startButton, restartButton, startDiv, gameDiv, resultDiv, wordDiv, timerDiv, scoreDiv, finalScoreDiv;
	const amount = 2; // ぺナルティ時間の増加量

    let inputLength;

    // client
    function initializeUI() {
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
            <div id="playersImage">
                <img src="img/person-use-notePc.png" alt="Image of player" class="player1" />
            </div>
        `;

        startButton = document.getElementById("startButton");
        restartButton = document.getElementById("restartButton");
        startDiv = document.getElementById("start");
        gameDiv = document.getElementById("game");
        resultDiv = document.getElementById("result");
        wordDiv = document.getElementById("word");
        timerDiv = document.getElementById("timer");
        scoreDiv = document.getElementById("score");
        finalScoreDiv = document.getElementById("finalScore");

        startButton.addEventListener("click", () => {
            startDiv.classList.add("hidden");
            gameDiv.classList.remove("hidden");
            enableTextInput();
            gameController.startGame();
            inputLength = 0;
        });

        restartButton.addEventListener("click", () => {
            resultDiv.classList.add("hidden");
            startDiv.classList.remove("hidden");
            disableTextInput();
        });
    }

    // clinet
    function enableTextInput() {
        document.addEventListener('keydown', handleKeyDown);
    }

    // clinet
    function disableTextInput() {
        document.removeEventListener('keydown', handleKeyDown);
    }

    // server
    function handleKeyDown(event) {
        const currentWord = gameController.getCurrentWord();
        event.preventDefault();
        // 正解
        if (event.key.length === 1 && event.key === currentWord[inputLength]) {
            // 正解の文字色に変更
            wordDiv.children[inputLength].classList.remove('incorrect');
            wordDiv.children[inputLength].classList.add('correct');
            inputLength++;

            // 入力内容の処理
            inputHandler.handleInput(currentWord.substring(0, inputLength));
        } else if (event.key.length === 1) {
            gameController.reduceTime(amount);
        }
    }

    
    // clinet
    function displayWord(word) {
        wordDiv.innerHTML = '';
        for (let char of word) {
            const span = document.createElement('span');
            span.textContent = char;
            span.classList.add('incorrect');
            wordDiv.appendChild(span);
        }
        inputLength = 0;
    }

    // server
    function updateTimer(time) {
        timerDiv.textContent = time;
    }

    // server
    function updateScore(score) {
        scoreDiv.textContent = score;
    }

    // client
    function showResult(score) {
        gameDiv.classList.add("hidden");
        resultDiv.classList.remove("hidden");
        finalScoreDiv.textContent = "スコア: " + score;
        disableTextInput();
    }

    return {
        initializeUI,
        displayWord,
        updateTimer,
        updateScore,
        showResult,
        enableTextInput,
        disableTextInput
    };
})();

export { uiController };