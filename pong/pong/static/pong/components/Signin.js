import { Component } from "../core/component.js";

export class Signin extends Component {
    constructor(router, params, state) {
        super(router, params, state);
        this.findElement("form.signin-form").onsubmit = this.handleSignin;
        this.findElement("#go-signup").onclick = this.goSignup
    }

    handleSignin = async (event) => {
        event.preventDefault();
        const signinJson = JSON.stringify({
            "email": event.target.email.value,
            "password": event.target.password.value
        });
        try {
            await this.generateToken(signinJson);
            this.router.goNextPage("/home");
        } catch (error) {
            alert(error);
        }
    }

    generateToken = async (jsonData) => {
        const response = await fetch("/pong/api/v1/auth/token", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonData
        });
        console.log(response);
        const data = await response.json();
        if (!response.ok) {
            throw Error(data.status);
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
            <label for="go-signup">You don't have account ?</label>
            <button id="go-signup" name="go-signup" type="button">signup</button>
        `)

    }
}
