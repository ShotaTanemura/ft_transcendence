import {React} from 'react'

export function UserNameInput(props) {
    
  const id = props.id;
  const player_id = `player${id}`;
  const onInputChange = props.onInputChange;
  return (
    <>
      <div>
        <label htmlFor={player_id}>Player{id}:</label>
        <input type="text" onChange={(e)=> onInputChange(id, e.target.value)} id={player_id} name={player_id} required/><br/><br/>
      </div>
    </>
  );
}

export default UserNameInput;
