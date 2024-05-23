import {React, useContext, useState} from 'react'
import {UserNameInput} from './user-name-input'
import {GameStartButton} from './game-start-button'
import { PlayersContext } from '../App';

export function UserNameForm(props) {
    const [inputBlocks, setInputBlocks] = useState([1, 2]);
    const { PlayersInfo, setPlayersInfo} = useContext(PlayersContext);
	function addUserNameInput() {
		setInputBlocks(prevBlocks => [...prevBlocks, prevBlocks.length + 1]);
	}
	function removeUserNameInput() {
		setInputBlocks(prevBlocks => prevBlocks.slice(0, prevBlocks.length - 1));
	}
  function onInputChange(id, value) {
    setPlayersInfo(players => {players[id] = {name: value}; return players;})
  }

    return (
	  <form onSubmit={props.handlesubmit}>
        {inputBlocks.map((id) => (
          <UserNameInput key={id} id={id} onInputChange={onInputChange}/>
        ))}
	    <GameStartButton/>
        <button type="button" onClick={addUserNameInput}>+click</button>
        <button type="button" onClick={removeUserNameInput}>-click</button>
      </form>
    );
}
