import { Component } from "../core/component.js";

export class Signin extends Component {
    constructor(router, params, state) {
        super(router, params, state);
        this.findElement("form.signin-form").onsubmit = this.onSignin;
        this.findElement("#go_to_signup").onclick = this.goSignup
    }

    fetchPOSTData = async (JSONData) => {
        const response = await fetch("/pong/api/v1/auth/token", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSONData
        });
        console.log(response);
        const data = await response.json();
        if (!response.ok) {
            throw Error(data.status);
        }
    }

    onSignin = async (event) => {
        event.preventDefault();
        const signinJSON = JSON.stringify({
            "email": event.target.email.value,
            "password": event.target.password.value
        });

        try {
            await this.fetchPOSTData(signinJSON);
            // signin後の仮ページ
            this.router.goNextPage("/home");
        } catch (error) {
            alert(error);
        }
    }

    goSignup = () => {
        this.router.goNextPage("/signup");
    }

    get html() {
        return (`
            <h1>Signin</h1>
            <br/>
            <form class="signin-form">
                <label for="email">email: </label>
                <input id="email" name="email" placeholder="email" type="email" max="320" required/>
                </br>
                <class="password">
                <label for="password">password: </label>
                <input id="password" name="password" placeholder="password" type="password" max="64" required/>
                </br>
                <button type="submit">signin</button>
            </form>
            </br>
            <label for="go_to_signup">You don't have account ?</label>
            <button id="go_to_signup" name="go_to_signup" type="button">signup</button>
        `)

    }
}