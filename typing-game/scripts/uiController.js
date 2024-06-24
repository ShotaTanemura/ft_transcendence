const uiController = (function() {
    const startButton = document.getElementById("startButton");
    const restartButton = document.getElementById("restartButton");
    const startDiv = document.getElementById("start");
    const gameDiv = document.getElementById("game");
    const resultDiv = document.getElementById("result");
    const wordDiv = document.getElementById("word");
    const inputField = document.getElementById("input");
    const timerDiv = document.getElementById("timer");
    const scoreDiv = document.getElementById("score");
    const finalScoreDiv = document.getElementById("finalScore");

    startButton.addEventListener("click", () => {
        startDiv.classList.add("hidden");
        gameDiv.classList.remove("hidden");
        gameController.startGame();
    });

    restartButton.addEventListener("click", () => {
        resultDiv.classList.add("hidden");
        startDiv.classList.remove("hidden");
    });

    function displayWord(word) {
        wordDiv.textContent = word;
    }

    function updateTimer(time) {
        timerDiv.textContent = time; // タイマーの表示を更新
    }

    function updateScore(score) {
        scoreDiv.textContent = score;
    }

    function showResult(score) {
        gameDiv.classList.add("hidden");
        resultDiv.classList.remove("hidden");
        finalScoreDiv.textContent = "スコア: " + score;
    }

    return {
        displayWord,
        updateTimer,
        updateScore,
        showResult,
        getInputField: () => inputField
    };
})();
