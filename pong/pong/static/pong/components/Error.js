import { Component } from "../core/component.js";

export class Error extends Component {
  constructor(router, parameters, state) {
    super(router, parameters, state);
    this.findElement("button.go-home").onclick = this.onClick;
  }
  onClick = () => {
    this.router.goNextPage("/home");
  };

  get html() {
    return `
          <h1> Oops  Error occured!</h1>
          <button class="go-home">go Home</button>
        `;
  }
}

export default Error;
