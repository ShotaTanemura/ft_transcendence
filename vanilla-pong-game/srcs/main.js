import './core/component.js'
import {Router} from './core/router.js'
import {HomeComponent} from './components/HomeComponent.js'
import {TournamentComponent} from './components/TournamentComponent.js'
import {GameComponent} from './components/GameComponent.js'
import {GameResultComponent} from './components/GameResultComponent.js'
import {Tournament} from './components/Tournament.js'

let router = new Router(document.body, [
		{
			path: "/",
			component: HomeComponent,
			state: {}
		},
		{
			path: "/tournament",
			component: Tournament,
			state: {}
		},
		{
			path: "/game",
			component: GameComponent,
			state: {}
		},
		{
			path: "/gameresult",
			component: GameResultComponent,
			state: {}
		}
	],
	{
		playersInfo: {},
		gameResults: [],
	});

router.gonextPage(location.pathname);
