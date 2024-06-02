import {Component} from '../core/component.js'
import { UserInput } from './UserInput.js';

export class HomeComponent extends Component {
	constructor(route, parameters, store) {
		super(route, parameters, store);

		this.num_of_user = 2;
		this.userInputs = [];

		//add eventListener of gameStartButton
		this.gameStartButton = this.findElement("button.playerNameForm");
		this.gameStartButton.onclick = this.goTournament;

		//add eventListener of addUser
		this.addUserButton = this.findElement("button.addUser");
		this.addUserButton.onclick = this.addUser;
		//add eventListener of removeUser
		this.removeUserButton = this.findElement("button.removeUser");
		this.removeUserButton.onclick = this.removeUser;

		//add 2 user into form
		this.formElement = this.findElement('form.playerNameForm')
		const player_1 = new UserInput(1, route, parameters, store);
		const player_2 = new UserInput(2, route, parameters, store);
		this.formElement.insertBefore(player_1.element, this.formElement.querySelector("button.playerNameForm"));
		this.formElement.insertBefore(player_2.element, this.formElement.querySelector("button.playerNameForm"));
		this.userInputs.push(player_1);
		this.userInputs.push(player_2);
	}

	goTournament = () => {
		let names = []
		Object.keys(this.store.playersInfo).forEach((player_id)=>{
			names.push(this.store.playersInfo[player_id]);
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
		if (16 < this.num_of_user) {
			alert("You can't play more than 16 players")
			return ;
		}
		this.num_of_user++;
		let newInput =  new UserInput(this.num_of_user, this.route, this.parameters, this.store);
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
    	  <button type="button" class="playerNameForm">start Game</button>
    	  <button type="button" class="addUser">add</button>
    	  <button type="button" class="removeUser">remove</button>
		</form>
		`)
	}
};

export default HomeComponent;
