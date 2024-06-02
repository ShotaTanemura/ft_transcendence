import {Component} from '../core/component.js'

export class TournamentComponent extends Component {
	constructor(route, parameters, store) {
		super(route, parameters, store);
	}
	get html() {
        return (`<h1>tournament</h1>`)
	}
};

export default TournamentComponent;
