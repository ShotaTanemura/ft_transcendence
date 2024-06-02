import {Component} from '../core/component.js'

export class UserInput extends Component {
    constructor(player_id, route, parameters, store) {
		super(route, parameters, store);
		this.player_id = player_id;
		this.element = Component.createElementFromHTML(this.html, this.containerTag);
	}

	get html() {
		return (`
            <div>
              <input class=player_${this.player_id} type=text />
            </div>
		`);
	} 
}