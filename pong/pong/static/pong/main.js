import './core/component.js'
import { Router } from './core/router.js'
import { Hoge } from './components/Hoge.js'

let router = new Router(document.getElementById("app"), [
		{
			path: "/",
			component: Hoge,
			state: {}
		},
	],
	{
		playersInfo: {},
		gameResults: [],
	});

router.goNextPage(location.pathname);
