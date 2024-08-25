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
    switch (message.type) {
      case "typing-input":
        console.log("typing-input\nMessage received:", message);
        break;
      case "next-word":
        console.log("next-word\nMessage received:", message);
        break;
      case "correct-key":
        console.log("correct-key\nMessage received:", message);
        break;
      case "incorrect-key":
        console.log("incorrect-key\nMessage received:", message);
        break;

      // TODO:必要に応じて他のケースを追加
      default:
        console.warn(`Unknown message type: ${message.type}`);
        break;
    }
  };
}
