import { Component } from "../core/component.js";
import { Load } from "./Load.js";

export class PongGameWaiting extends Component {
  constructor(router, parameters, state) {
    super(router, parameters, state);
    this.connection = this.getRouteContext("WebSocket");
    this.findElement("button.go-back-to-game-home").onclick = this.onClick;
  }

  afterPageLoaded = () => {
    new Load(this.router, this.parameters, this.state).onload();
  };

  onClick = () => {
    this.connection.close();
    this.goNextPage("/pong-game-home");
  };

  get html() {
    return `
      <main class="text-center p-5">
        <h1>Don't reload this page.</h1>
        <div class="spinner-border" role="status">
          <span class="sr-only">Loading...</span>
        </div>
        <h2>waiting other paricipants...</h2>
        <button class="go-back-to-game-home btn btn-danger">Quit hosting</button>
      </main>
    `;
  }
}
