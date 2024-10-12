import { Component } from "../core/component.js";

export class Signup extends Component {
  constructor(router, params, state) {
    super(router, params, state);
    this.findElement("form.signup-form").onsubmit = this.handleSignup;
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
      default:
        break;
    }
  }

  handleSignup = async (event) => {
    event.preventDefault();
    const signupJson = JSON.stringify({
      name: event.target.username.value,
      nickname: event.target.nickname.value,
      password: event.target.password.value,
      email: event.target.email.value,
    });
    try {
      await this.registerUser(signupJson);
    } catch (error) {
      alert(error);
      return;
    }

    this.router.goNextPage("/");
  };

  registerUser = async (jsonData) => {
    const response = await fetch("/pong/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: jsonData,
    });
    console.log(response);
    const data = await response.json();

    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw Error("不正なリクエストです");
        case 409:
          throw Error(
            "既に存在するユーザー名, メールアドレスまたはニックネームです",
          );
        default:
          throw Error(data.status);
      }
    }
    return data;
  };

  get html() {
    return `
    	<main class="signup">
        <div class="signup-container">
          <h1>Signup</h1>
				  <form
				  	action="/pong/oauth/42/signup"
				  	method="GET"
            class="form-42oauth"
          >
				  	<button class="form-42oauth" type=submit>42 Signup</button>
				  </form>
          <form class="signup-form">
            <label for="username">Username</label>
            <input type="text" placeholder="username" id="username" name="name" required><br/>
            <label for="nickname">NickName</label>
            <input type="text" placeholder="nickname" id="nickname" name="nickname" required><br/>
            <label for="email">Email</label>
            <input type="email" placeholder="email" id="email" name="email" required><br/>
            <label for="password">Password</label>
            <input type="password" placeholder="enter password" id="password" name="password" required><br/>
            <label for="repeat-password">Repeat Password</label>
            <input type="password" placeholder="repeat password" id="repeat-password" name="repeat-password" required><br/>
            <button class="form-submit" type="submit">sign up</button>
          </form>
          </div>
        </main>
        `;
  }
}
