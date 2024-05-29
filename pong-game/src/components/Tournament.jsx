import {React, useContext, useState} from 'react';
import {PlayersContext, GameResultsContext} from '../App.jsx';
import Bracket from './Bracket';
import './Tournament.css';

export const Tournament = () => {
  const {playersInfo, setPlayersInfo} = useContext(PlayersContext);
  const {gameResults, setGameResults} = useContext(GameResultsContext);
  const [rounds, setRounds] = useState([]);
  // ここでサーバーにPlayersInfoの順番をシャッフルしてもらう。

  // 前の対戦が終わってtournamentに処理が移った時に実行する、トーナメントのアップデートを行うモック
  function MockdiplayTournament() {
    let tmp = [];
    let next_round_games= [];
    let new_rounds = gameResults;

  //次の試合の組を計算
    for (const index of Object.keys(playersInfo)) {
      if (playersInfo[index].is_advancing) tmp.push(playersInfo[index]);
      if (tmp.length === 2) { 
        next_round_games.push({top: {name: tmp[0].name, score: 0, winner: true }, bottom: {name: tmp[1].name, score: 0, winner: true}});
        tmp = [];
      }
    }
    if (0 < next_round_games.length) {
      setGameResults([...gameResults, next_round_games])
      new_rounds.push(next_round_games);
    }
    //GameResultではまだ描かれていない、未来の試合を追加
    let num_of_games = next_round_games.length;
    while (1 < num_of_games) {
      let extra_round_games = [];
      for (let i = 0; i < num_of_games; i+=2) {
        extra_round_games.push({top: {name: "", score: 0, winner: true }, bottom: {name: "", score: 0, winner: true}});
      }
      new_rounds.push(extra_round_games);
      num_of_games = Math.floor(num_of_games / 2);
    }
    setRounds(new_rounds);
  }
  // ゲーム終了時の結果を反映するためのモック
  function MockGameFinished() {
    let count = 0;
    for (const index of Object.keys(playersInfo)) {
      if (playersInfo[index].is_advancing)  count++;
      if (count % 2) setPlayersInfo(((players)=>{players[index].is_advancing = false; return players}));
    }
  }

  return (
    <div>
      <h1>Pong-Game Tournament</h1>
      <button onClick={MockdiplayTournament}>MockDisplayTournament</button>
      <button onClick={MockGameFinished}>MockGameFinished</button>
      <Bracket rounds={rounds} />
    </div>
  );
};

export default Tournament;
