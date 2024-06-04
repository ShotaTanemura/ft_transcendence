import {React, useContext, useState} from 'react'
import {UserNameInput} from './UserNameInput.jsx'
import {GameStartButton} from './GameStartButton.jsx'
import { PlayersContext } from '../App.jsx';

export function UserNameForm(props) {
    const [inputBlocks, setInputBlocks] = useState([1, 2]);
    const { playersInfo, setPlayersInfo} = useContext(PlayersContext);
    const number_of_max_player = 16;
    const number_of_minimum_player = 2;
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
        {inputBlocks.length < number_of_max_player && <button type="button" onClick={addUserNameInput}>+click</button>}
        {number_of_minimum_player < inputBlocks.length && <button type="button" onClick={removeUserNameInput}>-click</button>}
	      <GameStartButton/>
      </form>
    );
}
