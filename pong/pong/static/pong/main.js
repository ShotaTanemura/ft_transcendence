import './core/component.js'
import { Router } from './core/router.js'
import { Signup } from './components/Signup.js'

let router = new Router(document.getElementById("app"), [
		{
			path: "/",
			component: Signup,
			state: {}
		},
	],
	{
		playersInfo: {},
		gameResults: [],
	});

router.goNextPage(location.pathname);
