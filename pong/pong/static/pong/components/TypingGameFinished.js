import { Component } from "../core/component.js";
import { Load } from "./Load.js";

export class TypingGameFinished extends Component {
  constructor(router, parameters, state) {
    new Load(router, parameters, state).onload();
    super(router, parameters, state);
    this.findElement("button.go-back-to-game-home").onclick = this.onClick;
  }

  onClick = () => {
    this.goNextPage("/typing-game-home");
  };

  get html() {
    return `	
    <h1>congratulation ${this.getRouteContext("TypingGameWinner")}!!</h1>
      <button class="go-back-to-game-home">go back to game home</button>
		`;
  }
}

export default TypingGameFinished;
