import { Component } from "../core/component.js";
import { Load } from "./Load.js";
import { Header } from "./Header.js";

export class PongGameResult extends Component {
  constructor(router, parameters, state) {
    super(router, parameters, state);
    this.findElement("button.go-back-to-pong-game-home-button").onclick =
      this.backToGameHome;
  }

  afterPageLoaded = async () => {
    new Load(this.router, this.parameters, this.state).onload();
    this.headerComponent = new Header(this.router, this.params, this.state);
    this.element.parentElement.prepend(this.headerComponent.element);
    this.headerComponent.afterPageLoaded();
    this.craeteTableFromMatchResult(await this.getMatchResultsData());
  };

  beforePageUnload = () => {
    this.element.parentElement.removeChild(this.headerComponent.element);
  };

  backToGameHome = () => {
    this.goNextPage("/pong-game-home");
  };

  //TODO this fucntion is duplicate
  getUuid = async () => {
    try {
      const response = await fetch("/pong/api/v1/auth/token/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to verify token");
      }
      return data.uuid;
    } catch (error) {
      console.error("Error verifying token:", error);
      return null;
    }
  };

  getMatchResultsData = async () => {
    const uuid = await this.getUuid();
    if (!uuid) {
      return;
    }

    try {
      const response = await fetch(`/ponggame/api/v1/match-result/${uuid}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const matchResultsData = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user data");
      }
      return matchResultsData;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  craeteTableFromMatchResult = (matchResultsData) => {
    const tableElement = Object.assign(document.createElement("table"), {
      className: "table",
    });
    const theadElement = document.createElement("thead");
    const tbodyElement = document.createElement("tbody");
    theadElement.innerHTML = `<tr>
        <th scope="col">#</th>
        <th scope="col">Player</th>
        <th scope="col">Score</th>
        <th scope="col">Score</th>
        <th scope="col">Player</th>
        </tr>`;

    tableElement.appendChild(theadElement);
    Object.entries(matchResultsData).forEach(([key, result]) => {
      const trElement = document.createElement("tr");
      trElement.innerHTML = `<tr>
            <th scope="row">${Number(key) + 1}</th>
            <td>${result.player1}</td>
            <td>${result.player1_score}</td>
            <td>${result.player2_score}</td>
            <td>${result.player2}</td>
            </tr>`;
      tbodyElement.appendChild(trElement);
    });
    tableElement.appendChild(tbodyElement);
    this.findElement("div.match-result-table").appendChild(tableElement);
  };

  get html() {
    return `
      <main class="p-5 text-center">
        <h1 class="match-result-title">Pong Game Last 10 Match Results</h1>
        <br>
        <div class="match-result-table">
        </div>
        <button class="go-back-to-pong-game-home-button btn btn-primary">Back</button>
      </main>
		`;
  }
}

export default PongGameResult;
