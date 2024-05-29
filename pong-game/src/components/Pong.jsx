import { React } from 'react';
import { useLocation } from 'react-router-dom';
import PongField from './PongField'

export const Pong = () => {
    function getNextGamePairName(rounds) {
        const flattenedGames = rounds.flatMap(round => round);
        const nextGame = flattenedGames.find(game => game.top.winner && game.bottom.winner);
        return nextGame ? [nextGame.top.name, nextGame.bottom.name] : null
    }
    const location = useLocation();
    const rounds = location.state;
    const pair = getNextGamePairName(rounds);

    return (
        <div>
            <PongField playerNames={ pair }></PongField>
        </div>
    );
};

export default Pong;
