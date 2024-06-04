import {Component} from '../core/component.js'

export class UserNameInput extends Component {
    constructor(player_id, router, parameters, state) {
		super(router, parameters, state);
		this.player_id = player_id;
		this.element = Component.createElementFromHTML(this.html, this.containerTag);
		this.inputElement = this.findElement(`input.player_${this.player_id}`);
		this.inputElement.oninput = this.updatePlayerName;
	}
	updatePlayerName = (e) => {
		(this.getRouteContext("playersInfo"))[this.player_id] = e.target.value.trim();
	}

	get html() {
		return (`
        	  <label for=${this.player_id}>Player${this.player_id}:</label>
              <input class=player_${this.player_id} value="" type=text name="name" required><br/><br/>
		`);
	} 
}