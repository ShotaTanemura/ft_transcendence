import {Component} from '../core/component.js'

export class TournamentComponent extends Component {
	constructor(route, parameters, store) {
		super(route, parameters, store);
		this.goGameButton= this.findElement('button.goGame')
		this.goGameButton.onclick = e => this.router.gonextPage("/game");
	}
	get html() {
        return (`
		<h1>tournament</h1>
		<button class="goGame">Go Game!</button>
		`)
	}
};

export default TournamentComponent;
