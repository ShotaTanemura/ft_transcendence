import { React, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameResultsContext } from '../App';
import PongField from './PongField'

export const Pong = () => {
    const {gameResults, setGameResults} = useContext(GameResultsContext)
    const navigate = useNavigate();

    function MockTopWin() {
        console.log("top win!");
        const newGameResults = gameResults.map((round,index)=> {
            if (index != gameResults.length - 1) return round;
            return round.map((game)=> {
                if (game.top.name !== pair[0] || game.bottom.name !== pair[1]) return game;
                game.bottom.winner = false;
                game.top.score = 100;
                return game;
            })
        });;
        setGameResults(newGameResults);
        navigate("/tournament");
    }

    function MockBottomWin() {
        console.log("bottom win!");
        const newGameResults = gameResults.map((round,index)=> {
            if (index != gameResults.length - 1) return round;
            return round.map((game)=> {
                if (game.top.name !== pair[0] || game.bottom.name !== pair[1]) return game;
                game.top.winner = false;
                game.bottom.score = 100;
                return game;
            })
        });;
        setGameResults(newGameResults);
        navigate("/tournament");
    }

    function getNextGamePairName(gameResults) {
        const flattenedGames = gameResults.flatMap(result => result);
        const nextGame = flattenedGames.find(game => game.top.winner && game.bottom.winner);
        return nextGame ? [nextGame.top.name, nextGame.bottom.name] : null
    }
    const pair = getNextGamePairName(gameResults);

    return (
        <div>
            <PongField playerNames={ pair }></PongField>
            <button onClick={MockTopWin}>top win</button>
            <button onClick={MockBottomWin}>bottom win</button>
        </div>
    );
};

export default Pong;
