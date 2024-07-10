import {Component} from "../core/component.js"
import { Load } from "./Load.js";

export class GameHome extends Component {
	constructor(router, parameters, state) {
		new Load(router, parameters, state).onload()
		super(router, parameters, state);
		this.findElement("form.entering-room-form").onsubmit = this.submitForm;
		
	}

	onWebSocketOpen = (event) => {
		console.log("open!");
		this.goNextPage("/game-waiting");
	}

	onWebSocketClose = (event) => {
		console.log("close!");
	}

	onMessage = (event) => {
		console.log(event);
	}

	submitForm = (e) => {
		e.preventDefault();
		this.setRouteContext("roomID", e.target.elements["room-id"].value);
		const socketPath = "ws://" + window.location.hostname + ":" + window.location.port + "/realtime-pong/" + e.target.elements["room-id"].value + "/";
		const connection = new WebSocket(socketPath);
		this.setRouteContext("WebSocket", connection);
		connection.onopen = this.onWebSocketOpen;
		connection.onclose = this.onWebSocketClose;
		connection.onmessage = this.onMessage;
	}

	get html() {
		return (`
			<h1>Welcome To Realtime Pong !</h1>
			<form class="entering-room-form">
				<label for="room-id">Room ID</label>
				<input id="room-id" type="number" min="1000" max="9999" required><br>
				<input id="enter-room-submit" name="enter-room" type="submit" value="enter room">
			</form>
			
		`);
	}
}

export default GameHome;
