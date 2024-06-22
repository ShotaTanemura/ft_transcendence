
import { Component } from "../core/component.js";
// import './Chat.css';

export class Chat extends Component {
	constructor(router, params, state) {
		super (router, params, state);
	}

	get html() {
		return (`
            <main class="chat-container">
				<div class="container">
					<div class="sidebar">
					<p>Chat</p>
					</div>
					<div class="messages">
						<p>Messages</p>
					</div>
					<div class="chat-window">
						<p>Chat Window</p>
					</div>
					<div class="directory">
						<p>Directory</p>
					</div>
				</div>
            </main>
		`)
	}
}
