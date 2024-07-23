import { Component } from "../core/component.js";

export class Pong extends Component {

    constructor(router, parameters, state) {
        super(router, parameters, state);

        //setting websocket
        this.connection = this.getRouteContext("WebSocket");
        this.connection.onmessage = this.onMessage;

        this.canvas = this.findElement("canvas.ponggame");
        this.context = this.canvas.getContext('2d');
        this.grid = 15;
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            width: this.grid,
            height: this.grid
        };
        this.leftPaddle = {
          y: this.canvas.height / 2,
          size: 80
        };
        this.rightPaddle = {
          y: this.canvas.height / 2,
          size: 80
        };
        document.addEventListener('keydown', (e) =>  {
          if (e.which === 87) {
            this.connection.send(JSON.stringify({"sender": "player", "type": "gameKeyEvent", "contents": "keyup-go-up"}));
          }
          else if (e.which === 83) {
            this.connection.send(JSON.stringify({"sender": "player", "type": "gameKeyEvent", "contents": "keyup-go-down"}));
          }
        });
        document.addEventListener('keyup', (e) =>  {
          if (e.which === 87 || e.which === 83) {
            this.connection.send(JSON.stringify({"sender": "player", "type": "gameKeyEvent", "contents": "keydown"}));
          }
        });
        requestAnimationFrame(this.loop);
    }

    onMessage = (event) => {
		  const message = JSON.parse(event.data);
      switch (message.type){
        case "GameObjectLocation":
          this.ball.x = message.contents.ball.x_position;
          this.ball.y = message.contents.ball.y_position;
          this.leftPaddle.y = message.contents.player1_paddle;
          this.rightPaddle.y = message.contents.player2_paddle;
          break;
        case "PlayerScored":
          break;
        case "GameEnded":
          break;

      }
      
    }

    loop = () =>  {
        requestAnimationFrame(this.loop);
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
        // draw ball
        this.context.fillRect(this.ball.x, this.ball.y, this.ball.width, this.ball.height);
        // draw walls
        this.context.fillStyle = 'black';
        this.context.fillRect(0, 0, this.canvas.width, this.grid);
        this.context.fillRect(0, this.canvas.height - this.grid, this.canvas.width, this.canvas.height);
        // draw player1 paddle
        this.context.fillRect(0, this.leftPaddle.y - this.leftPaddle.size / 2, this.grid, this.leftPaddle.size);
        // draw player2 paddle
        this.context.fillRect(this.canvas.width - this.grid, this.rightPaddle.y - this.rightPaddle.size / 2, this.grid, this.rightPaddle.size);
        // draw dotted line down the middle
        for (let i = this.grid; i < this.canvas.height - this.grid; i += this.grid * 2) {
          this.context.fillRect(this.canvas.width / 2 - this.grid / 2, i, this.grid, this.grid);
        }
    }

    get html() {
        return (`
            <main class="game">
              <canvas width="1500" height="585" class="ponggame"></canvas>
            </main>
        `)
    }
};