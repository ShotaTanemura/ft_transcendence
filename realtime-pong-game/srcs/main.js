import './style.css'
import { Router } from './core/router.js'
import {Home} from 'components/Home.js'

let router = new Router(document.getElementById("app"), [
		{
			path: "/",
			component: Home,
			state: {},
		},
	],
	{
	}
);

router.goNextPage(location.pathname);

