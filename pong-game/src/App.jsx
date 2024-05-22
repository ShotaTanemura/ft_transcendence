import {useState, createContext} from 'react';
import {BrowserRouter, Link,Routes, Route} from 'react-router-dom';
import {Home} from './components/Home.jsx'
import {Tournament} from './components/Tournament.jsx'
import './App.css'

export const PlayersContext = createContext();
function App() {
  const [PlayersInfo, setPlayersInfo] = useState();
  const value = {PlayersInfo, setPlayersInfo};
  return (
	<PlayersContext.Provider value={value}>
  	  <BrowserRouter>
	    <Routes>
	        <Route path={"/"} element={<Home/>}/>
	        <Route path={"/tournament"} element={<Tournament/>}/>
	    </Routes>
	  </BrowserRouter>
    </PlayersContext.Provider>
  );
};

export default App
