import { Component } from "../core/component.js";

export class MessagesContainer extends Component {
    constructor(router, params, state) {
        super(router, params, state);
        this.initEventListeners();
    }

    async fetchRoomStatuses() {
        try {
            const response = await fetch('http://localhost:8001/chat/api/v1/room_status');
            const data = await response.json();
            if (response.ok) {
                return data.room_statuses;
            } else {
                console.error('Failed to fetch room statuses:', data.message);
                return [];
            }
        } catch (error) {
            console.error('Error fetching room statuses:', error);
            return [];
        }
    }

    async populateStatusDropdown() {
        const statusDropdown = document.querySelector('#status');
        const statuses = await this.fetchRoomStatuses();
        statuses.forEach(status => {
            const option = document.createElement('option');
            option.value = status.status;
            option.textContent = status.status.charAt(0).toUpperCase() + status.status.slice(1);
            statusDropdown.appendChild(option);
        });
    }

    async searchMessages(query) {
        try {
            const response = await fetch(`http://localhost:8001/chat/api/v1/rooms?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (response.ok) {
                return data.rooms
            } else {
                console.error('Failed to search messages:', data.rooms);
                return [];
            }
        } catch (error) {
            console.error('Error searching messages:', error);
            return [];
        }
    }

    async handleSearch(event) {
        const query = event.target.value;
        if (event.key === 'Enter' && query.length > 0) {
            const rooms = await this.searchMessages(query);
            this.updateMessages(rooms);
        }
    }

    updateMessages(messages) {
        console.log("test");
        console.log(messages);
        const messagesContainer = document.querySelector('.messages');
        messagesContainer.innerHTML = messages.map(message => `
            <div class="user-message">
                <img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
                <div class="message-content">
                    <p class="name">${message.name}</p>
               </div>
            </div>
        `).join('');
    }

    initEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            const createChatroomButton = document.querySelector('.create-chatroom-button');
            const modal = document.querySelector('#createChatroomModal');
            const closeModalButton = document.querySelector('.close-modal');
            const form = document.querySelector('#createChatroomForm');
            const searchBar = document.querySelector('.search-bar input');

            createChatroomButton.addEventListener('click', () => {
                modal.style.display = 'block';
                this.populateStatusDropdown();
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

            searchBar.addEventListener('keydown', this.handleSearch.bind(this));
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
                    <input type="text" placeholder="Search Chatroom">
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
                        </select>

                        <button type="submit">Create</button>
                    </form>
                </div>
            </div>
        `);
    }
}


