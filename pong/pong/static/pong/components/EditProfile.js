import { Component } from "../core/component.js";

export class EditProfile extends Component {
  constructor(router, params, state) {
	super(router, params, state);
  }

  get html() {
    return `
      <h1>Edit Profile</h1>
    `;
  }
}
