import {Component} from '../core/component.js'
import { UserNameInput } from './UserNameInput.js';

export class UserNameForm extends Component {
	constructor(router, parameters, state) {
		super(router, parameters, state);
		this.num_of_user = 2;
		this.userNameInputs = [];

		//add eventListener of addUser
		this.addUserButton = this.findElement("button.addUser");
		this.addUserButton.onclick = this.addUser;
		//add eventListener of removeUser
		this.removeUserButton = this.findElement("button.removeUser");
		this.removeUserButton.onclick = this.removeUser;

		//add 2 user into form
		this.formElement = this.findElement('form.playerNameForm')
		this.formElement.onsubmit = this.goTournament;
		const player_1 = new UserNameInput(1, router, parameters, state);
		const player_2 = new UserNameInput(2, router, parameters, state);
		this.formElement.insertBefore(player_1.element, this.formElement.querySelector("button.playerNameForm"));
		this.formElement.insertBefore(player_2.element, this.formElement.querySelector("button.playerNameForm"));
		this.userNameInputs.push(player_1);
		this.userNameInputs.push(player_2);
    }

	addUser = () => {
		if (16 < this.num_of_user + 1) {
			alert("You can't play more than 16 players")
			return ;
		}
		this.num_of_user++;
		let newInput =  new UserNameInput(this.num_of_user, this.router, this.parameters, this.state);
		this.formElement.insertBefore(newInput.element, this.formElement.querySelector("button.playerNameForm"));
		this.userNameInputs.push(newInput);
	}

	removeUser = () => {
		if (2 == this.num_of_user)	{
			alert("You can't play less than 2 players")
			return ;
		}
		this.num_of_user--;
		this.formElement.removeChild(this.userNameInputs.at(-1).element);
		this.userNameInputs.pop();
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
		this.goNextPage("/tournament");
	}


    get html() {
        return (`
            <form class="playerNameForm">
    	      <button type="sumbit" class="playerNameForm btn btn-primary">start Game</button>
    	      <button type="button" class="addUser btn">add</button>
    	      <button type="button" class="removeUser btn">remove</button>
		    </form>
        `)
    }
};