import { Component } from "../core/component.js";

export class Profile extends Component {
    constructor(router, params, state) {
        super(router, params, state);
    }

    get html() {
        return (`
            <div class="profile-container">
                <div class="profile-header">
                    <h1>ユーザープロフィール</h1>
                </div>
                <div class="profile-content">
                    <div class="profile-picture">
						<img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img>
                    </div>
                    <div class="profile-details">
                        <p><strong>名前:</strong> 山田 太郎</p>
                        <p><strong>メールアドレス:</strong> taro.yamada@example.com</p>
                        <p><strong>電話番号:</strong> 090-1234-5678</p>
                        <p><strong>住所:</strong> 東京都新宿区1-2-3</p>
                    </div>
                </div>
            </div>
        `);
    }
}

