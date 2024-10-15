import { Component } from "../core/component.js";
import { Header } from "./Header.js";
import { getUuid, getUserFromUuid } from "../api/api.js";

export class GameStats extends Component {
  constructor(router, parameters, state) {
    super(router, parameters, state);
    this.findElement("button.go-back-to-home-button").onclick = this.backToHome;
  }

  afterPageLoaded = async () => {
    this.headerComponent = new Header(this.router, this.params, this.state);
    this.element.parentElement.prepend(this.headerComponent.element);
    this.headerComponent.afterPageLoaded();
    this.createTableFromMatchResult(await this.getMatchResultsData("/ponggame/api/v1/match-result/"));
    this.createTableFromMatchResult(await this.getMatchResultsData("/typinggame/api/v1/match-result/"), true);
  };

  beforePageUnload = () => {
    this.element.parentElement.removeChild(this.headerComponent.element);
    const tableElement = this.findElements("div.match-result-table");
    if (tableElement.firstChild) {
      tableElement.removeChild(tableElement.firstChild);
    }
  };

  backToHome = () => {
    this.goNextPage("/");
  };

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

  getMatchResultsData = async (apiEndpoint) => {
    const userName = await this.getUserName();
    if (!userName) {
      return;
    }

    try {
      const response = await fetch(`${apiEndpoint}${userName}`,
        {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        },
      );
      const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const matchResultsData = await response.json();
      if (!response.ok) {
        throw new Error(
          matchResultsData.message || "Failed to fetch user data:"
        );
      }
      if (!matchResultsData["match-results"]) {
        throw new Error("Failed to fetch match results");
      }
      return matchResultsData["match-results"];
    } else {
      const responseText = await response.text();
      console.error("Received non-JSON response:", responseText);
      throw new Error("Failed to fetch match results: Non-JSON response");
    }
  } catch (error) {
    console.error("Error :", error);
    return null;
  }
  };

  createTableFromMatchResult = (matchResultsData, isTypingGame = false) => {
    if (!matchResultsData) {
      return;
    }
  
    const tableElement = Object.assign(document.createElement("table"), {
      className: "table",
    });
    const theadElement = document.createElement("thead");
    const tbodyElement = document.createElement("tbody");
  
    if (isTypingGame) {
      // TypingGameの場合
      theadElement.innerHTML = `<tr>
          <th scope="col">#</th>
          <th scope="col">Winner</th>
          <th scope="col">Player</th>
          <th scope="col">Player</th>
          </tr>`;
  
      matchResultsData.forEach((matchResult) => {
        const trElement = document.createElement("tr");
        trElement.innerHTML = `
              <th scope="row">${Number(matchResult.id)}</th>
              <td>${matchResult.contents.player1}</td>
              <td>${matchResult.contents.player2}</td>
              <td>${matchResult.contents.winner}</td>`;
        tbodyElement.appendChild(trElement);
      });
    } else {
      // PongGameの場合
      theadElement.innerHTML = `<tr>
          <th scope="col">#</th>
          <th scope="col">date</th>
          <th scope="col">Player</th>
          <th scope="col">Score</th>
          <th scope="col">Score</th>
          <th scope="col">Player</th>
          </tr>`;
  
      matchResultsData.forEach((matchResult) => {
        const trElement = document.createElement("tr");
        trElement.innerHTML = `
              <th scope="row">${Number(matchResult.id)}</th>
              <td>${matchResult.contents.date}</td>
              <td>${matchResult.contents.player1}</td>
              <td>${matchResult.contents.player1_score}</td>
              <td>${matchResult.contents.player2_score}</td>
              <td>${matchResult.contents.player2}</td>`;
        tbodyElement.appendChild(trElement);
      });
    }
  
    tableElement.appendChild(theadElement);
    tableElement.appendChild(tbodyElement);
  
    const tableContainer = isTypingGame
      ? this.findElement("div.typinggame-result-table")
      : this.findElement("div.ponggame-result-table");
    
    tableContainer.appendChild(tableElement);
  };
  
  get html() {
    return `
      <main class="p-5 text-center">
        <h1 class="match-result-title">Last 10 Match Results</h1>
        <br>
        <div class="ponggame-result-table">
          <h2>PongGame Results</h2>
        </div>
        <div class="typinggame-result-table">
          <h2>TypingGame Results</h2>
        </div>
        <button class="go-back-to-home-button btn btn-primary">Back</button>
      </main>
		`;
  }
}

export default GameStats;
