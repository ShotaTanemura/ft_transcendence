import { Component } from "../core/component.js";

export class Signin extends Component {
	constructor(router, params, state) {
		super(router, params, state);
		this.findElement("form.signup-form").onsubmit = this.onSubmit;
	}

	onSubmit = async (event) => {
		event.preventDefault();
		let username = this.findElement("#username").value;
		let password = this.findElement("#password").value;
		let repeatPassword = this.findElement("#repeat-password").value;
		let email = this.findElement("#email").value;
		if (password !== repeatPassword) {
			alert("password and repeat password are not same.");
			return;
		}
		const data = {"name": username, "password": password, "email": email};
		const response = await fetch("/pong/api/v1/auth/register", {
			method: "POST",
			mode: "cors",
			cache: "no-cache",
			credentials: "same-origin",
			headers: {
			  "Content-Type": "application/json",
			},
			redirect: "follow",
			referrerPolicy: "no-referrer",
			body: JSON.stringify(data),
		  });
		console.log(response.json());
	}

	get html() {
		return `
			<div>
				<h1>Signup</h1>
				<form class="signup-form">
					<label for="username">Username</label>
					<input type=text placeholder="username" id="username" name="username" required></input><br/>
					<label for="password">Password</label>
					<input type=password placeholder="enter password" id="password" name="password" required></input><br/>
					<label for="repeat-password">Repeat Password</label>
					<input type=password placeholder="repeat password" id="repeat-password" name="repeat-password" required></input><br/>
					<label for="email">Email</label>
					<input type=email placeholder="email"id="email" name="email" required></input><br/>
					<button class="form-submit" type=submit>sign up</button>
				</form>
			</div>
		`;
	}
}