import { Component } from "../core/component.js";
import { Load } from "./Load.js";
import { Header } from "./Header.js";

export class TypingGameFinished extends Component {
  constructor(router, parameters, state) {
    new Load(router, parameters, state).onload();
    super(router, parameters, state);
    this.findElement("button.go-back-to-game-home").onclick = this.onClick;
  }

  onClick = () => {
    this.goNextPage("/typing-game-home");
  };


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
      <main class="text-center p-5">
			  <h1>Congratulation <span class="text-primary">${this.getRouteContext("TypingGameWinner")}</span>!!</h1>
        <button class="go-back-to-game-home">go back to game home</button>
      </main>
		`;
  }
}

export default TypingGameFinished;
