import {React, useState, useContext} from 'react'
import {useNavigate} from 'react-router-dom'
import {PlayersContext} from '../App.jsx'
import {UserNameInput} from './user-name-input.jsx'
import { GameStartButton } from './game-start-button.jsx';

export function Home() {
  const { playersInfo, setPlayersInfo} = useContext(PlayersContext);
  const navigation = useNavigate();

  function handlesubmit(e) {         	
	e.preventDefault();
	setPlayersInfo({
	  //TODO 同じニックネームをつけないなどのバリデーションが必要。
	  player1: document.getElementById('player1').value,
	})
	navigation("/tournament");
	return ;                         	
  }

  return (
    <>
      <div>
	  	<h1>Welcome to Pong Game!</h1>
	  	<form id="RegisterPlayers" onSubmit={handlesubmit}>
		  <UserNameInput id={1}/>
		  <GameStartButton/>
    	</form>
	  </div>
    </>
  );
};

export default Home
