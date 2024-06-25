import { Component } from "../core/component.js";

export class Profile extends Component {
	constructor(router, params, state) {
		super (router, params, state);
	}

	get html() {
		return (`
			<h1> Profile </h1>
		`)
	}
}
