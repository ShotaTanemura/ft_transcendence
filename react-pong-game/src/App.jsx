import {React, useState, createContext} from 'react';
import {ReactDOM} from 'react-dom';
import {BrowserRouter, Link,Routes, Route} from 'react-router-dom';
import {Home} from './components/Home.jsx'
import {Tournament} from './components/Tournament.jsx'
import {Pong} from './components/Pong.jsx'
import {VictoryScreen} from './components/VictoryScreen.jsx'
import './App.css'

export const PlayersContext = createContext();
export const GameResultsContext = createContext();

function App() {
  const [playersInfo, setPlayersInfo] = useState({});
  const [gameResults, setGameResults] = useState([]);
  const playersState = {playersInfo, setPlayersInfo};
  const gameResultsState = {gameResults, setGameResults};

  return (
	<PlayersContext.Provider value={playersState}>
	  <GameResultsContext.Provider  value={gameResultsState}>
  	    <BrowserRouter>
	      <Routes>
	          <Route path={"/"} element={<Home/>}/>
	          <Route path={"/tournament"} element={<Tournament/>}/>
	          <Route path={"/pong"} element={<Pong/>}/>
	          <Route path={"/victory"} element={<VictoryScreen/>}/>
	      </Routes>
	    </BrowserRouter>
	  </GameResultsContext.Provider>
	</PlayersContext.Provider>
  );
};

export default App
