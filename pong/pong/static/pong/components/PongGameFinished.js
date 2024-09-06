import { Component } from "../core/component.js";
import { Load } from "./Load.js";
import { Header } from "./Header.js";

export class PongGameFinished extends Component {
  constructor(router, parameters, state) {
    super(router, parameters, state);
    this.findElement("button.go-back-to-game-home").onclick = this.onClick;
  }

  afterPageLoaded = () => {
    new Load(this.router, this.parameters, this.state).onload();
    this.headerComponent = new Header(this.router, this.params, this.state);
    this.element.parentElement.prepend(this.headerComponent.element);
    this.headerComponent.afterPageLoaded();
  };

  beforePageUnload = () => {
    this.element.parentElement.removeChild(this.headerComponent.element);
  };

  onClick = () => {
    this.goNextPage("/pong-game-home");
  };

  get html() {
    return `
      <main class="text-center p-5">
			  <h1>congratulation ${this.getRouteContext("TournamentWinner")}!!</h1>
        <button class="go-back-to-game-home btn bg-success">Game Home</button>
      </main>
		`;
  }
}

export default PongGameFinished;
