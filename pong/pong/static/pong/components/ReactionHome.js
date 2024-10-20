import { Component } from "../core/component.js";
import { Header } from "./Header.js";

export class Reaction extends Component {
  constructor(router, parameters, state) {
    super(router, parameters, state);
    this.state = {
      reactionSocket: null,
    };
  }

  afterPageLoaded = () => {
    this.headerComponent = new Header(this.router, this.params, this.state);
    this.element.parentElement.prepend(this.headerComponent.element);
    this.headerComponent.afterPageLoaded();

    this.settingsArea = this.element.querySelector("#settings-area");
    this.buttonCountInput = this.element.querySelector("#button-count");
    this.roomIdInput = this.element.querySelector("#room-id-input");
    this.connectButton = this.element.querySelector("#connect-button");
    this.waitingArea = this.element.querySelector("#waiting-area");
    this.gameButtons = this.element.querySelector("#game-buttons");
    this.resultArea = this.element.querySelector("#result-area");
    this.resultMessage = this.element.querySelector("#result-message");
    this.exitButtons = this.element.querySelectorAll(".exit-button");

    this.connectButton.addEventListener("click", () => {
      const roomId = this.roomIdInput.value.trim();
      if (roomId) {
        this.connectWebSocket(roomId);
        this.roomIdInput.disabled = true;
        this.buttonCountInput.disabled = true;
        this.connectButton.disabled = true;
        this.settingsArea.style.display = "none";
        this.waitingArea.style.display = "block";
      }
    });

    this.exitButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.handleExit();
      });
    });
  };

  handleExit = () => {
    if (this.state.reactionSocket) {
      this.state.reactionSocket.close();
      this.state.reactionSocket = null;
    }

    this.roomIdInput.disabled = false;
    this.buttonCountInput.disabled = false;
    this.connectButton.disabled = false;
    this.roomIdInput.value = "";

    this.waitingArea.style.display = "none";
    this.gameButtons.style.display = "none";
    this.resultArea.style.display = "none";
    this.settingsArea.style.display = "block";

    if (this.reactionButtons) {
      this.reactionButtons.forEach((button) => button.remove());
      this.reactionButtons = [];
    }
    this.resultMessage.textContent = "";
  };

  beforePageUnload = () => {
    if (this.state.reactionSocket) {
      this.state.reactionSocket.close();
      this.state.reactionSocket = null;
    }
    this.element.parentElement.removeChild(this.headerComponent.element);
  };

  connectWebSocket = (roomId) => {
    if (this.state.reactionSocket) {
      return;
    }

    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${wsProtocol}://${window.location.host}/ws/reaction/${roomId}/`;
    const socket = new WebSocket(wsUrl);

    socket.addEventListener("open", () => {
      console.log("WebSocket connected to rooms URL:", wsUrl);
      this.state.reactionSocket = socket;
      const buttonCount = parseInt(this.buttonCountInput.value, 10) || 1;
      socket.send(
        JSON.stringify({
          type: "set_button_count",
          button_count: buttonCount,
        }),
      );
    });

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      console.log("message", message);

      const messageType = message.type;

      if (messageType === "start_game") {
        const buttonCount = message.button_count || 1;
        this.waitingArea.style.display = "none";
        this.gameButtons.style.display = "block";
        this.reactionButtons = [];

        this.gameButtons
          .querySelectorAll(".reaction-button")
          .forEach((button) => button.remove());

        const exitButton = this.gameButtons.querySelector(".exit-button");

        for (let i = 0; i < buttonCount; i++) {
          const button = document.createElement("button");
          button.textContent = "色が変わるのを待ってください";
          button.classList.add("reaction-button");
          button.disabled = true;
          button.addEventListener("click", () => {
            if (button.disabled) return;
            if (this.state.reactionSocket) {
              this.state.reactionSocket.send(
                JSON.stringify({
                  type: "click",
                  button_index: i,
                }),
              );
              button.disabled = true;
            }
          });
          if (exitButton) {
            this.gameButtons.insertBefore(button, exitButton);
          } else {
            this.gameButtons.appendChild(button);
          }
          this.reactionButtons.push(button);
        }
      } else if (messageType === "change_color") {
        const buttonIndex = message.button_index;
        this.reactionButtons.forEach((button) => {
          button.disabled = true;
          button.style.backgroundColor = "";
        });
        const button = this.reactionButtons[buttonIndex];
        if (button) {
          button.style.backgroundColor = "green";
          button.disabled = false;
        }
      } else if (messageType === "game_result") {
        const result = message.result;
        if (result === "win") {
          this.resultMessage.textContent = "あなたの勝ちです！";
        } else {
          this.resultMessage.textContent = "あなたの負けです。";
        }
        this.gameButtons.style.display = "none";
        this.resultArea.style.display = "block";

        if (this.state.reactionSocket) {
          this.state.reactionSocket.close();
          this.state.reactionSocket = null;
        }
      } else if (messageType === "player_left") {
        alert("相手のプレイヤーがゲームから離れました。");
        this.handleExit();
      }
    });

    socket.addEventListener("close", () => {
      console.log("WebSocket closed");
      this.state.reactionSocket = null;

      this.waitingArea.style.display = "none";
      this.gameButtons.style.display = "none";
      this.resultArea.style.display = "none";
      this.settingsArea.style.display = "block";

      this.roomIdInput.disabled = false;
      this.buttonCountInput.disabled = false;
      this.connectButton.disabled = false;
      this.roomIdInput.value = "";

      if (this.reactionButtons) {
        this.reactionButtons.forEach((button) => button.remove());
        this.reactionButtons = [];
      }
      this.resultMessage.textContent = "";
    });
  };

  get html() {
    return `
      <main class="text-center p-5">
        <div class="container">
          <h1>リアクションゲーム</h1>
          <div id="game-area">
            <div id="settings-area">
              <label for="button-count">ボタンの数:</label>
              <select id="button-count">
                <option value="1">デフォルト</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
              </select>
              <input type="text" id="room-id-input" placeholder="ルームIDを入力" />
              <button id="connect-button">接続</button>
            </div>
            <div id="waiting-area" style="display: none;">
              他のプレイヤーを待っています...
              <button class="exit-button">退出</button>
            </div>
            <div id="game-buttons" style="display: none;">
              <button class="exit-button">退出</button>
            </div>
            <div id="result-area" style="display: none;">
              <p id="result-message"></p>
              <button class="exit-button">退出</button>
            </div>
          </div>
        </div>
      </main>
    `;
  }
}

export default Reaction;

