import './core/component.js'
import { Router } from './core/router.js'
import { Signup } from './components/Signup.js'
import { Signin } from './components/Signin.js'
import { Home } from './components/Home.js'

let router = new Router(document.getElementById("app"), [
		{
			path: "/",
			component: Signin,
			state: {}
		},
		{
			path: "/signup",
			component: Signup,
			state: {}
		},
		{
			path: "/home",
			component: Home,
			state: {}
		},
	],
	{
		playersInfo: {},
		gameResults: [],
	});

router.goNextPage(location.pathname);
