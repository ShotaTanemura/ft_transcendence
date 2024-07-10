import './core/component.js'
import { Router } from './core/router.js'
import { Signup } from './components/Signup.js'
import { Signin } from './components/Signin.js'
import { Home } from './components/Home.js'
import { GameHome } from './components/GameHome.js'
import { GameRoom } from './components/GameRoom.js'
import { GameWaiting } from './components/GameWaiting.js'
import { Error } from './components/Error.js'

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
			path: "/error",
			component: Error,
			state: {}
		},
		{
			path: "/game-home",
			component: GameHome,
			state: {}
		},
		{
			path: "/game-room",
			component: GameRoom,
			state: {}
		},
		{
			path: "/game-waiting",
			component: GameWaiting,
			state: {}

		}
	],
	{
		playersInfo: {},
		gameResults: [],
	});

router.goNextPage(location.pathname);
