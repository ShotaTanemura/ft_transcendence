import { Component } from "../core/component.js";
import { Header } from "./Header.js";

export class PongGameHome extends Component {
  constructor(router, parameters, state) {
    super(router, parameters, state);
    this.findElement("form.entering-room-form").onsubmit = this.submitForm;
  }

  afterPageLoaded = () => {
    this.headerComponent = new Header(this.router, this.params, this.state);
    this.element.parentElement.prepend(this.headerComponent.element);
    this.headerComponent.afterPageLoaded();
  };

  beforePageUnload = () => {
    this.element.parentElement.removeChild(this.headerComponent.element);
  };

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
        this.setRouteContext("Tournament", message.contents);
        break;
      case "tournament-winner":
        this.setRouteContext("TournamentWinner", message.contents);
        break;
      case "error-message":
        alert(message.contents);
        this.goNextPage("/error");
        break;
    }
  };

  submitForm = (event) => {
    event.preventDefault();
    this.setRouteContext("RoomID", event.target.elements["room-id"].value);
    const socketPath = `wss://${window.location.hostname}:${window.location.port}/realtime-pong/${event.target.elements["room-id"].value}/${event.submitter.name}/${event.target.elements["user-nickname"].value}/`;

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
      <main class="text-center p-5">
			  <h1>Welcome To Realtime Pong !</h1>
			  <form class="entering-room-form">
          <div class="form-group p-3">
			  	  <label for="room-id">Room ID</label>
			  	  <input id="room-id" type="number" min="1000" max="9999" required><br>
            <small id="room-id-help">Room ID must be between 1000 and 9999</small><br><br>
				    <label for="user-nickname">Nickname</label>
            <input id="user-nickname" type="text" placeholder="nickname" maxlength=20 required><br>
          </div>
			  	<input id="enter-room-as-host-submit" name="host" class="btn btn-primary" type="submit" value="enter room as host">
			  	<input id="enter-room-as-guest-submit" name="guest" class="btn btn-primary" type="submit" value="enter room as guest">
			  </form>
      </main>
		`;
  }
}

export default PongGameHome;
