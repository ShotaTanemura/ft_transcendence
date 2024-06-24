const gameController = (function() {
    let timer;
    let timeLeft;
    let score;
    let currentWord;
    const maxTime = 10; // 初期タイマー値
    const words = ["apple", "banana", "cherry", "grape", "elderberry"];

    function startGame() {
        score = 0;
        timeLeft = maxTime;
        uiController.updateTimer(timeLeft); // 初期値をUIに反映
        uiController.updateScore(score);
        nextWord();
        startTimer();
    }

    function nextWord() {
        currentWord = words[Math.floor(Math.random() * words.length)];
		console.log("Next word: ", currentWord); // デバッグ用ログ
        uiController.displayWord(currentWord);
        inputHandler.resetInput();
    }

    function startTimer() {
        clearInterval(timer);
        timer = setInterval(() => {
            timeLeft--;
            uiController.updateTimer(timeLeft); // タイマー更新
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    function endGame() {
        clearInterval(timer);
        uiController.showResult(score);
    }

    function handleCorrectInput() {
        score++;
        uiController.updateScore(score);
        timeLeft = maxTime;
        nextWord();
    }

	function getCurrentWord() {
		return currentWord;
	}

    return {
        startGame,
        handleCorrectInput,
		getCurrentWord 
    };
})();
