import { Component } from '../core/component';

export class Bracket extends Component {
  constructor(rounds, router, parameters, state) {
    super(router, parameters, state);
    this.rounds = rounds;
    this.tournamentElement = this.findElement("main.tournament")
    this.tournamentChildElements = this.createTounamentObject();

    //TODO This code is a bit redundant.
    //Adding child nodes to avoid the first element being a div tag is unnecessary.
    //If there's a better way, it should be rewritten.
    while(this.tournamentChildElements.firstChild) {
      this.tournamentElement.appendChild(this.tournamentChildElements.firstChild);
    } 
  }

  createTounamentObject() { 
    let parentElement = document.createElement("div");
     this.rounds.map((round, roundIndex)=>{
        let roundElement = Object.assign(document.createElement('ul'), {className: `round round-${roundIndex + 1}`});
        round.map((game, gameIndex)=>{
          //create Top Player Element
          roundElement.appendChild(Object.assign(document.createElement('li'), {className: "spacer", innerHTML: "&nbsp;"}));
          let topPlayerElement = document.createElement('li');
          topPlayerElement.className = `game game-top ${game.top.winner ? 'winner' : ''}`;
          topPlayerElement.innerHTML = `${game.top.name} <span>${game.top.score}</span>`
          roundElement.appendChild(topPlayerElement);

          roundElement.appendChild(Object.assign(document.createElement('li'), {className: "game game-spacer", innerHTML: "&nbsp"}));

          //create Bottom Player Element;
          let bottomPlayerElement = document.createElement('li');
          bottomPlayerElement.className = `game game-top ${game.bottom.winner ? 'winner' : ''}`;
          bottomPlayerElement.innerHTML = `${game.bottom.name} <span>${game.bottom.score}</span>`;
          roundElement.appendChild(bottomPlayerElement);
          roundElement.appendChild(Object.assign(document.createElement('li'), {className: "spacer", innerHTML: "&nbsp;"}));
        });
        parentElement.appendChild(roundElement);
     })
     return (parentElement);
  }
  get html() {
    return (`
      <main class="tournament">
      </main>
    `);
  }
};

export default Bracket;