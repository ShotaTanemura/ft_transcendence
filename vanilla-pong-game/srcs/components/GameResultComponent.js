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
	}

	goHomePage = () => {
		this.goNextPage("/");
	}
	get html() {
        return (`
        	<h1>Game Result Component</h1>
			<h1>Conguratulation ${this.tournamentWinnerName}!<h1>
			<button class="goHome">Go Home!</button>
        `)
	}
};

export default GameResultComponent;