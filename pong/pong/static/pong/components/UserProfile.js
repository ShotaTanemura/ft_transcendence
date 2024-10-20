import { Component } from "../core/component.js";
import { Header } from "./Header.js";
import { getUsersDataFromName } from "../api/api.js";
import { GameStats } from "./GameStats.js";

export class UserProfile extends Component {
  constructor(router, params, state) {
    super(router, params, state);
    this.parameters = params;
    if (this.parameters.user_name) {
      this.loadUserProfile(this.parameters.user_name);
      this.loadUserGameResults(this.parameters.user_name);
    }
  }

  afterPageLoaded() {
    this.headerComponent = new Header(this.router, this.params, this.state);
    this.element.parentElement.prepend(this.headerComponent.element);
    this.headerComponent.afterPageLoaded();

    const backButton = this.findElement("#back-button");
    if (backButton) {
      backButton.addEventListener("click", () => {
        this.router.goBackPage();
      });
    }
  }

  beforePageUnload() {
    this.element.parentElement.removeChild(this.headerComponent.element);
  }

  async loadUserProfile(userName) {
    try {
      const users = await getUsersDataFromName(userName);
      if (!users) {
        throw new Error("User not found");
      }
      if (users[0]) {
        this.updateProfileUI(users[0]);
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
      window.alert("Failed to load user profile");
      this.router.goNextPage("/");
    }
  }

  async loadUserGameResults(userName) {
    const pongGameResults = await GameStats.getMatchResultsData(`/ponggame/api/v1/match-result/`,userName);
    const typingGameResults = await GameStats.getMatchResultsData(`/typinggame/api/v1/match-result/`,userName);

    this.createGameMatchResultTable(pongGameResults, "PongGame",userName);
    this.createGameMatchResultTable(typingGameResults, "TypingGame",userName);
  }

  createGameMatchResultTable = (matchResultData, gameType, userName) => {
    if (!matchResultData) {
      return;
    }

    const tableElement = Object.assign(document.createElement("table"), {
      className: "table",
    });
    const theadElement = document.createElement("thead");
    const tbodyElement = document.createElement("tbody");

    theadElement.innerHTML = `<tr>
      <th scope="col">Win or Loss</th>
      <th scope="col">Opponent</th>
    </tr>`;

    matchResultData.forEach((matchResult) => {
      const trElement = document.createElement("tr");
      let winOrLoss;
      let opponent;

      if (gameType === "PongGame") {
        const winner =
          matchResult.contents.player1_score > matchResult.contents.player2_score
            ? matchResult.contents.player1
            : matchResult.contents.player2;
        winOrLoss = winner === userName ? "Win" : "Loss";
      } else if (gameType === "TypingGame") {
        winOrLoss =
          matchResult.contents.winner === userName ? "Win" : "Loss";
      }
      opponent =
        matchResult.contents.player1 === userName
          ? matchResult.contents.player2
          : matchResult.contents.player1;

      trElement.innerHTML = `
        <td>${winOrLoss}</td>
        <td>${opponent}</td>
      `;
      tbodyElement.appendChild(trElement);
    });

    tableElement.appendChild(theadElement);
    tableElement.appendChild(tbodyElement);

    const tableContainer =
      gameType === "PongGame"
        ? this.findElement("div.ponggame-result-table")
        : this.findElement("div.typinggame-result-table");

    tableContainer.appendChild(tableElement);
  };

  updateProfileUI(user) {
    this.findElement("#username").textContent = user.name;
    this.findElement("#user-icon").src = user.icon;
  }

  get html() {
    return `
    
        <div class="profile-card">
            <h1>プロフィールページ</h1>
            <img id="user-icon">
            <p>Username: <span id="username"></span></p>
            <br>
            <h3>Last 10 Game Match Results</h3>
            <div class="ponggame-result-table">
            <strong>PongGame</strong>
            </div>
            <div class="typinggame-result-table">
              <strong>TypingGame</strong>
            </div>
            <br>
            <button id="back-button">元のページに戻る</button>
        </div>
        `;
  }
}