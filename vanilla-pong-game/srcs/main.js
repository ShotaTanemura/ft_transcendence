import './core/component.js'
import { Router } from './core/router.js'
import { Home } from './components/Home.js'
import { Game} from './components/Game.js'
import { GameResult } from './components/GameResult.js'
import { Tournament } from './components/Tournament.js'
import './scss/style.scss'

let router = new Router(document.getElementById("app"), [
		{
			path: "/",
			component: Home,
			state: {}
		},
		{
			path: "/tournament",
			component: Tournament,
			state: {}
		},
		{
			path: "/game",
			component: Game,
			state: {}
		},
		{
			path: "/gameresult",
			component: GameResult,
			state: {}
		}
	],
	{
		playersInfo: {},
		gameResults: [],
	});

router.goNextPage(location.pathname);
