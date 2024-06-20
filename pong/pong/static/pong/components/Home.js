// signin後の仮ページ

import { Component } from "../core/component.js";

export class Home extends Component {
	constructor(router, params, state) {
		super (router, params, state);
	}

	get html() {
		return (`
			<h1> signin後の仮ページ </h1>
		`)
	}
}

