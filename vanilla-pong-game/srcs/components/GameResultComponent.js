import {Component} from '../core/component.js'
import Tournament from './Tournament.js';

export class GameResultComponent extends Component {
	constructor(route, parameters, state) {
		super(route, parameters, state);
		this.finalMatch = (this.getRouteContext("gameResults").at(-1))[0];
		this.tournamentWinnerName =this.finalMatch.top.winner ? this.finalMatch.top.name : this.finalMatch.bottom.name;
		this.render();
		this.goHomeButton = this.findElement('button.goHome')
		this.goHomeButton.onclick = this.goHomePage;
		this.setRouteContext("playersInfo", {});
		this.setRouteContext("gameResults", []);
	}

	goHomePage = () => {
		this.goNextPage("/");
	}
	get html() {
        return (`
        	<h1>Tournament Result!</h1>
			<h1>Conguratulation ${this.tournamentWinnerName}!<h1>
			<br/><br/>
			<button class="goHome btn btn-primary">Go Home!</button>
        `)
	}
};

export default GameResultComponent;