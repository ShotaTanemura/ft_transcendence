import { Component } from "../core/component.js";

export class MyRoomsContainer extends Component {
    constructor(router, params, state, onRoomSelect) {
        super(router, params, state);
        this.onRoomSelect = onRoomSelect;
        this.initEventListeners();
    }

    async fetchMessages() {
        try {
            const response = await fetch('http://localhost:8001/chat/api/v1/rooms');
            const data = await response.json();
            if (response.ok) {
                return data.rooms;
            } else {
                console.error('Failed to fetch myrooms:', data.message);
                return [];
            }
        } catch (error) {
            console.error('Error fetching myrooms:', error);
            return [];
        }
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
                return data.rooms;
            } else {
                console.error('Failed to search myrooms:', data.rooms);
                return [];
            }
        } catch (error) {
            console.error('Error searching myrooms:', error);
            return [];
        }
    }

    async handleSearch(event) {
        const query = event.target.value;
        const rooms = await this.searchMessages(query);
        this.updateMessages(rooms);
    }

    updateMessages(myrooms) {
        const myroomsContainer = document.querySelector('.myrooms');
        myroomsContainer.innerHTML = myrooms.map(room => `
            <div class="myroom" data-room-id="${room.uuid}">
                <img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
                <div class="message-content">
                    <p class="name">${room.name}</p>
                </div>
            </div>
        `).join('');

        myroomsContainer.querySelectorAll('.myroom').forEach(roomElement => {
            roomElement.addEventListener('click', () => {
                const roomId = roomElement.getAttribute('data-room-id');
                const selectedRoom = myrooms.find(room => room.uuid === roomId);
                this.onRoomSelect(selectedRoom);
            });
        });
    }

    async initMessages() {
        const myrooms = await this.fetchMessages();
        this.updateMessages(myrooms);
    }

    initEventListeners() {
        document.addEventListener('DOMContentLoaded', async () => {
            await this.initMessages();
            
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
        return (`
            <div class="myrooms-container">
                <div class="create-chatroom">
                    <button class="create-chatroom-button">Create Chatroom</button>
                </div>
                <div class="search-bar">
                    <input type="text" placeholder="Search Chatroom">
                </div>
                <div class="myrooms"></div>
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
