import { Component } from "../core/component.js";
import { Header } from "./Header.js";

export class TypingGame extends Component {
  constructor(router, parameters, state) {
    super(router, parameters, state);

    this.connection = this.getRouteContext("WebSocket");
    if (!this.connection) {
      console.error(
        "WebSocket connection is undefined, creating a new connection.",
      );
    }
    this.connection.onmessage = this.onMessage;
    this.input_length = 0;
    this.timer = 10;
    this.maxTime = 10;
    // ゲーム開始前にnext-wordが来るので、-1からスタート
    this.score = -1;
    this.isMyTurn = false;
  }

  sendMessage = (e) => {
    if (this.connection.readyState === WebSocket.OPEN) {
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
    console.log(message.type, message);
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
        // TODO: 文字が合っていたら、文字色を変える`
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
        this.changePageByRoomStatus(message);
        break;

      default:
        console.warn(`Unknown message type: ${message.type}`);
        print(message);
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

  afterPageLoaded() {
    this.headerComponent = new Header(this.router, this.params, this.state);
    this.element.parentElement.prepend(this.headerComponent.element);
    this.headerComponent.afterPageLoaded();
    document.addEventListener("keydown", this.sendMessage);
  }

  beforePageUnload() {
    document.removeEventListener("keydown", this.sendMessage);
    this.element.parentElement.removeChild(this.headerComponent.element);
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
