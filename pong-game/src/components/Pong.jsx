import { React } from 'react';
import { useLocation } from 'react-router-dom';

export const Pong = () => {
    const getNextGamePairName = (rounds) => {
        const flattenedGames = rounds.flatMap(round => round);
        const nextGame = flattenedGames.find(game => game.top.winner && game.bottom.winner);
        return nextGame ? [nextGame.top.name, nextGame.bottom.name] : null
    }
    const location = useLocation();
    const rounds = location.state;
    const pair = getNextGamePairName(rounds);

    return (
        <div>
            <p>{ pair[0] }</p>
            <p>{ pair[1] }</p>
        </div>
    );
};

export default Pong;
