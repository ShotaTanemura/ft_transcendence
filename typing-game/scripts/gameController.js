const gameController = (function() {
    let timer;
    let timeLeft;
    let score;
    let currentWord;
    let maxTime = 15; // 初期タイマー値
	const canvas = document.getElementById('timerCanvas');
	const ctx = canvas.getContext('2d');
	// TODO: 別ファイルで単語を管理する
    const words = ["apple", "banana", "cherry", "grape", "elderberry"];

    function startGame() {
        score = 0;
        timeLeft = maxTime;
        uiController.updateScore(score);
        nextWord();
        startTimer();
    }
	
    function nextWord() {\
		// 制限時間の短縮
		if (score % 4 == 0 && score != 0 && maxTime > 5)
			maxTime -= 0.5;
		currentWord = words[Math.floor(Math.random() * words.length)];
		console.log("Next word: ", currentWord); // デバッグ用ログ
        uiController.displayWord(currentWord);
		startTimer();
        inputHandler.resetInput();
    }
	
	function startTimer() {
		startTime = performance.now();
		requestAnimationFrame(updateTimer);
	}
	
	function updateTimer(currentTime) {
		const elapsed = (currentTime - startTime) / 1000; //経過時間
		timeLeft = maxTime - elapsed;
		uiController.updateTimer(timeLeft.toFixed(1)); // タイマー更新
		drawTimer(timeLeft); // 残り時間に応じて円グラフを描画
	
		if (timeLeft > 0)
			requestAnimationFrame(updateTimer);
		else
			endGame();
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

function drawTimer(timeLeft) {
    const radius = 50; // 内側の円の半径
    const center = { x: canvas.width / 2, y: canvas.height / 2 };
    const startAngle = -0.5 * Math.PI;
    const endAngle = (1 - (timeLeft / maxTime)) * 2 * Math.PI - 0.5 * Math.PI;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // キャンバスをクリア
	// タイマーの円 (内側の部分)
	ctx.beginPath();
	ctx.arc(center.x, center.y, radius, startAngle, endAngle, false);
	ctx.lineTo(center.x, center.y); // 中心にラインを引く
	ctx.closePath();
	ctx.fillStyle = 'red';
	ctx.fill();
    // 背景の円 (外側の枠線)
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'black';
    ctx.stroke();
}


    return {
        startGame,
        handleCorrectInput,
		getCurrentWord 
    };
})();
