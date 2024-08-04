import {Component} from "../core/component.js"
import { Load } from "./Load.js";

export class PongGameRoom extends Component {
	constructor(router, parameters, state) {
		new Load(router, parameters, state).onload()
		super(router, parameters, state);	
		this.findElement("button.ready").onclick = this.onClick
		this.connection = this.getRouteContext("WebSocket");
	}

	onClick = () => {
		this.connection.send(JSON.stringify({"sender": "user", "type": "ready"}));
	}

	get html() {
		return (`
			<h1>game room</h1>
			<h1>Room member</h1>
			<h2>${(this.getRouteContext("participants"))[0]}</h2>
			<h2>${(this.getRouteContext("participants"))[1]}</h2>
			<label>Are you ready?</label>
			<button class="ready">I'm ready.</button>
		`);
	}
}

export default PongGameRoom;

