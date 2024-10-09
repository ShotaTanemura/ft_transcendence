import { Component } from "../core/component.js";
import { Header } from "./Header.js";

export class TypingGameWaiting extends Component {
  constructor(router, parameters, state) {
    super(router, parameters, state);
    this.findElement("button.go-back-to-game-home").onclick = this.onClick;
  }

  onClick = () => {
    this.connection.close();
    this.goNextPage("/typing-game-home");
  };

  afterPageLoaded() {
    this.connection = this.getRouteContext("TypingGameWebSocket");
    if (!this.connection) {
      alert("connection failed");
      this.goNextPage("/");
    }
    this.findElement("button.go-back-to-game-home").onclick = this.onClick;
  }

  get html() {
    return `
    		<main class="typing-game-waiting">
            <h1>waiting other paricipants...</h1>
            <h1>Don't reload this page.</h1>
            <button class="go-back-to-game-home">go back to game home</button>
        </main>
        `;
  }
}
