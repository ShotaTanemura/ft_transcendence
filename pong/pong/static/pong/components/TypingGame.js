import { Component } from "../core/component.js";

export class TypingGame extends Component {
  constructor(router, parameters, state) {
    super(router, parameters, state);
    this.input_length = 0;
    this.timer = 10;
    this.maxTime = 10;
    // ゲーム開始前にnextwordが来て+1されるので-1からスタート
    this.score = -1;
    this.isMyTurn = false;
  }

  afterPageLoaded() {
    this.connection = this.getRouteContext("TypingGameWebSocket");
    if (!this.connection) {
      alert("connection failed");
      this.goNextPage("/");
      return;
    }
    this.connection.onmessage = this.onMessage;

    // キーボードイベントのリスナーを追加
    document.addEventListener("keydown", this.onKeyDown);
  }

  beforePageUnload() {
    // ページ遷移時にリスナーを解除
    document.removeEventListener("keydown", this.onKeyDown);
  }

  onKeyDown = (e) => {
    if (this.connection && this.connection.readyState === WebSocket.OPEN) {
      // WebSocketが開いている状態のときのみ送信
      this.connection.send(
        JSON.stringify({
          sender: "player",
          type: "gameKeyEvent",
          contents: e.key,
        }),
      );
    } else {
      console.warn("Cannot send message, WebSocket is not open.");
    }
  };

  onMessage = (event) => {
    const message = JSON.parse(event.data);
    switch (message.type) {
      case "start-game":
        break;

      case "next-word":
        document.getElementById("inputCorrect").innerHTML = "";
        this.input_length = 0;
        document.getElementById("word").innerHTML = message.contents.word;
        this.score++;
        document.getElementById("player_to_input").innerHTML =
          message.contents.player;
        document.getElementById("score").innerHTML = this.score;
        break;

      case "correct-key":
        document.getElementById("inputCorrect").innerHTML +=
          message.contents.word[this.input_length];
        this.input_length++;
        break;

      case "incorrect-key":
        break;

      case "game-finished":
        document.getElementById("winner").innerHTML =
          `winner = ${message.contents.winner}`;
        this.setRouteContext("TypingGameWinner", message.contents.winner);
        this.goNextPage("/typing-game-finished");
        break;

      case "countdown-timer":
        this.drawTimerCanvas(message.contents.timer);
        break;

      case "room-state":
        this.setRouteContext("TypingGameWebSocket", this.connection);
        this.changePageByRoomStatus(message);
        break;

      default:
        console.warn(`Unknown message type: ${message.type}`);
        break;
    }
  };

  drawTimerCanvas(remainingTime) {
    const canvas = document.getElementById("timerCanvas");
    if (!canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    const radius = canvas.width / 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = "#f0f0f0";
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#ddd";
    ctx.stroke();

    const startAngle = -0.5 * Math.PI;
    const endAngle = startAngle + (remainingTime / this.maxTime) * 2 * Math.PI;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 10, startAngle, endAngle, false);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#ff4d4f";
    ctx.stroke();

    ctx.font = "30px Arial";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(remainingTime + "s", centerX, centerY);
  }

  get html() {
    return `
      <main class="typing-game">
        <canvas id="timerCanvas" width="200" height="200"></canvas><br>
        <h1>
          <span id="word">word</span>
        </h1><br>
        <div>
          input correct = 
          <span id="inputCorrect"></span><br>
        </div>
        <div>
          入力する人 = 
          <span id="player_to_input">player1</span><br>
        </div>
        <div>
          ２人が入力した単語数 = 
          <span id="score">0</span><br>
        </div>
        <div>
          <span id="winner"></span>
        </div>
      </main>
    `;
  }
}
