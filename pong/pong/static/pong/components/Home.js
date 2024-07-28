// signin後の仮ページ

import { Component } from "../core/component.js";

export class Home extends Component {
	constructor(router, params, state) {
		super (router, params, state);
		this.findElement("button.go-realtime-button").onclick = this.goRealtime
		this.findElement("form.signout-form").onsubmit = this.handleSignout;
        this.verifyJwtToken();
	}

	goRealtime = () => {
		this.router.goNextPage("/pong-game-home");
	}

    verifyJwtToken = async () => {
        const response = await fetch("/pong/api/v1/auth/token/verify", {
            method: "POST",
        });
        console.log(response);
        const data = await response.json();
        if (!response.ok) {
            this.router.goNextPage("/");
        }
    }

    handleSignout = async (event) => {
        event.preventDefault();
        try {
            await this.revokeToken();
            this.router.goNextPage("/");
        } catch (error) {
            alert(error);
        }
    }

    revokeToken = async () => {
        const response = await fetch("/pong/api/v1/auth/token/revoke", {
            method: "POST",
        });
        console.log(response);
        const data = await response.json();
        if (!response.ok) {
            throw Error(data.status);
        }
    }

	get html() {
		return (`
			<h1> signin後の仮ページ </h1>
			<button class="go-realtime-button">リアルタイム対戦をする</button>
            <form class="signout-form">
                <button type="submit">signout</button>
            </form>
		`)
	}
}

