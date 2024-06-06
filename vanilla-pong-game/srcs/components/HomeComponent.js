import {Component} from '../core/component.js'
import { UserNameForm } from './UserNameForm.js';

export class HomeComponent extends Component {
	constructor(router, parameters, state) {
		super(router, parameters, state);
			let useNameForm = new UserNameForm(router, parameters, state);
			this.element.appendChild(useNameForm.element);
	}

	get html() {
		return (`
			<h1>Welcome to Pong Game!</h1>
			<br/>
		`)
	}
};

export default HomeComponent;
