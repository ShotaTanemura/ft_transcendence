import {React, useContext, useState} from 'react';
import {PlayersContext} from '../App.jsx';
import Bracket from './Bracket';
import './Tournament.css';

export const Tournament = () => {
  const {PlayersInfo, setPlayersInfo} = useContext(PlayersContext);
  const [GameResult, setGameResult] = useState([]);
  // ここでサーバーにPlayersInfoの順番をシャッフルしてもらう。

  // 前の対戦が終わってtournamentに処理が移った時に実行する、トーナメントのアップデートを行うモック
  function diplayTournament(next_round_games) {
    var tmp = [];
    var next_round_games= [];
  //次の試合の組を計算
    for (const index of Object.keys(PlayersInfo)) {
      if (PlayersInfo[index].is_advancing === true) tmp.push(PlayersInfo[index]);
      if (tmp.length === 2) { 
        next_round_games.push({top: {name: tmp[0].name, score: 0, winner: true }, bottom: {name: tmp[1].name, score: 0, winner: true}})
        tmp = [];
      }
    }
    //最後に確定した試合を保存
    setGameResult(PreResult => [...PreResult, next_round_games])
    //GameResultではまだ描かれていない、未来の試合を追加
  }
  // ゲーム終了時の結果を反映するためのモック
  function MockGameFinished() {
    let count = 0;
    for (const index of Object.keys(PlayersInfo)) {
      if (PlayersInfo[index].is_advancing)  count++;
      if (count % 2) setPlayersInfo(((players)=>{players[index].is_advancing = false; return players}));
    }
    console.log(PlayersInfo);
  }

  let rounds = GameResult

  // ダミーデータ
  //const rounds = [
  // [
  //   { top: { name: 'Lousville', score: 79, winner: true }, bottom: { name: 'NC A&T', score: 48, winner: false } },
  //   { top: { name: 'Colo St', score: 84, winner: true }, bottom: { name: 'Missouri', score: 72, winner: false } },
  //   { top: { name: 'Oklahoma St', score: 55, winner: false }, bottom: { name: 'Oregon', score: 68, winner: true } },
  //   { top: { name: 'Saint Louis', score: 64, winner: true }, bottom: { name: 'New Mexico St', score: 44, winner: false } },
  //   { top: { name: 'Memphis', score: 54, winner: true }, bottom: { name: 'St Mary\'s', score: 52, winner: false } },
  //   { top: { name: 'Mich St', score: 65, winner: true }, bottom: { name: 'Valparaiso', score: 54, winner: false } },
  //   { top: { name: 'Creighton', score: 67, winner: true }, bottom: { name: 'Cincinnati', score: 63, winner: false } },
  //   { top: { name: 'Duke', score: 73, winner: true }, bottom: { name: 'Albany', score: 61, winner: false } }
  // ],
  // [
  //   { top: { name: 'Lousville', score: 82, winner: true }, bottom: { name: 'Colo St', score: 56, winner: false } },
  //   { top: { name: 'Oregon', score: 74, winner: true }, bottom: { name: 'Saint Louis', score: 57, winner: false } },
  //   { top: { name: 'Memphis', score: 48, winner: false }, bottom: { name: 'Mich St', score: 70, winner: true } },
  //   { top: { name: 'Creighton', score: 50, winner: false }, bottom: { name: 'Duke', score: 66, winner: true } }
  // ],
  // [
  //   { top: { name: 'Lousville', score: 77, winner: true }, bottom: { name: 'Oregon', score: 69, winner: false } },
  //   { top: { name: 'Mich St', score: 61, winner: false }, bottom: { name: 'Duke', score: 71, winner: true } }
  // ],
  // [
  //   { top: { name: 'Lousville', score: 85, winner: true }, bottom: { name: 'Duke', score: 63, winner: false } }
  // ]
  //];

  return (
    <div>
      <h1>Pong-Game Tournament - Midwest Bracket</h1>
      <button onClick={diplayTournament}>display tournament</button>
      <button onClick={MockGameFinished}>MockGameFinished</button>
      <Bracket rounds={rounds} />
    </div>
  );
};

export default Tournament;
