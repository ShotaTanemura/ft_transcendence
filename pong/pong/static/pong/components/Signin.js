import { Component } from "../core/component.js";

export class Signin extends Component {
  constructor(router, params, state) {
    super(router, params, state);
    this.findElement("form.signin-form").onsubmit = this.handleSignin;
    this.findElement("#go-signup").onclick = this.goSignup;
    switch (window.location.hash) {
      case "#methodNotAllowed":
        window.alert("リクエストメソッドが不適切です");
        break;
      case "#failedToGetCode":
        window.alert("認証コードの取得に失敗しました");
        break;
      case "#invalidParameters":
        window.alert("パラメーターが不正です");
        break;
      case "#failedToGetToken":
        window.alert("認証トークンの取得に失敗しました");
        break;
      case "#failedToGetUserInfo":
        window.alert("ユーザー情報の取得に失敗しました");
        break;
      case "#userAlreadyExists":
        window.alert("既に存在するユーザーです");
        break;
      case "#userDoesNotExist":
        window.alert("該当するユーザーが存在しません");
        break;
      default:
        break;
    }
  }

  handleSignin = async (event) => {
    event.preventDefault();
    const signinJson = JSON.stringify({
      email: event.target.email.value,
      password: event.target.password.value,
    });
    try {
      const status = await this.generateToken(signinJson);
      if (status === "2FAIsRequired") {
        // 2FAが必要な場合、/totpに遷移する
        this.router.goNextPage("/totp");
      } else {
        // 2FAが必要でなければホームページに遷移する
        this.router.goNextPage("/");
      }
    } catch (error) {
      alert(error);
    }
  };

  generateToken = async (jsonData) => {
    const response = await fetch("/pong/api/v1/auth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: jsonData,
    });
    const data = await response.json();
    if (!response.ok) {
      if (data.status === "2FAIsRequired") {
        // 2FAが必要な場合はそのステータスを返す
        return "2FAIsRequired";
      }
      throw Error(data.status);
    }
    return "Success";
  };

  goSignup = () => {
    this.router.goNextPage("/signup");
  };

  get html() {
    return `
        <main class="signin">
        	<div class="signin-container">
            <h1>Signin</h1>
            <br/>
            <form 
                action="/pong/oauth/42/signin"
                method="GET"
                class="form-42oauth">
                <button class="form-42oauth" type=submit>42 Signin</button>
            </form>
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
          </div>
        </main>
        `;
  }
}
