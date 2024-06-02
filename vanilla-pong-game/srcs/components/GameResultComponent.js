import {Component} from '../core/component.js'

export class GameResultComponent extends Component {
	constructor(route, parameters, state) {
		super(route, parameters, state);
		this.goHomeButton = this.findElement('button.goHome')
		this.goHomeButton.onclick = e => this.router.gonextPage("/");
	}
	get html() {
        return (`
        <h1>Game Result Component</h1>
		<button class="goHome">Go Home!</button>
        `)
	}
};

export default GameResultComponent;