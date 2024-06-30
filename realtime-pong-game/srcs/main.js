import './style.css'
import { Router } from './core/router.js'
import { Home } from './components/Home.js'
import { Room } from './components/Room.js'
import { Signup } from './components/Signup.js';
import { Signin } from './components/Signin.js';

let router = new Router(document.getElementById("app"), [
		{
			path: "/",
			component: Home,
			state: {},
		},
		{
			path: "/signup",
			component: Signup,
			state: {},

		},
		{
			path: "/signin",
			component: Signin,
			state: {},

		},
		{
			path: "/room",
			component: Room,
			state: {},
		}
	],
	{
	}
);

router.goNextPage("/");

