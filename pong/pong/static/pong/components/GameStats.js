import { Component } from "../core/component.js";
import { Header } from "./Header.js";
import { getUuid, getUserFromUuid } from "../api/api.js";

export class GameStats extends Component {
  constructor(router, parameters, state) {
    super(router, parameters, state);
    this.findElement("button.go-back-to-pong-game-home-button").onclick =
      this.backToGameHome;
  }

  afterPageLoaded = async () => {
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
  getUserName = async () => {
    try {
      const userUuid = await getUuid();
      if (!userUuid) {
        throw new Error("getUserName: Failed to get user uuid.");
      }
      const userInfo = await getUserFromUuid(userUuid);
      const userName = userInfo.name;
      if (!userInfo || !userName) {
        throw new Error("getUserName: Failed to get user or user name");
      }
      return userName;
    } catch (error) {
      console.error("Error verifying token:", error);
      return null;
    }
  };

  getMatchResultsData = async () => {
    const userName = await this.getUserName();
    if (!userName) {
      return;
    }

    try {
      const response = await fetch(
        `/ponggame/api/v1/match-result/${userName}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );
      const matchResultsData = await response.json();
      if (!response.ok) {
        throw new Error(
          matchResultsData.message || "Failed to fetch user data",
        );
      }
      if (!matchResultsData["match-results"]) {
        throw new Error("Failed to fetch match results");
      }
      return matchResultsData["match-results"];
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
    matchResultsData.forEach((matchResult) => {
      const trElement = document.createElement("tr");
      trElement.innerHTML = `<tr>
            <th scope="row">${Number(matchResult.id)}</th>
            <td>${matchResult.contents.player1}</td>
            <td>${matchResult.contents.player1_score}</td>
            <td>${matchResult.contents.player2_score}</td>
            <td>${matchResult.contents.player2}</td>
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

export default GameStats;
