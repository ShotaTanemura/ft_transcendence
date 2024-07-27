import { Component } from "../core/component.js";

export class MessagesContainer extends Component {
    constructor(router, params, state) {
        super(router, params, state);
        this.initEventListeners();
    }

    initEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            const createChatroomButton = document.querySelector('.create-chatroom-button');
            const modal = document.querySelector('#createChatroomModal');
            const closeModalButton = document.querySelector('.close-modal');
            const form = document.querySelector('#createChatroomForm');

            createChatroomButton.addEventListener('click', () => {
                modal.style.display = 'block';
            });

            closeModalButton.addEventListener('click', () => {
                modal.style.display = 'none';
            });

            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const chatroomName = document.querySelector('#chatroomName').value;
                const password = document.querySelector('#password').value;
                const status = document.querySelector('#status').value;

                const formData = {
                    name: chatroomName,
                    password: password,
                    status: status
                };

                const response = await fetch('/chat/api/v1/create_chat_room', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData),
                });

                const data = await response.json();
                if (response.ok) {
                    alert('Chatroom created successfully!');
                    modal.style.display = 'none';
                } else {
                    alert('Failed to create chatroom: ' + data.message);
                }
            });
        });
    }

    get html() {
        const messages = Array(10).fill(`
            <div class="user-message">
                <img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
                <div class="message-content">
                    <p class="name">Masahito Arai</p>
                    <p class="text">Haha oh man 🔥</p>
                    <div class="tags">
                        <span class="tag question">Question</span>
                        <span class="tag help-wanted">Help wanted</span>
                    </div>
                </div>
                <span class="time">12m</span>
            </div>
        `).join('');

        return (`
            <div class="messages-container">
                <div class="create-chatroom">
                    <button class="create-chatroom-button">Create Chatroom</button>
                </div>
                <div class="search-bar">
                    <input type="text" placeholder="Search messages">
                </div>
                <div class="messages">
                    ${messages}
                </div>
            </div>
            <div id="createChatroomModal" class="modal">
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Create Chatroom</h2>
                    <form id="createChatroomForm">
                        <label for="chatroomName">Chatroom Name</label>
                        <input type="text" id="chatroomName" name="name" required>
                        
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required>

                        <label for="status">Status</label>
                        <select id="status" name="status" required>
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>

                        <button type="submit">Create</button>
                    </form>
                </div>
            </div>
        `);
    }
}




// import { Component } from "../core/component.js";

// export class MessagesContainer extends Component {
//     constructor(router, params, state) {
//         super(router, params, state);
//     }

//     get html() {
//         const messages = Array(10).fill(`
//             <div class="user-message">
//                 <img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
//                 <div class="message-content">
//                     <p class="name">Masahito Arai</p>
//                     <p class="text">Haha oh man 🔥</p>
//                     <div class="tags">
//                         <span class="tag question">Question</span>
//                         <span class="tag help-wanted">Help wanted</span>
//                     </div>
//                 </div>
//                 <span class="time">12m</span>
//             </div>
//         `).join('');

//         return (`
//             <div class="messages-container">
//                 <div class="search-bar">
//                     <input type="text" placeholder="Search messages">
//                 </div>
//                 <div class="messages">
//                     ${messages}
//                 </div>
//             </div>
//         `);
//     }
// }
