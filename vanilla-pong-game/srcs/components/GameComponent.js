import {Component} from '../core/component.js'

export class GameComponent extends Component {
	constructor(route, parameters, store) {
		super(route, parameters, store);
		this.gameResultButton = this.findElement('button.goResult')
		this.gameResultButton.onclick = e => this.router.gonextPage("/gameresult");
	}
	get html() {
        return (`
        <h1>Game Component</h1>
		<button class="goResult">Go Result!</button>
        `)
	}
};

export default GameComponent;
