import {Component} from "../core/component.js"
import { Load } from "./Load.js";

export class GameWaiting extends Component {
	constructor(router, parameters, state) {
		new Load(router, parameters, state).onload()
		super(router, parameters, state);
        this.connection = this.getRouteContext("WebSocket");
	}

    get html() {
        return (`
            <h1>waiting other paricipants...</h1>
            <h1>Don't reload this page.</h1>
        `)
    }
}
