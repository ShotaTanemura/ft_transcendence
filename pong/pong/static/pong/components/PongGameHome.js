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
    this.connection.send(
      JSON.stringify({ sender: "user", type: "get-room-state" }),
    );
  };

  onWebSocketClose = () => {
    console.log("closed");
  };

  onMessage = (event) => {
    const message = JSON.parse(event.data);
    switch (message.type) {
      case "room-state":
        this.changePageByRoomStatus(message);
        break;
      case "tournament":
        this.setRouteContext("tournament", message.contents);
        break;
      case "tournament-winner":
        this.setRouteContext("tournament-winner", message.contents);
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
    this.connection = new WebSocket(socketPath);
    this.setRouteContext("WebSocket", this.connection);
    this.connection.onopen = this.onWebSocketOpen;
    this.connection.onclose = this.onWebSocketClose;
    this.connection.onmessage = this.onMessage;
  };

  changePageByRoomStatus = (message) => {
    if (message.type != "room-state")
      throw new Error("changePageByRoomStatus: invalid message type");
    switch (message.contents) {
      case "Not_All_Participants_Connected":
        this.goNextPage("/pong-game-waiting");
        break;
      case "Waiting_For_Participants_To_Approve_Room":
        this.goNextPage("/pong-game-room");
        break;
      case "Display_Tournament":
        this.goNextPage("/pong-game-tournament");
        break;
      case "In_Game":
        this.goNextPage("/pong-game");
        break;
      case "Finished":
        this.goNextPage("/pong-game-finished");
        break;
      default:
        throw Error("changePageByRoomStatus: doesn't match any room states.");
    }
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
