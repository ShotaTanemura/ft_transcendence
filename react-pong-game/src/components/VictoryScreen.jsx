import { useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { GameResultsContext } from "../App";

export function VictoryScreen() {
    const {gameResults, setGameResults} = useContext(GameResultsContext);
    const final = gameResults[gameResults.length - 1][0];
    const winner = final.top.winner ? final.top.name : final.bottom.name;
    const navigate = useNavigate();
    function goToHome() {
        setGameResults([]);
        navigate("/");
    }

    return (
        <div>
            <h1>Congratulations {winner}</h1>
            <button onClick={goToHome}>GotoHome</button>
        </div>
    )
}

export default VictoryScreen;