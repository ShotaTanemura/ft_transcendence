import { loadWords } from "./loadWords.js";
import { uiController } from "./uiController.js";
import { inputHandler } from "./inputHandler.js";

const gameController = (function () {
  let timer;
  let timeLeft;
  let score;
  let currentWord;
  let startTime;
  let maxTime = 15; // 初期タイマー値
  let penaltyTime; // ペナルティ時間を追跡するための変数
  let canvas, ctx;
  let words = [];

  // Server
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

  // clinet
  function initializeCanvas() {
    canvas = document.getElementById("timerCanvas");
    ctx = canvas.getContext("2d");
  }

  // Server
  function startGame() {
    initializeCanvas();
    score = 0;
    timeLeft = maxTime;
    penaltyTime = 0; // ペナルティ時間をリセット
    uiController.updateScore(score);
    nextWord();
    startTimer();
  }

  // Server
  function nextWord() {
    // 制限時間の短縮
    if (score % 4 === 0 && score !== 0 && maxTime > 3) {
      maxTime -= 1;
    }

    currentWord = words[Math.floor(Math.random() * words.length)];
    console.log("Next word: ", currentWord); // デバッグ用ログ
    // client
    uiController.displayWord(currentWord);
    inputHandler.resetInput();
  }

  function startTimer() {
    // Server
    startTime = performance.now();
    // Client
    requestAnimationFrame(updateTimer);
  }

  function updateTimer(currentTime) {
    const elapsed = (currentTime - startTime) / 1000; // 経過時間
    timeLeft = maxTime - elapsed - penaltyTime; // ペナルティ時間を考慮
    uiController.updateTimer(timeLeft.toFixed(1));
    // Client
    drawTimer(timeLeft);

    if (timeLeft > 0) {
      // Client
      requestAnimationFrame(updateTimer);
    } else {
      endGame();
    }
  }


  function endGame() {
    // server
    clearInterval(timer);
    // client
    uiController.showResult(score);
  }

  // server
  function handleCorrectInput() {
    score++;
    uiController.updateScore(score);
    timeLeft = maxTime;
    penaltyTime = 0;
    nextWord();
    startTimer(); // タイマーをリセット
  }

  function getCurrentWord() {
    return currentWord;
  }

  // Server
  function reduceTime(amount) {
    penaltyTime += amount; // ペナルティ時間を加算
    if (timeLeft - amount <= 0) {
      timeLeft = 0;
      endGame();
    }
  }

  // Client
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

export { gameController };