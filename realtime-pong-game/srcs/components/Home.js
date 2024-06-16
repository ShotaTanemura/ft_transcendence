import {Component} from "../core/component.js"

export class Home extends Component {
	constructor(router, parameters, state) {
		super(router, parameters, state);
		this.findElement("form.entering-room-form").onsubmit = this.submitForm;
		
	}

	submitForm = (e) => {
		e.preventDefault();
		console.log(e.submitter.name)
		if (e.submitter.name === "create-room")
			this.router.setContext("isHost", true);
		else
			this.router.setContext("isHost", false);
		this.router.setContext("displayName", e.target.elements["display-name"].value);
		this.router.setContext("roomID", e.target.elements["room-id"].value);
		this.router.goNextPage("/room");
	}

	get html() {
		return (`
			<h1>Welcome To Realtime Pong !</h1>
			<form class="entering-room-form">
				<label for="display-name">Display Name</label>
				<input id="display-name" name="display-name" type="text" size="20" required><br>
				<label for="room-id">Room ID</label>
				<input id="room-id" type="number" min="1000" max="9999" required><br>
				<input id="create-room-submit" name="create-room" type="submit" value="create Room">
				<input id="join-room-submit" name="join-room" type="submit" value="join Room">
			</form>
			
		`);
	}
}

export default Home;
