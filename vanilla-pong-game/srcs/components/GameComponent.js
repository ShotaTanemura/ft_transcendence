import {Component} from '../core/component.js'

export class GameComponent extends Component {
	constructor(route, parameters, state) {
		super(route, parameters, state);
		this.gameResults = this.getRouteContext("gameResults");
		this.nextGamePlayers = this.getNextGamePlayers(this.gameResults);

		this.TopWinButton = this.findElement('button.TopWin');
		this.TopWinButton.onclick = this.MockTopWin;

		this.BottomWinButton = this.findElement('button.BottomWin');
		this.BottomWinButton.onclick = this.MockBottomWin;
	}

	getNextGamePlayers = (gameResults) => {
		const falttenedResult = gameResults.flatMap(result => result);
		const Nextgame  = falttenedResult.find((game) => game.top.winner && game.bottom.winner);
		return Nextgame ? [Nextgame.top.name, Nextgame.bottom.name] : null;
	}

	MockTopWin = () => {
		console.log("Top Win!");
		const newGameResult = this.gameResults.map((round, roundIndex)=>{
			if (roundIndex !== this.gameResults.length - 1) return round;
			return round.map((game) => {
				if (game.top.name === this.nextGamePlayers[0] && game.bottom.name === this.nextGamePlayers[1]) {
					game.top.score = 100;
					game.bottom.winner = false;
				}
				return game;
			});
		});
		this.setRouteContext("gameResults", newGameResult);
		this.router.gonextPage("/tournament");
	}

	MockBottomWin = () => {
		console.log("Bottom Win!");
		const newGameResult = this.gameResults.map((round, roundIndex)=>{
			if (roundIndex !== this.gameResults.length - 1) return round;
			return round.map((game) => {
				if (game.top.name === this.nextGamePlayers[0] && game.bottom.name === this.nextGamePlayers[1]) {
					game.bottom.score = 100;
					game.top.winner = false;
				}
				return game;
			});
		});
		this.setRouteContext("gameResults", newGameResult);
		this.router.gonextPage("/tournament");
	}

	get html() {
        return (`
        	<h1>Game Component</h1>
			<button class="TopWin">Top Win!</button>
			<button class="BottomWin">Bottom Win!</button>
        `)
	}
};

export default GameComponent;
