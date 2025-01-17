import { Component } from "../core/component.js";
import { Header } from "./Header.js";
import { getUuid, getUserFromUuid } from "../api/api.js";
import { GameStats } from "./GameStats.js";

export class Profile extends Component {
  constructor(router, params, state) {
    super(router, params, state);
    this.loadUserProfile();
    this.loadUserGameResults();
    this.findElement("button.edit-profile-button").onclick = this.goEditProfile;
    this.findElement("button.edit-2fa-button").onclick = this.goEdit2FA;
    this.TYPINGGAME = "TypingGame";
    this.PONGGAME = "PongGame";
    this.REACTIONGAME = "ReactionGame"; // New constant for ReactionGame
  }

  afterPageLoaded() {
    this.headerComponent = new Header(this.router, this.params, this.state);
    this.element.parentElement.prepend(this.headerComponent.element);
    this.headerComponent.afterPageLoaded();
  }

  beforePageUnload() {
    this.element.parentElement.removeChild(this.headerComponent.element);
  }

  async loadUserProfile() {
    try {
      const uuid = await getUuid();
      if (!uuid) {
        throw new Error("UUID not found");
      }
      this.user = await getUserFromUuid(uuid);
      if (!this.user) {
        throw new Error("User not found");
      }
      this.updateProfileUI();
    } catch (error) {
      console.error("Failed to load user profile:", error);
      window.alert("Failed to load user profile");
      this.router.goNextPage("/");
    }
  }

  async loadUserGameResults() {
    const pongGameResults = await GameStats.getMatchResultsData(
      "/ponggame/api/v1/match-result/",
    );
    const typingGameResults = await GameStats.getMatchResultsData(
      "/typinggame/api/v1/match-result/",
    );
    const reactionGameResults = await GameStats.getMatchResultsData(
      "/reactiongame/api/v1/match-result/",
    );

    this.createGameMatchResultTable(pongGameResults, this.PONGGAME);
    this.createGameMatchResultTable(typingGameResults, this.TYPINGGAME);
    this.createGameMatchResultTable(reactionGameResults, this.REACTIONGAME);
  }

  createGameMatchResultTable = (matchResultData, gameType) => {
    if (!matchResultData) {
      return;
    }

    const tableElement = Object.assign(document.createElement("table"), {
      className: "table",
    });
    const theadElement = document.createElement("thead");
    const tbodyElement = document.createElement("tbody");

    theadElement.innerHTML = `<tr>
      <th scope="col">Win or Lose</th>
      <th scope="col">Opponent</th>
    </tr>`;

    matchResultData.forEach((matchResult) => {
      const trElement = document.createElement("tr");
      let winOrLose;
      let opponent;

      if (gameType === this.PONGGAME) {
        const winner =
          matchResult.contents.player1_score >
          matchResult.contents.player2_score
            ? matchResult.contents.player1
            : matchResult.contents.player2;
        winOrLose = winner === this.user.name ? "Win" : "Lose";
      } else if (
        gameType === this.TYPINGGAME ||
        gameType === this.REACTIONGAME
      ) {
        winOrLose =
          matchResult.contents.winner === this.user.name ? "Win" : "Lose";
      }
      opponent =
        matchResult.contents.player1 === this.user.name
          ? matchResult.contents.player2
          : matchResult.contents.player1;

      trElement.innerHTML = `
        <td>${winOrLose}</td>
        <td>${opponent}</td>
      `;
      tbodyElement.appendChild(trElement);
    });

    tableElement.appendChild(theadElement);
    tableElement.appendChild(tbodyElement);

    const tableContainer =
      gameType === "PongGame"
        ? this.findElement("div.ponggame-result-table")
        : gameType === "TypingGame"
          ? this.findElement("div.typinggame-result-table")
          : this.findElement("div.reactiongame-result-table"); // Add ReactionGame results

    tableContainer.appendChild(tableElement);
  };

  updateProfileUI() {
    this.findElement("#username").textContent = this.user.name;
    this.findElement("#email").textContent = this.user.email;
    this.findElement("#user-icon").src = this.user.icon;
  }

  goEditProfile = () => {
    this.router.goNextPage("/edit-profile");
  };

  goEdit2FA = () => {
    this.router.goNextPage("/edit-2fa");
  };

  get html() {
    return `
      <div class="profile-card">
        <h1>プロフィールページ</h1>
        <img id="user-icon" height="256" width="256">
        <br>
        <br>
        <p>Username: <span id="username"></span></p>
        <p>E-mail: <span id="email"></span></p>
        <br>
        <h3>Last 10 Game Match Results</h3>
        <div class="ponggame-result-table">
            <strong>PongGame</strong>
        </div>
        <div class="typinggame-result-table">
            <strong>TypingGame</strong>
        </div>
        <div class="reactiongame-result-table">
            <strong>ReactionGame</strong>
        </div>
        <button class="edit-profile-button">プロフィールを変更する</button>
        <br>
        <br>
        <button class="edit-2fa-button">二要素認証の設定を変更する</button>
      </div>
    `;
  }
}
