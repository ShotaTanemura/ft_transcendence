import { Component } from "../core/component.js";

export class Chat extends Component {
	constructor(router, params, state) {
		super (router, params, state);
	}

	get html() {
		return (`
            <div class="chat-container">
				<div class="messages-container">
						<div class="search-bar">
							<input type="text" placeholder="Search messages">
						</div>
						<div class="messages">
							<div class="message">
								<img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
								<div class="message-content">
									<p class="name">Elmer Laverty</p>
									<p class="text">Haha oh man 🔥</p>
									<div class="tags">
										<span class="tag question">Question</span>
										<span class="tag help-wanted">Help wanted</span>
									</div>
								</div>
								<span class="time">12m</span>
							</div>
							<div class="message">
								<img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
								<div class="message-content">
									<p class="name">Elmer Laverty</p>
									<p class="text">Haha oh man 🔥</p>
									<div class="tags">
										<span class="tag question">Question</span>
										<span class="tag help-wanted">Help wanted</span>
									</div>
								</div>
								<span class="time">12m</span>
							</div>
							<div class="message">
								<img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
								<div class="message-content">
									<p class="name">Elmer Laverty</p>
									<p class="text">Haha oh man 🔥</p>
									<div class="tags">
										<span class="tag question">Question</span>
										<span class="tag help-wanted">Help wanted</span>
									</div>
								</div>
								<span class="time">12m</span>
							</div>
							<div class="message">
								<img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
								<div class="message-content">
									<p class="name">Elmer Laverty</p>
									<p class="text">Haha oh man 🔥</p>
									<div class="tags">
										<span class="tag question">Question</span>
										<span class="tag help-wanted">Help wanted</span>
									</div>
								</div>
								<span class="time">12m</span>
							</div>
							<div class="message">
								<img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
								<div class="message-content">
									<p class="name">Elmer Laverty</p>
									<p class="text">Haha oh man 🔥</p>
									<div class="tags">
										<span class="tag question">Question</span>
										<span class="tag help-wanted">Help wanted</span>
									</div>
								</div>
								<span class="time">12m</span>
							</div>
							<div class="message">
								<img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
								<div class="message-content">
									<p class="name">Elmer Laverty</p>
									<p class="text">Haha oh man 🔥</p>
									<div class="tags">
										<span class="tag question">Question</span>
										<span class="tag help-wanted">Help wanted</span>
									</div>
								</div>
								<span class="time">12m</span>
							</div>
							<div class="message">
								<img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
								<div class="message-content">
									<p class="name">Elmer Laverty</p>
									<p class="text">Haha oh man 🔥</p>
									<div class="tags">
										<span class="tag question">Question</span>
										<span class="tag help-wanted">Help wanted</span>
									</div>
								</div>
								<span class="time">12m</span>
							</div>
							<div class="message">
								<img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
								<div class="message-content">
									<p class="name">Elmer Laverty</p>
									<p class="text">Haha oh man 🔥</p>
									<div class="tags">
										<span class="tag question">Question</span>
										<span class="tag help-wanted">Help wanted</span>
									</div>
								</div>
								<span class="time">12m</span>
							</div>
							<div class="message">
								<img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
								<div class="message-content">
									<p class="name">Elmer Laverty</p>
									<p class="text">Haha oh man 🔥</p>
									<div class="tags">
										<span class="tag question">Question</span>
										<span class="tag help-wanted">Help wanted</span>
									</div>
								</div>
								<span class="time">12m</span>
							</div>
							<div class="message">
								<img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
								<div class="message-content">
									<p class="name">Elmer Laverty</p>
									<p class="text">Haha oh man 🔥</p>
									<div class="tags">
										<span class="tag question">Question</span>
										<span class="tag help-wanted">Help wanted</span>
									</div>
								</div>
								<span class="time">12m</span>
							</div>
							<div class="message">
								<img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
								<div class="message-content">
									<p class="name">Elmer Laverty</p>
									<p class="text">Haha oh man 🔥</p>
									<div class="tags">
										<span class="tag question">Question</span>
										<span class="tag help-wanted">Help wanted</span>
									</div>
								</div>
								<span class="time">12m</span>
							</div>
							<div class="message">
								<img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
								<div class="message-content">
									<p class="name">Elmer Laverty</p>
									<p class="text">Haha oh man 🔥</p>
									<div class="tags">
										<span class="tag question">Question</span>
										<span class="tag help-wanted">Help wanted</span>
									</div>
								</div>
								<span class="time">12m</span>
							</div>
							<div class="message">
								<img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
								<div class="message-content">
									<p class="name">Elmer Laverty</p>
									<p class="text">Haha oh man 🔥</p>
									<div class="tags">
										<span class="tag question">Question</span>
										<span class="tag help-wanted">Help wanted</span>
									</div>
								</div>
								<span class="time">12m</span>
							</div>
							<div class="message">
								<img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
								<div class="message-content">
									<p class="name">Elmer Laverty</p>
									<p class="text">Haha oh man 🔥</p>
									<div class="tags">
										<span class="tag question">Question</span>
										<span class="tag help-wanted">Help wanted</span>
									</div>
								</div>
								<span class="time">12m</span>
							</div>
						</div>
					</div>
            </div>
		`)
	}
}
