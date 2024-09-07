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
    this.input_length = 0
    this.timer = 10
    this.score = 0
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
        document.getElementById("inputCorrect").innerHTML = "";
        this.input_length = 0;
        document.getElementById("word").innerHTML = message.contents.word;
        score++;
        document.getElementById("score").innerHTML = score;
        // TODO: 入力プレイヤーを変更する
        break;
      case "correct-key":
        document.getElementById("inputCorrect").innerHTML =
        message.contents.word[this.input_length];
        this.input_length++;
        break;

      case "incorrect-key":
        // TODO: 1番始めの単語が取得できないバグがあるため、一時的に対処
        document.getElementById("word").innerHTML = message.contents.word;
        break;

      case "time-up":
        document.getElementById("winner").innerHTML = `winner = ${message.contents.player}`
        // this.goNextPage("/typing-game-finished");
        break;

      case "countdown-timer":
        document.getElementById("timer").innerHTML =
          message.contents.timer
        break;
  
      case "room-state":
        this.changePageByRoomStatus(message);
        break;
        
      default:
        console.warn(`Unknown message type: ${message.type}`);
        break;
    }
  };

  get html() {
    return `
    <main class="game">
      <span id="timer">10</span><br>
      <h1>
        <span id="word">word</span>
      </h1><br>
      <div> input correct = 
        <span id="inputCorrect"></span><br>
      </div>
      <div> 入力した単語数 = 
       <span id="score">0</span><br>
      </div>
      <canvas id="timerCanvas" width="200" height="200"></canvas>
      </div>
      <span id="winner"></span>
      </div>
      <canvas class="typinggame"></canvas>
    </main>
    `;
  }
}
