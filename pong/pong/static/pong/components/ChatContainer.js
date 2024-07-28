import { Component } from "../core/component.js";

export class ChatContainer extends Component {
    constructor(router, params, state,selectedRoom) {
        super(router, params, state);
        this.selectedRoom = selectedRoom;
        console.log("ChatContainer constructor called with selectedRoom:", selectedRoom);
    }

    get html() {
        console.log("ChatContainer get html called with selectedRoom:", this.selectedRoom);
        if (!this.selectedRoom) {
            return `<div class="chat">ルームを選択してください。</div>`;
        }

        return (`
            <div class="chat">
                <div class="header">
                    <img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
                    <div class="info">
                        <h2>${this.selectedRoom.name}</h2>
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
