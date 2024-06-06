import './core/component.js'
import {Router} from './core/router.js'
import {HomeComponent} from './components/HomeComponent.js'
import {TournamentComponent} from './components/TournamentComponent.js'
import {GameComponent} from './components/GameComponent.js'
import {GameResultComponent} from './components/GameResultComponent.js'
import {Tournament} from './components/Tournament.js'
import { PongComponent } from './components/Pong.js'
import './scss/style.scss'
import * as bootstrap from 'bootstrap'

let router = new Router(document.getElementById("app"), [
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
