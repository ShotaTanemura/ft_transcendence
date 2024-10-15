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
    const tournamentContext = this.getRouteContext("Tournament");
    this.bracket = new PongGameTournamentBracket(
      this.route,
      this.parameters,
      this.state,
      tournamentContext,
    );
    this.element.appendChild(this.bracket.element);
    this.unsetRouteContext("Tournament");
  }

  get html() {
    return `
      <main class="text-center p-5>
        <h1>Pong-Game Tournament</h1>
      </main>
    `;
  }
}

export default PongGameTournament;
