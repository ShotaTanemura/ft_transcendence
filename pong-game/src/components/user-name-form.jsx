import {React, Component} from 'react'
import {UserNameInput} from './user-name-input'
import {GameStartButton} from './game-start-button'

export class UserNameForm extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
	  	  <form onSubmit={this.props.handlesubmit}>
		    <UserNameInput id={1}/>
		    <GameStartButton/>
      	  </form>
        );
    }
}