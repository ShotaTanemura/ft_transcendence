import {React, useContext} from 'react';
import {PlayersContext} from '../App.jsx';

export function Tournament() {
  const {PlayersInfo, setPlayersInfo} = useContext(PlayersContext);

  return (
    <>
	  <h1>{PlayersInfo.player1}</h1>
	  <h1>{PlayersInfo.player2}</h1>
	  <h1>{PlayersInfo.player3}</h1>
	  <h1>{PlayersInfo.player4}</h1>
	</>
  );
}

export default Tournament;
