import './core/component.js'
import {Router} from './core/router.js'
import {TestComponent} from './components/TestComponent.js'

let router = new Router(document.body, [
	{
		path: "/",
		component: TestComponent,
		store: {}
	}
]);

router.gonextPage(location.pathname);
