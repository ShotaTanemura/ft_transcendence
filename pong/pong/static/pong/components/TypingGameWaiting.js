import { Component } from "../core/component.js";
import { Header } from "./Header.js";

export class TypingGameWaiting extends Component {
  constructor(router, parameters, state) {
    super(router, parameters, state);
    this.connection = this.getRouteContext("WebSocket");
    this.findElement("button.go-back-to-game-home").onclick = this.onClick;
  }

  onClick = (event) => {
    this.connection.close();
    this.goNextPage("/typing-game-home");
  }

  afterPageLoaded() {
    this.headerComponent = new Header(this.router, this.params, this.state);
    this.element.parentElement.prepend(this.headerComponent.element);
    this.headerComponent.afterPageLoaded();
  }

  beforePageUnload() {
    this.element.parentElement.removeChild(this.headerComponent.element);
  }
  get html() {
    return `
            <h1>waiting other paricipants...</h1>
            <h1>Don't reload this page.</h1>
            <button class="go-back-to-game-home">go back to game home</button>
        `;
  }
}
