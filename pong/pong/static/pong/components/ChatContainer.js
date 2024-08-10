import { Component } from "../core/component.js";

export class ChatContainer extends Component {
    constructor(router, params, state) {
        super(router, params, state);
        console.log("this.html", this.html);
    }

    get html() {
        if (!this.selectedRoom) {
            return `<div class="chat">ルームを選択してください。</div>`;
        }

        return (`
            <div class="chat">
                <div class="header">
                    <img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
                    <div class="info">
                        <p>オンライン</p>
                    </div>
                    <button class="call-button">Call</button>
                </div>
                <div class="chat-messages">
                    <!-- ここにメッセージを表示するロジックを追加できます -->
                </div>
                <div class="input-area">
                    <input type="text" placeholder="Type a message">
                    <button>Send</button>
                </div>
            </div>
        `);
    }
}
