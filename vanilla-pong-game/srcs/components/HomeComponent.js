import {Component} from '../core/component.js'
import { UserInput } from './UserInput.js';

export class HomeComponent extends Component {
	constructor(route, parameters, store) {
		super(route, parameters, store);

		this.num_of_user = 2;
		this.userInputs = [];

		//add eventListener of gameStartButton
		this.gameStartButton = this.findElement("button.gameStart");
		this.gameStartButton.onclick = e => this.router.gonextPage("/tournament");

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
		this.formElement.appendChild(player_1.element);
		this.formElement.appendChild(player_2.element);
		this.userInputs.push(player_1);
		this.userInputs.push(player_2);
	}

	addUser = () => {
		if (16 < this.num_of_user) {
			alert("You can't play more than 16 players")
			return ;
		}
		this.num_of_user++;
		let newInput =  new UserInput(this.num_of_user, this.route, this.parameters, this.store);
		this.formElement.appendChild(newInput.element);
		this.userInputs.push(newInput);
	}

	removeUser = () => {
		if (2 == this.num_of_user)	{
			alert("You can't play less than 2 players")
			return ;
		}
		this.formElement.removeChild(this.userInputs.at(-1).element);
		this.userInputs.pop();
		this.num_of_user--;
	}
	
	get html() {
		return (`
		<h1>Welcome to Pong Game!</h1>
		<form action="" method="" class="playerNameForm">
    	  <button type="submit" class="gameStart">start Game</button>
    	  <button type="button" class="addUser">add</button>
    	  <button type="button" class="removeUser">remove</button>
		</form>
		`)
	}
};

export default HomeComponent;
