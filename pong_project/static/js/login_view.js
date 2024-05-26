import Component from "./component.js";

export default class LoginView extends Component {
    get html() {
        return `
<div class="login-view">
    <div class="container">       
        <div class="row">
            <input class="login-id" type="text" placeholder="ログインID" />
        </div>
        <div class="row">
            <input class="password" type="password" placeholder="パスワード" />
        </div>
        <div>
            <button class="login">ログイン</button>
        </div>
    </div>
</div>
        `;
    }
}