import {React, useState, useContext} from 'react'
import {useNavigate} from 'react-router-dom'
import {PlayersContext} from '../App.jsx'

export function Home() {
  const { playersInfo, setPlayersInfo} = useContext(PlayersContext);
  const navigation = useNavigate();

  function handlesubmit(e) {         	
	e.preventDefault();
	setPlayersInfo({
	  //TODO 同じニックネームをつけないなどのバリデーションが必要。
	  player1: document.getElementById('player1').value,
	  player2: document.getElementById('player2').value,
	  player3: document.getElementById('player3').value,
	  player4: document.getElementById('player4').value
	})
	navigation("/tournament");
	return ;                         	
  }

  return (
    <>
      <div>
	  	<h1>Welcome to Pong Game!</h1>
	  	<form id="RegisterPlayers" onSubmit={handlesubmit}>
      	  <label htmlFor="player1">Player1:</label>
      	  <input type="text" id="player1" name="player1" required/><br/><br/>

      	  <label htmlFor="player2">Player2:</label>
      	  <input type="text" id="player2" name="player2" required/><br/><br/>

      	  <label htmlFor="player3">Player3:</label>
      	  <input type="text" id="player3" name="player3" required/><br/><br/>

      	  <label htmlFor="player4">Player4:</label>
      	  <input type="text" id="player4" name="player4" required/><br/><br/>

      	  <button type="submit">Game Start!</button>
    	</form>
	  </div>
    </>
  );
};

export default Home
