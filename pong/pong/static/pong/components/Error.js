import { Component } from "../core/component.js";

export class Error extends Component {
  constructor(router, parameters, state) {
    super(router, parameters, state);
    this.findElement("button.go-home").onclick = this.onClick;
  }
  onClick = () => {
    this.router.goNextPage("/");
  };

  get html() {
    return `
      <main class="text-center p-5">
        <h1> Oops! Page Not Found </h1>
        <button class="btn btn-primary go-home">Home</button>
      </main>
        `;
  }
}

export default Error;
