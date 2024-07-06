import { Component } from "../core/component.js";

export class Signup extends Component {
    constructor(router, params, state) {
        super(router, params, state);
        this.findElement("form.signup-form").onsubmit = this.handleSignup;
    }

    handleSignup = async (event) => {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        if (formData.get('password') !== form['repeat-password'].value) {
            alert("Passwords do not match!");
            return;
        }
        formData.delete('repeat-password');

        try {
            await this.registerUser(formData);
            this.router.goNextPage("/");
        } catch (error) {
            alert(error);
        }
    }

    registerUser = async (formData) => {
        const response = await fetch("/pong/api/v1/auth/register", {
            method: "POST",
            body: formData,
            // Content-Type ヘッダーは設定しない（ブラウザが自動的に設定する）
        });
        console.log(response);
        const data = await response.json();
        if (!response.ok) {
            throw Error(data.status);
        }
    }

    get html() {
        return `
            <div>
                <h1>Signup</h1>
                <form class="signup-form" enctype="multipart/form-data">
                    <label for="username">Username</label>
                    <input type="text" placeholder="username" id="username" name="name" required><br/>
                    <label for="password">Password</label>
                    <input type="password" placeholder="enter password" id="password" name="password" required><br/>
                    <label for="repeat-password">Repeat Password</label>
                    <input type="password" placeholder="repeat password" id="repeat-password" name="repeat-password" required><br/>
                    <label for="email">Email</label>
                    <input type="email" placeholder="email" id="email" name="email" required><br/>
                    <label for="icon">Icon</label>
                    <input type="file" id="icon" name="icon" accept="image/*"><br/>
                    <button class="form-submit" type="submit">sign up</button>
                </form>
            </div>
        `;
    }
}