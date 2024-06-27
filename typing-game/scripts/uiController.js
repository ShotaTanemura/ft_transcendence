import { gameController } from './gameController.js';
import { inputHandler } from './inputHandler.js';

const uiController = (function() {
    const startButton = document.getElementById("startButton");
    const restartButton = document.getElementById("restartButton");
    const startDiv = document.getElementById("start");
    const gameDiv = document.getElementById("game");
    const resultDiv = document.getElementById("result");
    const wordDiv = document.getElementById("word");
    const timerDiv = document.getElementById("timer");
    const scoreDiv = document.getElementById("score");
    const finalScoreDiv = document.getElementById("finalScore");
	const amount = 2; // ぺナルティ時間の増加量

    let inputLength;

    function enableTextInput() {
        document.addEventListener('keydown', handleKeyDown);
    }

    function disableTextInput() {
        document.removeEventListener('keydown', handleKeyDown);
    }

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

    function displayWord(word) {
        wordDiv.innerHTML = ''; // 前の単語をクリア
        for (let char of word) {
            const span = document.createElement('span');
            span.textContent = char;
            span.classList.add('incorrect');
            wordDiv.appendChild(span);
        }
        inputLength = 0;
    }

    function updateTimer(time) {
        timerDiv.textContent = time;
    }

    function updateScore(score) {
        scoreDiv.textContent = score;
    }

    function showResult(score) {
        gameDiv.classList.add("hidden");
        resultDiv.classList.remove("hidden");
        finalScoreDiv.textContent = "スコア: " + score;
        disableTextInput();
    }

    return {
        displayWord,
        updateTimer,
        updateScore,
        showResult,
        enableTextInput,
        disableTextInput
    };
})();

export { uiController };