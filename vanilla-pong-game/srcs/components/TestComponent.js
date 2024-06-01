import {Component} from '../core/component.js';

export class TestComponent extends Component{
	constructor(router, parameters, store) {
		super(router, parameters, store);
	}

	get html() {
		return ('<h1>hello world</h1>');
	}
};
export default TestComponent;
