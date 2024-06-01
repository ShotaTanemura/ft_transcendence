import React from 'react';

const Bracket = ({ rounds }) => {
  return (
    <main id="tournament">
      {rounds.map((round, roundIndex) => (
        <ul className={`round round-${roundIndex + 1}`} key={roundIndex}>
          <li className="spacer">&nbsp;</li>
          {round.map((game, gameIndex) => (
            <React.Fragment key={gameIndex}>
              <li className={`game game-top ${game.top.winner ? 'winner' : ''}`}>
                {game.top.name} <span>{game.top.score}</span>
              </li>
              <li className="game game-spacer">&nbsp;</li>
              <li className={`game game-bottom ${game.bottom.winner ? 'winner' : ''}`}>
                {game.bottom.name} <span>{game.bottom.score}</span>
              </li>
              <li className="spacer">&nbsp;</li>
            </React.Fragment>
          ))}
        </ul>
      ))}
    </main>
  );
};

export default Bracket;