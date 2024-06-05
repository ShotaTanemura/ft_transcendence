import {Component} from '../core/component.js'
import { PongComponent } from './Pong.js';

export class GameComponent extends Component {
	constructor(route, parameters, state) {
		super(route, parameters, state);
		this.gameResults = this.getRouteContext("gameResults");
		this.nextGamePlayers = this.getNextGamePlayers(this.gameResults);
		this.topPlayerScore = 0;
		this.bottomPlayerScore = 0;

		this.playersScoreElement = document.createElement("h2");
		this.setPlayersScore();
		this.element.appendChild(this.playersScoreElement);

		window.addEventListener("top-scored", this.topScored);
		window.addEventListener("bottom-scored", this.bottomScored);

		this.pongComponent = new PongComponent(route, parameters, state);
		this.element.appendChild(this.pongComponent.element);
		
	}

	topScored = () => {
		console.log("kita");
		this.topPlayerScore++;
		this.setPlayersScore();
	}

	bottomScored = () => {
		console.log("kita");
		this.bottomPlayerScore++;
		this.setPlayersScore();
	}

	setPlayersScore = () => {
		this.playersScoreElement.textContent = `${this.nextGamePlayers[0]}: ${this.topPlayerScore} - ${this.nextGamePlayers[1]}: ${this.bottomPlayerScore}`
	};

	getNextGamePlayers = (gameResults) => {
		const falttenedResult = gameResults.flatMap(result => result);
		const Nextgame  = falttenedResult.find((game) => game.top.winner && game.bottom.winner);
		return Nextgame ? [Nextgame.top.name, Nextgame.bottom.name] : null;
	};

	get html() {
        return (`
        	<h1>Game Component</h1>
        `)
	};
};

export default GameComponent;
