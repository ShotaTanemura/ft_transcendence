import './core/component.js'
import {Router} from './core/router.js'
import {HomeComponent} from './components/HomeComponent.js'
import {TournamentComponent} from './components/TournamentComponent.js'
import {GameComponent} from './components/GameComponent.js'
import {GameResultComponent} from './components/GameResultComponent.js'

let router = new Router(document.body, [
	{
		path: "/",
		component: HomeComponent,
		store: {playersInfo: [], gameResult: []}
	},
	{
		path: "/tournament",
		component: TournamentComponent,
		store: {}
	},
	{
		path: "/game",
		component: GameComponent,
		store: {}
	},
	{
		path: "/gameresult",
		component: GameResultComponent,
		store: {}
	}
]);

router.gonextPage(location.pathname);
