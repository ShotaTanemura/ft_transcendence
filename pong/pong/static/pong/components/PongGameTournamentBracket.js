import { Component } from "../core/component.js";

export class PongGameTournamentBracket extends Component {
  constructor(router, parameters, state, tournament = []) {
    super(router, parameters, state);
    this.tournamentElement = this.findElement("div.tournament-bracket");
    this.tournamentChildElement = this.createTounamentObject(tournament);
    this.tournamentElement.appendChild(this.tournamentChildElement)
  }

  createTounamentObject(tournament) { 
    let parentElement = Object.assign(document.createElement("div"), {className: `bracket`});
     tournament.map((round, roundIndex)=>{
        let roundElement = Object.assign(document.createElement('section'), {className: `round round-${roundIndex + 1}`});
        let matchesElement;
        let matchupsElement;
        round.map((game, gameIndex)=>{
          if (gameIndex % 2 === 0) {
            matchesElement = (Object.assign(document.createElement('div'), {className: "matches"}));
            matchupsElement = (Object.assign(document.createElement('div'), {className: "matchups"}));
            matchesElement.appendChild(matchupsElement);
          }
          let matchupElement = (Object.assign(document.createElement('div'), {className: "matchup"}));
          let participantsElement = (Object.assign(document.createElement('div'), {className: "participants"}));

          //create Top Player Element;
          let topPlayerElement = document.createElement('div');
          topPlayerElement.className = `participant ${game.top.winner ? 'winner' : 'loser'}`;
          topPlayerElement.innerHTML = `<span class="name">${game.top.name}</span><span class="score">${game.top.score}</span>`

          //create Bottom Player Element;
          let bottomPlayerElement = document.createElement('div');
          bottomPlayerElement.className = `participant game game-top ${game.bottom.winner ? 'winner' : 'loser'}`;
          bottomPlayerElement.innerHTML = `<span class="name">${game.bottom.name}</span><span class="score">${game.bottom.score}</span>`;

          participantsElement.appendChild(topPlayerElement);
          participantsElement.appendChild(bottomPlayerElement);
          matchupElement.appendChild(participantsElement);
          matchupsElement.appendChild(matchupElement);
          if (gameIndex % 2 === 1) {
            let connectorElement = (Object.assign(document.createElement('div'), {className: "connector"}));
            connectorElement.innerHTML = `<div class="merger"></div><div class="line"></div>`
            matchesElement.appendChild(connectorElement)
            roundElement.appendChild(matchesElement);
          } else if (gameIndex === round.length - 1) {
            roundElement.appendChild(matchesElement);
          }
        });
        parentElement.appendChild(roundElement);
     })
     return (parentElement);
  }

  get html() {
    return (`
      <div class="tournament-bracket">
      </div>
    `);
  }
}

export default PongGameTournamentBracket;
