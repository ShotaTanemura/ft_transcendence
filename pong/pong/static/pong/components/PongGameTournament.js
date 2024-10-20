import { Component } from "../core/component.js";
import { PongGameTournamentBracket } from "./PongGameTournamentBracket.js";

export class PongGameTournament extends Component {
  constructor(route, parameters, state) {
    super(route, parameters, state);
  }

  afterPageLoaded() {
    if (!this.getRouteContext("PongGameWebSocket")) {
      alert("connection failed.");
      this.goNextPage("/");
    }
    this.connection = this.getRouteContext("PongGameWebSocket");
    const tournamentContext = this.getRouteContext("Tournament");
    this.bracket = new PongGameTournamentBracket(
      this.route,
      this.parameters,
      this.state,
      tournamentContext,
    );
    this.element.appendChild(this.bracket.element);
    this.unsetRouteContext("Tournament");
    this.timeoutButton = document.getElementById("timeoutButton");
    if (this.timeoutButton) {
      this.timeoutButton.onclick = this.onClickTimeoutButton;
    }
  }

  onClickTimeoutButton = async () => {
    this.connection.send(
      JSON.stringify({
        sender: "player",
        type: "timeout",
        contents: "timeout",
      }),
    );
  };

  get html() {
    return `
      <main class="text-center" p-5>
        <h1>Pong-Game Tournament</h1>
        <button id="timeoutButton" class="btn btn-primary">TimeOut</button> 
        <h2 id="timeoutMessage"></h2>
      </main>
    `;
  }
}

export default PongGameTournament;
