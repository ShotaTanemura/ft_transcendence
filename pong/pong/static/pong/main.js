import './core/component.js'
import { Router } from './core/router.js'
import { Signup } from './pages/Signup.js'
import { Signin } from './pages/Signin.js'
import { Home } from './pages/Home.js'
import { Chat } from './pages/Chat.js'
import { Profile } from './pages/Profile.js'

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
		{
			path: "/chat",
			component: Chat,
			state: {}
		},
		{
			path: "/profile",
			component: Profile,
			state: {}
		},
	],
	{
		playersInfo: {},
		gameResults: [],
	});

router.goNextPage(location.pathname);
