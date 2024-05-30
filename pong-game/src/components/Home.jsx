import {React, useState, useContext} from 'react'
import {useNavigate} from 'react-router-dom'
import { UserNameForm } from './UserNameForm.jsx';

export function Home() {

  const navigation = useNavigate();

  function handlesubmit(e) {         	
	e.preventDefault();
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
