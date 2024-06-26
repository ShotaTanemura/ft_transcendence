import {React, useContext, useEffect, useState} from 'react';
import {PlayersContext, GameResultsContext} from '../App.jsx';
import { useNavigate } from 'react-router-dom';
import Bracket from './Bracket';
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
  function getNumberOfSheed() {
    let numberOfSheed = 1;
    while (numberOfSheed < Object.keys(playersInfo).length) {
      numberOfSheed*=2;
    }
    return (numberOfSheed - Object.keys(playersInfo).length);
  }

  function displayTournament() {
    let tmp = [];
    let nextRoundGames= [];
    let newRounds = [...gameResults];
    let update = true;

  //次の試合の組を計算

    if (gameResults.length === 0) {
      let sheed = getNumberOfSheed();
      for (const index of Object.keys(playersInfo)) {
        tmp.push({name: playersInfo[index].name, score:0, winner: true});
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

  useEffect(() => {
    displayTournament()
  }, []);

  return (
    <div>
      <h1>Pong-Game Tournament</h1>
      <Bracket rounds={rounds} />
      <button onClick={handlesubmit}>Start next game</button>
    </div>
  );
};

export default Tournament;
