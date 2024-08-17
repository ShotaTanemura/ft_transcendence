import { Component } from "../core/component.js";
import { PongGameTournamentBracket } from "./PongGameTournamentBracket.js";

export class PongGameTournament extends Component {
  constructor(route, parameters, state) {
    super(route, parameters, state);
    this.bracket = new PongGameTournamentBracket(
      route,
      parameters,
      state,
      this.getRouteContext("Tournament"),
    );
    this.element.appendChild(this.bracket.element);
  }

  get html() {
    return `
        <h1>Pong-Game Tournament</h1>
    `;
  }
}

export default PongGameTournament;
