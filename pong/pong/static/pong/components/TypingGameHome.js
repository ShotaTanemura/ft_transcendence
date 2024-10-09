import { Component } from "../core/component.js";
import { Header } from "./Header.js";

export class TypingGameHome extends Component {
  constructor(router, parameters, state) {
    super(router, parameters, state);
    this.findElement("form.entering-room-form").onsubmit = this.submitForm;
  }

  onWebSocketOpen = () => {
    // this.setRouteContext("TypingGameWebSocket", this.connection);
    this.goNextPage("/typing-game-waiting");
  };

  onWebSocketClose = () => {
    // this.unsetRouteContext("TypingGameWebSocket");
    console.log("WebSocket closed");
  };

  onMessage = (event) => {
    const message = JSON.parse(event.data);
    switch (message.type) {
      case "waiting-for-other-participants":
        this.goNextPage("/typing-game-waiting");
        break;
      case "all-participants-connected":
        this.setRouteContext("participants", message.contents);
        this.goNextPage("/typing-game");
        break;
      // case "all-participants-ready":
      //   this.goNextPage("/typing-game");
      //   break;
    }
  };

  submitForm = (event) => {
    event.preventDefault();
    this.setRouteContext("roomID", event.target.elements["room-id"].value);
    // config/asgiで設定しているpathを指定
    const socketPath =
      "ws://" +
      window.location.hostname +
      ":" +
      window.location.port +
      "/realtime-typing/" +
      event.target.elements["room-id"].value +
      "/";
    const connection = new WebSocket(socketPath);
    this.setRouteContext("TypingGameWebSocket", connection);
    connection.onopen = this.onWebSocketOpen;
    connection.onclose = this.onWebSocketClose;
    connection.onmessage = this.onMessage;
  };

  afterPageLoaded() {
    this.headerComponent = new Header(this.router, this.params, this.state);
    this.element.parentElement.prepend(this.headerComponent.element);
    this.headerComponent.afterPageLoaded();
  }

  beforePageUnload() {
    this.element.parentElement.removeChild(this.headerComponent.element);
  }

  get html() {
    return `
    <main class="typing-game-home">
				<h1>Welcome To Realtime Typing Game !</h1>
				<form class="entering-room-form">
					<label for="room-id">Room ID</label>
					<input id="room-id" type="number" min="1000" max="9999" required><br>
					<input id="enter-room-submit" name="enter-room" type="submit" value="enter room">
				</form>
    </main>
			`;
  }
}

export default TypingGameHome;
