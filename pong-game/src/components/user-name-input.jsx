import {React, Component, useState, useContext} from 'react'
import {useNavigate} from 'react-router-dom'
import {PlayersContext} from '../App.jsx'

export class UserNameInput extends Component {
    
    constructor(props) {
      super(props);
      this.props = props;
    };
    render(){
      const id = this.props.id;
      const player_id = `player${id}`
      return (
        <>
          <div>
            <label htmlFor={player_id}>Player{id}:</label>
            <input type="text" id={player_id} name={player_id} required/><br/><br/>
          </div>
        </>
      );
    };
}

export default UserNameInput;
