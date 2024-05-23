import {React, Component, useState} from 'react'
import {UserNameInput} from './user-name-input'
import {GameStartButton} from './game-start-button'

export function UserNameForm(props) {
    const [inputBlocks, setInputBlocks] = useState([1, 2]);
	function addUserNameInput() {
		setInputBlocks(prevBlocks => [...prevBlocks, prevBlocks.length + 1]);
	}
	function removeUserNameInput() {
		setInputBlocks(prevBlocks => prevBlocks.slice(0, prevBlocks.length - 1));
	}

    return (
	  <form onSubmit={props.handlesubmit}>
        {inputBlocks.map((id) => (
          <UserNameInput key={id} id={id}/>
        ))}
	    <GameStartButton/>
        <button type="button" onClick={addUserNameInput}>+click</button>
        <button type="button" onClick={removeUserNameInput}>-click</button>
      </form>
    );
}
