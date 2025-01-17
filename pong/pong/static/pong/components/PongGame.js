import { Component } from "../core/component.js";

export class PongGame extends Component {
  constructor(router, parameters, state) {
    super(router, parameters, state);
  }

  afterPageLoaded() {
    //setting websocket
    this.connection = this.getRouteContext("PongGameWebSocket");
    if (!this.connection) {
      alert("connection failed");
      this.goNextPage("/");
      return;
    }
    this.connection.onmessage = this.onMessage;
    this.canvas = this.findElement("canvas.ponggame");
    this.context = this.canvas.getContext("2d");
    this.grid = 15;
    this.ball = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      width: this.grid,
      height: this.grid,
    };
    this.leftPaddle = {
      y: this.canvas.height / 2,
      size: 80,
    };
    this.rightPaddle = {
      y: this.canvas.height / 2,
      size: 80,
    };
    document.addEventListener("keydown", this.onKeyDown);
    requestAnimationFrame(this.loop);
  }

  beforePageUnload() {
    document.removeEventListener("keydown", this.onKeyDown);
  }

  onKeyDown = (event) => {
    console.log(event.key);
    if (event.key === "w") {
      this.connection.send(
        JSON.stringify({
          sender: "player",
          type: "gameKeyEvent",
          contents: "keydown-go-up",
        }),
      );
    } else if (event.key === "s") {
      this.connection.send(
        JSON.stringify({
          sender: "player",
          type: "gameKeyEvent",
          contents: "keydown-go-down",
        }),
      );
    }
  };

  onMessage = (event) => {
    const message = JSON.parse(event.data);
    switch (message.type) {
      case "game-objects-moved":
        this.ball.x = message.contents.ball.x_position;
        this.ball.y = message.contents.ball.y_position;
        this.leftPaddle.y = message.contents.player1_paddle;
        this.rightPaddle.y = message.contents.player2_paddle;
        break;
      case "player-scored":
        document.getElementById("player1-name").innerHTML =
          message.contents.player1.name;
        document.getElementById("player1-score").innerHTML =
          message.contents.player1.score;
        document.getElementById("player2-name").innerHTML =
          message.contents.player2.name;
        document.getElementById("player2-score").innerHTML =
          message.contents.player2.score;
        break;
      case "room-state":
        this.setRouteContext("PongGameWebSocket", this.connection);
        this.changePageByRoomStatus(message);
        break;
      case "tournament":
        this.setRouteContext("Tournament", message.contents);
        break;
      case "tournament-winner":
        this.setRouteContext("TournamentWinner", message.contents);
        break;
      case "timeout":
        if (document.getElementById("timeoutMessage")) {
          document.getElementById("timeoutMessage").innerHTML =
            "Timeout requested.";
        }
        break;
    }
  };

  changePageByRoomStatus = (message) => {
    if (message.type != "room-state")
      throw new Error("changePageByRoomStatus: invalid message type");
    switch (message.contents) {
      case "Not_All_Participants_Connected":
        this.goNextPage("/pong-game-waiting");
        break;
      case "Waiting_For_Participants_To_Approve_Room":
        this.goNextPage("/pong-game-room");
        break;
      case "Display_Tournament":
        this.goNextPage("/pong-game-tournament");
        break;
      case "In_Game":
        this.goNextPage("/pong-game");
        break;
      case "Finished":
        this.goNextPage("/pong-game-finished");
        break;
      default:
        throw Error("changePageByRoomStatus: doesn't match any room states.");
    }
  };

  loop = () => {
    requestAnimationFrame(this.loop);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "white";
    // draw ball
    this.context.beginPath(); // パスの初期化
    this.context.arc(
      this.ball.x + this.ball.width / 2,
      this.ball.y + this.ball.height / 2,
      this.grid / 2,
      0,
      2 * Math.PI,
    );
    this.context.closePath(); // パスを閉じる
    this.context.fill(); // 軌跡の範囲を塗りつぶす
    // draw walls
    this.context.fillRect(0, 0, this.canvas.width, this.grid);
    this.context.fillRect(
      0,
      this.canvas.height - this.grid,
      this.canvas.width,
      this.canvas.height,
    );
    // draw player1 paddle
    this.context.fillRect(
      0,
      this.leftPaddle.y - this.leftPaddle.size / 2,
      this.grid,
      this.leftPaddle.size,
    );
    // draw player2 paddle
    this.context.fillRect(
      this.canvas.width - this.grid,
      this.rightPaddle.y - this.rightPaddle.size / 2,
      this.grid,
      this.rightPaddle.size,
    );
    // draw dotted line down the middle
    for (
      let i = this.grid;
      i < this.canvas.height - this.grid;
      i += this.grid * 2
    ) {
      this.context.fillRect(
        this.canvas.width / 2 - this.grid / 2,
        i,
        this.grid,
        this.grid,
      );
    }
  };

  get html() {
    return `
      <main class="game text-center bg-dark">
        <div class="w-100 d-flex justify-content-around container bg-secondary-subtle">
          <div class="player1">
            <h1 id="player1-name" class="name">Player 1</h1> 
            &nbsp;
            <h1 class="score">Score: <span id="player1-score">0</span></h1>
          </div>
          <div class="player2">
            <h1 id="player2-name" class="name">Player 2</h1>
              &nbsp;
            <h1 class="score">Score: <span id="player2-score">0</span></h1>
          </div>
        </div>
        <canvas width="1500" height="800" class="ponggame"></canvas>
      </main>
    `;
  }
}
