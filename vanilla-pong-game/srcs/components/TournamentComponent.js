import {Component} from '../core/component.js'

export class TournamentComponent extends Component {
	constructor(route, parameters, state) {
		super(route, parameters, state);
		this.goGameButton.onclick = this.goNextPage("/game");
	}
	get html() {
        return (`
		<h1>tournament</h1>
		`)
	}
};

export default TournamentComponent;
