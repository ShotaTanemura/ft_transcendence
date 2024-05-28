import { React } from 'react';
import { useLocation } from 'react-router-dom';

export const Pong = () => {
    const getNextGamePairName = (rounds) => {
        for (const round of rounds) {
            for (const game of round) {
                if (game.top.winner === true && game.bottom.winner === true) {
                    console.log(game.top.name);
                    return [game.top.name, game.bottom.name];
                }
            }
        }
        return null;
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
