import './core/component.js'
import { Router } from './core/router.js'
import { Signin } from './components/Signin.js'

let router = new Router(document.getElementById("app"), [
		{
			path: "/",
			component: Signin,
			state: {}
		},
	],
	{
		playersInfo: {},
		gameResults: [],
	});

router.goNextPage(location.pathname);
