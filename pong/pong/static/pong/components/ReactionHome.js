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

    this.roomIdInput = this.element.querySelector("#room-id-input");
    this.connectButton = this.element.querySelector("#connect-button");
    this.waitingArea = this.element.querySelector("#waiting-area");
    this.gameButtons = this.element.querySelector("#game-buttons");
    this.reactionButton = this.element.querySelector("#reaction-button");
    this.resultArea = this.element.querySelector("#result-area");
    this.resultMessage = this.element.querySelector("#result-message");

    this.connectButton.addEventListener("click", () => {
      const roomId = this.roomIdInput.value.trim();
      if (roomId) {
        this.connectWebSocket(roomId);
        this.roomIdInput.disabled = true;
        this.connectButton.disabled = true;
        this.waitingArea.style.display = "block";
      }
    });

    this.reactionButton.addEventListener("click", () => {
      if (this.reactionButton.disabled) return;
      if (this.state.reactionSocket) {
        this.state.reactionSocket.send(
          JSON.stringify({
            type: "click",
          }),
        );
        this.reactionButton.disabled = true;
      }
    });
  };

  beforePageUnload = () => {};

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
    });

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      console.log("message", message);

      const messageType = message.type;

      if (messageType === "player_joined") {
      } else if (messageType === "start_game") {
        this.waitingArea.style.display = "none";
        this.gameButtons.style.display = "block";
        this.reactionButton.disabled = true;
      } else if (messageType === "change_color") {
        this.reactionButton.style.backgroundColor = "green";
        this.reactionButton.disabled = false;
      } else if (messageType === "game_result") {
        const result = message.result;
        if (result === "win") {
          this.resultMessage.textContent = "You Win!";
        } else {
          this.resultMessage.textContent = "You Lose!";
        }
        this.gameButtons.style.display = "none";
        this.resultArea.style.display = "block";

        if (this.state.reactionSocket) {
          this.state.reactionSocket.close();
          this.state.reactionSocket = null;
        }

        this.roomIdInput.disabled = false;
        this.connectButton.disabled = false;
        this.resultArea.style.display = "none";
        this.connectionArea.style.display = "block";
      }
    });

    socket.addEventListener("close", () => {
      console.log("WebSocket closed");
      this.state.reactionSocket = null;
    });
  };

  get html() {
    return `
      <main class="text-center p-5">
        <div class="container">
          <h1>Reaction Game</h1>
          <div id="game-area">
            <div id="connection-area">
              <input type="text" id="room-id-input" placeholder="Enter Room ID" />
              <button id="connect-button">Connect</button>
            </div>
            <div id="waiting-area" style="display: none;">
              Waiting for another player to join...
            </div>
            <div id="game-buttons" style="display: none;">
              <button id="reaction-button">Wait for color change</button>
            </div>
            <div id="result-area" style="display: none;">
              <p id="result-message"></p>
            </div>
          </div>
        </div>
      </main>
    `;
  }
}

export default Reaction;
