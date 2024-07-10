import {Component} from "../core/component.js"
import { Load } from "./Load.js";

export class GameRoom extends Component {
	constructor(router, parameters, state) {
		new Load(router, parameters, state).onload()
		super(router, parameters, state);	
		
	}


	get html() {
		return (`
			
		`);
	}
}

export default GameRoom;
