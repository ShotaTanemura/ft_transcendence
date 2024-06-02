import './core/component.js'
import {Router} from './core/router.js'
import {HomeComponent} from './components/HomeComponent.js'
import Tournament from '../../react-pong-game/src/components/Tournament.jsx';
import TournamentComponent from './components/Tournament.js';

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
	}
]);

router.gonextPage(location.pathname);
