import {Component} from '../core/component.js'
import { UserInput } from './UserInput.js';

export class HomeComponent extends Component {
	constructor(router, parameters, state) {
		super(router, parameters, state);

		this.num_of_user = 2;
		this.userInputs = [];

		//add eventListener of addUser
		this.addUserButton = this.findElement("button.addUser");
		this.addUserButton.onclick = this.addUser;
		//add eventListener of removeUser
		this.removeUserButton = this.findElement("button.removeUser");
		this.removeUserButton.onclick = this.removeUser;

		//add 2 user into form
		this.formElement = this.findElement('form.playerNameForm')
		this.formElement.onsubmit = this.goTournament;
		const player_1 = new UserInput(1, router, parameters, state);
		const player_2 = new UserInput(2, router, parameters, state);
		this.formElement.insertBefore(player_1.element, this.formElement.querySelector("button.playerNameForm"));
		this.formElement.insertBefore(player_2.element, this.formElement.querySelector("button.playerNameForm"));
		this.userInputs.push(player_1);
		this.userInputs.push(player_2);
	}

	goTournament = (event) => {
		event.preventDefault();
		let names = []
		Object.keys(this.getRouteContext("playersInfo")).forEach((player_id)=>{
			names.push((this.getRouteContext("playersInfo"))[player_id]);
		});
		
		// duplicate check
		let st = new Set(names)
		if (st.size != names.length) {
			alert("Duplicate player name exists")
			return;
		}

		this.router.gonextPage("/tournament");
	}

	addUser = () => {
		if (16 < this.num_of_user + 1) {
			alert("You can't play more than 16 players")
			return ;
		}
		this.num_of_user++;
		let newInput =  new UserInput(this.num_of_user, this.router, this.parameters, this.state);
		this.formElement.insertBefore(newInput.element, this.formElement.querySelector("button.playerNameForm"));
		this.userInputs.push(newInput);
	}

	removeUser = () => {
		if (2 == this.num_of_user)	{
			alert("You can't play less than 2 players")
			return ;
		}
		this.num_of_user--;
		this.formElement.removeChild(this.userInputs.at(-1).element);
		this.userInputs.pop();
	}
	
	get html() {
		return (`
		<h1>Welcome to Pong Game!</h1>
		<form class="playerNameForm">
    	  <button type="sumbit" class="playerNameForm">start Game</button>
    	  <button type="button" class="addUser">add</button>
    	  <button type="button" class="removeUser">remove</button>
		</form>
		`)
	}
};

export default HomeComponent;
