import { uiController } from './uiController.js';

document.addEventListener('DOMContentLoaded', async () => {
    uiController.initializeUI();
    const gameInitialized = await gameController.initializeGame();
    if (gameInitialized) {
        document.getElementById('startButton').addEventListener('click', () => {
            gameController.startGame();
        });
    } else {
        console.error('Failed to initialize game.');
    }
});

// サーバー
async function loadWords() {
  try {
    const response = await fetch("words.csv");
    const data = await response.text();
    return parseCSV(data);
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

// CSVをパースする関数
function parseCSV(data) {
  const rows = data.split("\n");
  return rows.slice(1).map((row) => row.trim()); // ヘッダーを除いてトリムされた単語を返す
}

// サーバー
export const inputHandler = (function() {
    function handleInput(value) {
        const currentWord = gameController.getCurrentWord();
        if (value === currentWord) {
            gameController.handleCorrectInput();
        }
    }

    function resetInput() {
        const inputDisplay = document.getElementById('inputDisplay');
        if (inputDisplay) {
            inputDisplay.textContent = '';
        }
    }

    return {
        handleInput,
        resetInput
    };
})();

export const gameController = (function () {
  let timer;
  let timeLeft;
  let score;
  let currentWord;
  let startTime;
  let maxTime = 15; // 初期タイマー値
  let penaltyTime; // ペナルティ時間を追跡するための変数
  let canvas, ctx;
  let words = [];

  // サーバー
  async function initializeGame() {
    const loadedWords = await loadWords();
    if (loadedWords.length > 0) {
      words = loadedWords; // ここで代入
      console.log("Words loaded:", words);
      return true;
    } else {
      console.error("No words loaded.");
      return false;
    }
  }

  // クライアント
  function initializeCanvas() {
    canvas = document.getElementById("timerCanvas");
    ctx = canvas.getContext("2d");
  }

  // サーバー
  function startGame() {
    initializeCanvas();
    score = 0;
    timeLeft = maxTime;
    penaltyTime = 0; // ペナルティ時間をリセット
    uiController.updateScore(score);
    nextWord();
    startTimer();
  }

  // サーバー
  function nextWord() {
    // 制限時間の短縮
    if (score % 4 === 0 && score !== 0 && maxTime > 3) {
      maxTime -= 1;
    }

    currentWord = words[Math.floor(Math.random() * words.length)];
    console.log("Next word: ", currentWord); // デバッグ用ログ
    // クライアント
    uiController.displayWord(currentWord);
    inputHandler.resetInput();
  }

  // サーバー
  function startTimer() {
    startTime = performance.now();
    // クライアント
    requestAnimationFrame(updateTimer);
  }

  // クライアント
  function updateTimer(currentTime) {
    const elapsed = (currentTime - startTime) / 1000; // 経過時間
    timeLeft = maxTime - elapsed - penaltyTime; // ペナルティ時間を考慮
    uiController.updateTimer(timeLeft.toFixed(1));
    drawTimer(timeLeft);

    if (timeLeft > 0) {
      requestAnimationFrame(updateTimer);
    } else {
      endGame();
    }
  }

  // サーバー
  function endGame() {
    clearInterval(timer);
    // クライアント
    uiController.showResult(score);
  }

  // サーバー
  function handleCorrectInput() {
    score++;
    uiController.updateScore(score);
    timeLeft = maxTime;
    penaltyTime = 0;
    nextWord();
    startTimer(); // タイマーをリセット
  }

  // サーバー
  function getCurrentWord() {
    return currentWord;
  }

  // サーバー
  function reduceTime(amount) {
    penaltyTime += amount; // ペナルティ時間を加算
    if (timeLeft - amount <= 0) {
      timeLeft = 0;
      endGame();
    }
  }

  // クライアント
  function drawTimer(timeLeft) {
    const radius = 50; // 内側の円の半径
    const center = { x: canvas.width / 2, y: canvas.height / 2 };
    const startAngle = -0.5 * Math.PI;
    const endAngle = (1 - timeLeft / maxTime) * 2 * Math.PI - 0.5 * Math.PI;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // キャンバスをクリア

    // タイマーの円 (内側の部分)
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, startAngle, endAngle, false);
    ctx.lineTo(center.x, center.y); // 中心にラインを引く
    ctx.closePath();
    ctx.fillStyle = "red";
    ctx.fill();

    // 背景の円 (外側の枠線)
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "black";
    ctx.stroke();
  }

  return {
    initializeGame,
    startGame,
    handleCorrectInput,
    getCurrentWord,
    reduceTime,
  };
})();