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
      password: event.target.password.value,
      email: event.target.email.value,
    });
    let response;
    try {
      response = await this.registerUser(signupJson);
    } catch (error) {
      alert(error);
      return;
    }

    let formData = new FormData();
    const fileField = event.target.icon;

    formData.append("icon", fileField.files[0]);

    try {
      await this.uploadIcon(response.uuid, formData);
      this.router.goNextPage("/");
    } catch (error) {
      alert(error);
    }
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
      throw Error(data.status);
    }
    return data;
  };

  uploadIcon = async (uuid, formData) => {
    const response = await fetch(`/pong/api/v1/users/${uuid}/icon`, {
      method: "POST",
      body: formData,
    });
    console.log(response);
    const data = await response.json();
    if (!response.ok) {
      throw Error(data.status);
    }
    return data;
  };

  get html() {
    return `
            <div>
                <h1>Signup</h1>
				<form 
					action="/pong/oauth/42/signup"
					method="GET"
					class="form-42oauth">
					<button class="form-42oauth" type=submit>42 Signup</button>
				</form>
                <form class="signup-form">
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
