import { React } from 'react';
import { useLocation } from 'react-router-dom';

export const Pong = () => {
    const getNextGamePairName = (rounds) => {
        for (const round of rounds) {
            if (round.top.winner === true && round.bottom.winner === true) {
                return [round.top.name, round.bottom.name];
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
