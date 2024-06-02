import {Component} from '../core/component.js'

export class HomeComponent extends Component {
	constructor(route, parameters, store) {
		super(route, parameters, store);
		this.gameStartButton = this.findElement('button.gameStart')
		this.gameStartButton.onclick = e => this.router.gonextPage("/tournament");
	}
	get html() {
		return (`
		<h1>Welcome to Pong Game!</h1>
		<button class="gameStart">start game!</button>
		`)
	}
};

export default HomeComponent;
