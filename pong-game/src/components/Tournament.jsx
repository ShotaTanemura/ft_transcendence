import {React, useContext, useState} from 'react';
import {PlayersContext, GameResultsContext} from '../App.jsx';
import { useNavigate } from 'react-router-dom';
import Bracket from './Bracket';
import VictoryScreen from './VictoryScreen.jsx';
import './Tournament.css';

export const Tournament = () => {
  const {playersInfo, setPlayersInfo} = useContext(PlayersContext);
  const {gameResults, setGameResults} = useContext(GameResultsContext);
  const [rounds, setRounds] = useState([]);
  const navigate = useNavigate();
  // ここでサーバーにPlayersInfoの順番をシャッフルしてもらう。

  // 前の対戦が終わってtournamentに処理が移った時に実行する、トーナメントのアップデートを行うモック
  function getCurrentRound() {
    if (gameResults.length === 0) return [];
    return (gameResults[gameResults.length - 1]);
  }

  function MockdiplayTournament() {
    let tmp = [];
    let nextRoundGames= [];
    let newRounds = [...gameResults];
    let update = true;

    function getNearestPowerOfTwo(num) {
      let power = 1;
      while (power < num) {
        power *= 2;
      }
      return power;
    };

  //次の試合の組を計算
    if (gameResults.length === 0) {
      let numberOfPlayers = Object.keys(playersInfo).length;
      let playerNames = Object.keys(playersInfo).map(id => { return playersInfo[id].name; } );
      let nearestPowerOfTwoPlayers = getNearestPowerOfTwo(numberOfPlayers );
      let numberOfAbsentPlayers = nearestPowerOfTwoPlayers - numberOfPlayers;
      let emptyNames = new Array(numberOfAbsentPlayers).fill('');
 
      let firstRoundGames = [];
      let nextRoundGamesPlayersNames = new Array();

      for (let i = 0, length = nearestPowerOfTwoPlayers; i < length; i++) {
        if (playerNames.length !== 0) {
          nextRoundGamesPlayersNames.push(playerNames.shift());
        }
        if (numberOfAbsentPlayers === 0) continue;
        if (emptyNames.length !== 0) {
          nextRoundGamesPlayersNames.push(emptyNames.shift());
          // emptyNames.splice(i, 1);
        }
      }
      for (let i = 0, length = nextRoundGamesPlayersNames.length; i < length; i++) {
        let top = {name: nextRoundGamesPlayersNames[i], score: 0, winner: true };
        if (top.name === '') top.winner = false;
        let bottom = {name: nextRoundGamesPlayersNames[i+1], score: 0, winner: true };
        if (bottom.name === '') bottom.winner = false;
        firstRoundGames.push({top: top, bottom: bottom});
        i++;
      }
      nextRoundGames = [...firstRoundGames];
    } else {
        nextRoundGames = [];
        getCurrentRound().forEach(element => {
            if (element.top.winner && element.bottom.winner) update = false;
            tmp.push(element.top.winner ? element.top.name : element.bottom.name);
            if (tmp.length === 2) {
              nextRoundGames.push({top: {name: tmp[0], score: 0, winner: true }, bottom: {name: tmp[1], score: 0, winner: true}});
              tmp = [];
            }
        });
    }

    if (update && getCurrentRound().length === 1) {
      navigate("/victory");
    }
    if (update && 0 < nextRoundGames.length) {
      setGameResults([...gameResults, nextRoundGames])
      newRounds.push(nextRoundGames);
    }
    //GameResultではまだ描かれていない、未来の試合を追加
    let numOfGames = update ? nextRoundGames.length : getCurrentRound().length;
    while (1 < numOfGames) {
      let extraRoundGames = [];
      for (let i = 0; i < numOfGames; i+=2) {
        extraRoundGames.push({top: {name: "", score: 0, winner: true }, bottom: {name: "", score: 0, winner: true}});
      }
      newRounds.push(extraRoundGames);
      numOfGames = Math.floor(numOfGames / 2);
    }
    setRounds(newRounds);
  }

  const handlesubmit = () => {
    navigate('/pong');
  };

  // ゲーム終了時の結果を反映するためのモック
  function MockGameFinished() {
    let count = 0;
    if (gameResults.length < 1) {
      console.log("error!")
      return ;
    }
    gameResults[gameResults.length - 1].forEach((element) => {
        element.top.winner = false;
        element.bottom.score = 100;
    });
  }

  return (
    <div>
      <h1>Pong-Game Tournament</h1>
      <button onClick={MockdiplayTournament}>MockDisplayTournament</button>
      <button onClick={handlesubmit}>Start next gaame</button>
      <Bracket rounds={rounds} />
    </div>
  );
};

export default Tournament;
