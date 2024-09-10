import { Component } from "../core/component.js";

export class PongGameRoom extends Component {
  constructor(router, parameters, state) {
    super(router, parameters, state);
    this.findElement("button.ready").onclick = this.onClick;
    this.connection = this.getRouteContext("WebSocket");
  }

  onClick = () => {
    this.connection.send(JSON.stringify({ sender: "user", type: "ready" }));
  };

  get html() {
    return `
			<label>Are you ready?</label>
			<button class="ready">I'm ready.</button>
		`;
  }
}

export default PongGameRoom;
