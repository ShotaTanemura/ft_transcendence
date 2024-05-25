import {React, useContext} from 'react';
import {PlayersContext} from '../App.jsx';

export function Tournament() {
  const {PlayersInfo, setPlayersInfo} = useContext(PlayersContext);

  return (
    <>
		{Object.keys(PlayersInfo).map(index => {
			return <h1 key={index} >{PlayersInfo[index].name}</h1>
		})}
	</>
  );
}

export default Tournament;
