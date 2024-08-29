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
}
