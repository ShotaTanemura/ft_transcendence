import { Component } from "../core/component.js";
import { Load } from "./Load.js";

export class PongGameHome extends Component {
  constructor(router, parameters, state) {
    new Load(router, parameters, state).onload();
    super(router, parameters, state);
    this.findElement("form.entering-room-form").onsubmit = this.submitForm;
  }

  onWebSocketOpen = () => {
    this.goNextPage("/pong-game-waiting");
  };

  onWebSocketClose = () => {
    this.goNextPage("/pong-game-home");
  };

  onMessage = (event) => {
    const message = JSON.parse(event.data);
    switch (message.type) {
      case "waiting-for-other-participants":
        this.goNextPage("/pong-game-waiting");
        break;
      case "all-participants-connected":
        this.setRouteContext("participants", message.contents);
        this.goNextPage("/pong-game-room");
        break;
      case "all-participants-ready":
        this.goNextPage("/pong-game");
        break;
    }
  };

  submitForm = (event) => {
    event.preventDefault();
    this.setRouteContext("roomID", event.target.elements["room-id"].value);
    const socketPath =
      "ws://" +
      window.location.hostname +
      ":" +
      window.location.port +
      "/realtime-pong/" +
      event.target.elements["room-id"].value +
      "/";
    const connection = new WebSocket(socketPath);
    this.setRouteContext("WebSocket", connection);
    connection.onopen = this.onWebSocketOpen;
    connection.onclose = this.onWebSocketClose;
    connection.onmessage = this.onMessage;
  };

  get html() {
    return `
			<h1>Welcome To Realtime Pong !</h1>
			<form class="entering-room-form">
				<label for="room-id">Room ID</label>
				<input id="room-id" type="number" min="1000" max="9999" required><br>
				<input id="enter-room-submit" name="enter-room" type="submit" value="enter room">
			</form>

		`;
  }
}

export default PongGameHome;
