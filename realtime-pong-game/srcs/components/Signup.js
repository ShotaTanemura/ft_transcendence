//TODO passwordやusernameのvalidationの要件がDjangoの要件と一致していない
//TODO エラーページやログイン画面への遷移を書いていない。
//TODO passwordをhash化してから送っていない。
import { Component } from "../core/component";
import "./Signup.css"

export class Signup extends Component {
    constructor(router, params, state) {
        super(router, params, state);
        this.findElement("form.signup-form").onsubmit = this.onSignup;
    }

    fetchPOSTData = async (JSONData) => {
        try {
            const response = await fetch("/pong/api/v1/auth/register", {
                method: "POST",
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSONData
            });
            const data = await response.json();
            if (!response.ok) {
                throw Error(data.status);
            }
        } catch(error) {
            //Go To Error Page !
        }
    }

    onSignup = (event) => {
        event.preventDefault();
        if (event.target.password.value != event.target.confirm_password.value){
            alert("Passwords do not match");
            return ;
        }

        const signupJSON = JSON.stringify({
            "name": event.target.username.value,
            "email": event.target.email.value,
            "password": event.target.password.value
        });
        this.fetchPOSTData(signupJSON);
        //Go to Login Page!
    }

    get html() {
        return (`
            <h1>WAAAAAOUH!! Welcome to Pong Game!</h1>
            <h1>Signup</h1>
            <br/>
            <form class="signup-form">
                <ul>
                    <li class="username">
                        <label for="username">username: </label>
                        <input id="username" name="username" placeholder="username" type="text" max="20" required/>
                    </li>
                    <li class="email">
                        <label for="email">email: </label>
                        <input id="email" name="email" placeholder="email" type="email" max="320" required/>
                    </li>
                    <li class="password">
                        <label for="password">password: </label>
                        <input id="password" name="password" placeholder="password" type="password" max="64" required/>
                    </li>
                    <li class= "confirm-password">
                        <label for="confirm_password">confirm password: </label>
                        <input id="confirm_password" name="comfirm_password" placeholder="confirm_password" type="password" max="64" required/>
                    <li>
                    <button>submit</button>
                <ul/>
            </form>
        `);
    }
}

export default Signup;
