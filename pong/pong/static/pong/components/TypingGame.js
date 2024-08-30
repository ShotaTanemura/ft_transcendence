import { Component } from "../core/component.js";

export class TypingGame extends Component {
  constructor(router, parameters, state) {
    super(router, parameters, state);

    // websocketでの接続テスト
    this.connection = this.getRouteContext("WebSocket");
    if (!this.connection) {
      console.error(
        "WebSocket connection is undefined, creating a new connection.",
      );
    }
    this.connection.onmessage = this.onMessage;

    this.canvas = this.findElement("canvas.typinggame");
    this.context = this.canvas.getContext("2d");
    this.input_length = 0
    this.timer = 10
    this.isMyTurn = false

    document.addEventListener("keydown", (e) => {
      this.connection.send(
        JSON.stringify({
          sender: "player",
          type: "gameKeyEvent",
          contents: e.key,
        }),
      );
    });
  }
  onMessage = (event) => {
    const message = JSON.parse(event.data);
    console.log(message.type, message);
    switch (message.type) {
      case "start-game":
        break;
      case "next-word":
        document.getElementById("word").innerHTML =
          message.contents.word
        // TODO: 入力プレイヤーを変更する
        break;
      case "correct-key":
        break;
      case "incorrect-key":
        break;
      case "time-up":
        break;
      case "countdown-timer":
        break;

      // TODO:必要に応じて他のケースを追加
      default:
        console.warn(`Unknown message type: ${message.type}`);
        break;
    }
  };

  get html() {
    return `
    <main class="game">
      <div id="game" class="hidden">
      <span id="timer">10</span><br>
      <span id="word">word</span><br>
      <span id="inputDisplay">input word</span><br>
      <span id="score">0</span><br>
      <canvas id="timerCanvas" width="200" height="200"></canvas>
      </div>
      <div id="result" class="hidden">
      <div id="finalScore"></div>
      <button id="restartButton" class="button">リスタート</button>
      </div>
      <canvas class="typinggame"></canvas>
    </main>
    `;
  }
}
