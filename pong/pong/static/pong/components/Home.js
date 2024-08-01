// signin後の仮ページ

import { Component } from "../core/component.js";

export class Home extends Component {
	constructor(router, params, state) {
		super (router, params, state);
        this.findElement("button.go-realtime-pong-button").onclick = this.goRealtimePong
        this.findElement("button.go-realtime-typing-button").onclick = this.goRealtimeTyping
		this.findElement("form.signout-form").onsubmit = this.handleSignout;
        this.verifyJwtToken();
	}

	goRealtimePong = () => {
		this.router.goNextPage("/pong-game-home");
	}

    goRealtimeTyping = () => {
		this.router.goNextPage("/typing-game-home");
	}

    verifyJwtToken = async () => {
        const responseToken = await fetch("/pong/api/v1/auth/token/verify", {
            method: "POST",
        });
        console.log(responseToken);
        if (responseToken.ok) {
            return ;
        }
        const responseRefreshToken = await fetch("/pong/api/v1/auth/token/refresh", {
            method: "POST",
        });
        console.log(responseRefreshToken);
        if (responseRefreshToken.ok) {
            return ;
        }
        this.router.goNextPage("/");
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
			<button class="go-realtime-pong-button">ポングゲーム</button>
            <br>
			<button class="go-realtime-typing-button">タイピングゲーム</button>
            <form class="signout-form">
                <button type="submit">signout</button>
            </form>
		`)
	}
}

