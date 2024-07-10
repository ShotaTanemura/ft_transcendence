// signin後の仮ページ

import { Component } from "../core/component.js";

export class Home extends Component {
	constructor(router, params, state) {
		super (router, params, state);
		this.findElement("button.go-realtime-button").onclick = this.goRealtime
	}
	goRealtime = () => {
		this.router.goNextPage("/game-home");
	}

	get html() {
		return (`
			<h1> signin後の仮ページ </h1>
			<button class="go-realtime-button">リアルタイム対戦をする</button>
		`)
	}
}

