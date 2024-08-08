import { Component } from "../core/component.js";
import { Load } from "./Load.js";

export class PongGameWaiting extends Component {
  constructor(router, parameters, state) {
    new Load(router, parameters, state).onload();
    super(router, parameters, state);
    this.connection = this.getRouteContext("WebSocket");
    this.findElement("button.go-back-to-game-home").onclick = this.onClick;
  }

  onClick = () => {
    this.connection.close();
  };

  get html() {
    return `
            <h1>waiting other paricipants...</h1>
            <h1>Don't reload this page.</h1>
            <button class="go-back-to-game-home">go back to game home</button>
        `;
  }
}
