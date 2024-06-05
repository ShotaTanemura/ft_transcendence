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
		this.topPlayerScore++;
		this.setPlayersScore();
		if (this.topPlayerScore == 5) {
			this.gameSet();
		}
	}

	bottomScored = () => {
		this.bottomPlayerScore++;
		this.setPlayersScore();
		if (this.topPlayerScore == 5) {
			this.gameSet();
		}
	}

	setPlayersScore = () => {
		this.playersScoreElement.textContent = `${this.nextGamePlayers[0]}: ${this.topPlayerScore} - ${this.nextGamePlayers[1]}: ${this.bottomPlayerScore}`
	};

	getNextGamePlayers = (gameResults) => {
		const falttenedResult = gameResults.flatMap(result => result);
		const Nextgame  = falttenedResult.find((game) => game.top.winner && game.bottom.winner);
		return Nextgame ? [Nextgame.top.name, Nextgame.bottom.name] : null;
	};

	gameSet = () => {
		const newGameResult = this.gameResults.map((round, roundIndex)=>{
			if (roundIndex !== this.gameResults.length - 1) return round;
			return round.map((game) => {
				if (game.top.name === this.nextGamePlayers[0] && game.bottom.name === this.nextGamePlayers[1]) {
					game.top.score = this.topPlayerScore;
					game.bottom.score = this.bottomPlayerScore;
					if (game.top.score < game.bottom.score) {
						game.top.winner = false;
					} else {
						game.bottom.winner = false;
					}
				}
				return game;
			});
		});
		this.setRouteContext("gameResults", newGameResult);
		this.goNextPage("/tournament");	
	};

	get html() {
        return (`
        	<h1>Game Component</h1>
        `)
	};
};

export default GameComponent;
