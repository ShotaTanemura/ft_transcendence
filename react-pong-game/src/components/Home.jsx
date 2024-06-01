import {React, useState, useContext} from 'react'
import {useNavigate} from 'react-router-dom'
import { UserNameForm } from './UserNameForm.jsx';
import { PlayersContext } from '../App.jsx';

export function Home() {

  const navigation = useNavigate();
  const {playersInfo, setPlayersInfo} = useContext(PlayersContext);

  function isUniquePlayerName() {
    let is_unique = true;
    Object.keys(playersInfo).forEach((index1)=>{
        Object.keys(playersInfo).forEach((index2)=>{
          if (index1 !== index2 && playersInfo[index1].name === playersInfo[index2].name) {
            is_unique = false;
          }
        })
    })
    return (is_unique);
  }

  function handlesubmit(e) {         	
	  e.preventDefault();
    if (!isUniquePlayerName()) {
        alert("Player's Name should be unique");
        return ;
    }
	  navigation("/tournament");
	  return ;
  }

  return (
    <>
      <div>
	  	  <h1>Welcome to Pong Game!</h1>
		    <UserNameForm handlesubmit={handlesubmit} />
	    </div>
    </>
  );
};

export default Home
