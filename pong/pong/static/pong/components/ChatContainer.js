import { Component } from "../core/component.js";

export class ChatContainer extends Component {
    constructor(router, params, state) {
        super(router, params, state);
    }

    get html() {
        return (`
            <div class="chat">
                <div class="header">
                    <img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
                    <div class="info">
                        <h2>Masahito Arai</h2>
                        <p>Online</p>
                    </div>
                    <button class="call-button">Call</button>
                </div>
                <div class="chat-messages">
                    <div class="message received">
                        <img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
                        <div class="text">おはよう</div>
                    </div>
                    <div class="message received">
                        <img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
                        <div class="text">おはよう ⏰</div>
                    </div>
                    <div class="message sent">
                        <div class="text">wooohooo</div>
                        <img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
                    </div>
                    <div class="message sent">
                        <div class="text">mmmmmmmm</div>
                        <img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
                    </div>
                    <div class="message sent">
                        <div class="text">Haha 😂</div>
                        <img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
                    </div>
                    <div class="message received">
                        <img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
                        <div class="text">awwww</div>
                    </div>
                    <div class="message received">
                        <img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
                        <div class="text">omg, this is amazing</div>
                    </div>
                    <div class="message received">
                        <img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
                        <div class="text">wooohooo 🔥</div>
                    </div>
                </div>
                <div class="input-area">
                    <input type="text" placeholder="Type a message">
                    <button>Send</button>
                </div>
            </div>
        `);
    }
}
