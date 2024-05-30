import {React, useContext, useState} from 'react'
import {UserNameInput} from './UserNameInput.jsx'
import {GameStartButton} from './GameStartButton.jsx'
import { PlayersContext } from '../App.jsx';

export function UserNameForm(props) {
    const [inputBlocks, setInputBlocks] = useState([1, 2]);
    const { playersInfo, setPlayersInfo} = useContext(PlayersContext);
	function addUserNameInput() {
		setInputBlocks(prevBlocks => [...prevBlocks, prevBlocks.length + 1]);
	}
	function removeUserNameInput() {
		setInputBlocks(prevBlocks => prevBlocks.slice(0, prevBlocks.length - 1));
	}
  function onInputChange(id, value) {
    setPlayersInfo(players => {players[id] = {name: value.trim(), is_advancing: true}; return players;})
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
