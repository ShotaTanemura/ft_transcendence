import { Component } from "../core/component.js";

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
    this.input_length = 0
    this.timer = 10
    // ゲーム開始前にnext-wordが来るので、-1からスタート
    this.score = -1
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
        this.score++;
        document.getElementById("player_to_input").innerHTML = message.contents.player;
        document.getElementById("score").innerHTML = this.score;
        break;
      case "correct-key":
        document.getElementById("inputCorrect").innerHTML =
        message.contents.word[this.input_length];
        this.input_length++;
        break;

      case "incorrect-key":
        break;

      case "game-finished":
        document.getElementById("winner").innerHTML = `winner = ${message.contents.winner}`
        this.setRouteContext("TypingGameWinner", message.contents.winner);
        setTimeout(() => {
          this.goNextPage("/typing-game-finished");
      }, 5000);
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
      <div> 入力する人 = 
        <span id="player_to_input">player1</span><br>
      </div>
      <div> 正解した単語数 = 
       <span id="score">0</span><br>
      </div>
      <div>
      <span id="winner"></span>
      </div>
      <canvas id="timerCanvas" width="200" height="200"></canvas>
      <canvas class="typinggame"></canvas>
    </main>
    `;
  }
}
