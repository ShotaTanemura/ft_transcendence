import { Component } from '../core/component';
import { Bracket } from './Bracket.js';
import './Tournament.css';

export class Tournament extends Component {
  constructor (route, parameters, state){
    super(route, parameters, state);
    this.playersInfo = this.getRouteContext("playersInfo");
    this.gameResults = this.getRouteContext("gameResults");
    this.rounds = []
    this.displayTournament();
    this.bracket = new Bracket(this.rounds, route, parameters, state);
    this.element.insertBefore(this.bracket.element, this.gameStartButton);
  };

  // 前の対戦が終わってtournamentに処理が移った時に実行する、トーナメントのアップデートを行うモック
  gonextPage = (path) =>  {
    this.router.gonextPage(path);
  }
  getCurrentRound() {
    if (this.gameResults.length === 0) return [];
    return (this.gameResults.at(-1));
  };
  
  getNumberOfSheed() {
    let numberOfSheed = 1;
    while (numberOfSheed < Object.keys(this.playersInfo).length) {
      numberOfSheed*=2;
    }
    return (numberOfSheed - Object.keys(this.playersInfo).length);
  }

  displayTournament() {
    let tmp = [];
    let nextRoundGames= [];
    let newRounds = [...(this.gameResults)];
    let update = true;

  //次の試合の組を計算

    if (this.gameResults.length === 0) {
      let sheed = this.getNumberOfSheed();
      for (const index of Object.keys(this.playersInfo)) {
        tmp.push({name: this.playersInfo[index], score:0, winner: true});
        if (0 < sheed) {
          tmp.push({name: "", score: 0, winner: false});
          sheed--;
        }
        if (tmp.length === 2) { 
          nextRoundGames.push({top: tmp[0], bottom: tmp[1]});
          tmp = [];
        }
      }
    } else {
        nextRoundGames = [];
        this.getCurrentRound().forEach(element => {
            if (element.top.winner && element.bottom.winner) update = false;
            tmp.push(element.top.winner ? element.top.name : element.bottom.name);
            if (tmp.length === 2) {
              nextRoundGames.push({top: {name: tmp[0], score: 0, winner: true }, bottom: {name: tmp[1], score: 0, winner: true}});
              tmp = [];
            }
        });
    }

    if (update && this.getCurrentRound().length === 1) {
      this.rounds = newRounds;
      setTimeout(this.gonextPage, 3000, "/gameresult");
      return ;
    }
    if (update && 0 < nextRoundGames.length) {
      this.gameResults = [...(this.gameResults), nextRoundGames];
      this.setRouteContext("gameResults", this.gameResults);
      newRounds.push(nextRoundGames);
    }
    //GameResultではまだ描かれていない、未来の試合を追加
    let numOfGames = update ? nextRoundGames.length : this.getCurrentRound().length;
    while (1 < numOfGames) {
      let extraRoundGames = [];
      for (let i = 0; i < numOfGames; i+=2) {
        extraRoundGames.push({top: {name: "", score: 0, winner: true }, bottom: {name: "", score: 0, winner: true}});
      }
      newRounds.push(extraRoundGames);
      numOfGames = Math.floor(numOfGames / 2);
    }
    this.rounds = newRounds;
    setTimeout(this.gonextPage, 3000, "/game");
  }

  get html(){
    return (`
        <h1>Pong-Game Tournament</h1>
    `)
  };
}

export default Tournament;
