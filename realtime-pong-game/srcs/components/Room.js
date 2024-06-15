import {Component} from '../core/component.js'

export class Room extends Component {
	constructor(router, parameters, state) {
		super(router, parameters, state);

	}

	get html() {
		return (`
			<h1>Display Name: ${this.router.getContext("displayName")}</h1>
			<h1>Room ID: ${this.router.getContext("roomID")}</h1>
		`)
	}

}
