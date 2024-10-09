import { Component } from "../core/component.js";
import { Header } from "./Header.js";

export class PongGameFinished extends Component {
  constructor(router, parameters, state) {
    super(router, parameters, state);
    this.findElement("button.go-back-to-game-home").onclick = this.onClick;
  }

  afterPageLoaded = () => {
    this.headerComponent = new Header(this.router, this.params, this.state);
    this.element.parentElement.prepend(this.headerComponent.element);
    this.headerComponent.afterPageLoaded();
    const tournamentWinner = this.getRouteContext("TournamentWinner");
    if (!tournamentWinner) {
      alert("connection failed.");
      this.goNextPage("/");
    } else {
      document.getElementById("tournamentWinnerName").innerHTML =
        tournamentWinner;
      this.unsetRouteContext("TournamentWinner");
    }
  };

  beforePageUnload = () => {
    this.element.parentElement.removeChild(this.headerComponent.element);
  };

  onClick = () => {
    this.unsetRouteContext("TournamentWinner");
    this.goNextPage("/pong-game-home");
  };

  get html() {
    return `
      <main class="text-center p-5">
			  <h1>Congratulation <span id="tournamentWinnerName" class="text-primary"></span>!!</h1>
        <button class="go-back-to-game-home btn bg-success">Game Home</button>
      </main>
		`;
  }
}

export default PongGameFinished;
