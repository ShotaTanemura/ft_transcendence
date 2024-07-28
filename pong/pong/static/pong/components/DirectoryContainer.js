import { Component } from "../core/component.js";

export class DirectoryContainer extends Component {
    constructor(router, params, state) {
        super(router, params, state, '.directory-container');
        this.initEventListeners();
    }

    async searchMessages(query) {
        console.log(`searchMessages called with query: ${query}`);
        try {
            const response = await fetch(`http://localhost:8001/chat/api/v1/rooms/search?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (response.ok) {
                console.log('Search rooms successful:', data.rooms);
                return data.rooms;
            } else {
                console.error('Failed to search rooms:', data.rooms);
                return [];
            }
        } catch (error) {
            console.error('Error searching rooms:', error);
            return [];
        }
    }

    async handleSearch(event) {
        console.log('handleSearch called');
        const query = event.target.value;
        console.log('Query:', query);
        if (event.key === 'Enter' && query.length > 0) {
            console.log('Enter key pressed with query:', query);
            const rooms = await this.searchMessages(query);
            this.updateMessages(rooms);
        }
    }

    updateMessages(rooms) {
        console.log("updateMessages called with rooms:", rooms);
        const roomsContainer = document.querySelector('.search-rooms');
        roomsContainer.innerHTML = rooms.map(room => 
            `<div class="searched-rooms" data-room-id="${room.uuid}">
                <img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
                <div class="searched-rooms-content">
                    <p class="name">${room.name}</p>
                    <button class="enter-room">Enter Room</button>
                </div>
            </div>`
        ).join('');

        document.querySelectorAll('.enter-room').forEach(button => {
            button.addEventListener('click', (event) => {
                const roomId = event.target.closest('.searched-rooms').dataset.roomId;
                this.openModal(roomId);
            });
        });
    }

    openModal(roomId) {
        const modal = document.getElementById('profile-modal');
        const submitButton = modal.querySelector('.submit-password');
        submitButton.dataset.roomId = roomId;
        modal.style.display = 'block';
    }

    async submitPassword(event) {
        const modal = document.getElementById('profile-modal');
        const roomId = event.target.dataset.roomId;
        console.log('Room ID:', event.target.dataset);
        const password = modal.querySelector('#room-password').value;

        try {
            const response = await fetch('http://localhost:8001/chat/api/v1/user_room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ room_id: roomId, password: password })
            });
            if (response.ok) {
                console.log('Password submitted successfully');
                alert('Chatroom created successfully!');
                modal.style.display = 'none';
            } else {
                alert('Failed to create chatroom: else');
                console.error('Failed to submit password');
            }
        } catch (error) {
            alert('Failed to create chatroom: catch');
            console.error('Error submitting password:', error);
        }
    }

    initEventListeners() {
        console.log('initEventListeners called');
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOMContentLoaded event fired');
            const items = document.querySelectorAll('.item');
            const modal = document.getElementById('profile-modal');
            const span = document.getElementsByClassName('close-button')[0];
            const searchBar = document.querySelector('.room-search-bar input');
            const submitButton = modal.querySelector('.submit-password');

            if (searchBar) {
                searchBar.addEventListener('keydown', (event) => {
                    console.log('Key pressed:', event.key);
                    this.handleSearch(event);
                });
            } else {
                console.error('Search bar element not found');
            }

            items.forEach(item => {
                item.addEventListener('click', function() {
                    const name = this.querySelector('.info h4').innerText;
                    const role = this.querySelector('.info p').innerText;
                    const imgSrc = this.querySelector('img').src;
                    profileName.innerText = name;
                    profileRole.innerText = role;
                    profileImg.src = imgSrc;
                    modal.style.display = 'block';
                });
            });

            span.onclick = function() {
                modal.style.display = 'none';
            };

            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = 'none';
                }
            };

            submitButton.addEventListener('click', (event) => {
                this.submitPassword(event);
            });
        });
    }

    get html() {
        const teamMembers = [
            { name: 'Florencio Dorrance', role: 'Market Development Manager' },
            { name: 'Benny Spanbauer', role: 'Area Sales Manager' },
            { name: 'Jamel Eusebio', role: 'Administrator' },
            { name: 'Lavern Laboy', role: 'Account Executive' },
            { name: 'Alfonzo Schuessler', role: 'Proposal Writer' },
            { name: 'Daryl Nehls', role: 'Nursing Assistant' }
        ];

        const files = [
            { name: 'i9.pdf', type: 'PDF', size: '9mb' },
            { name: 'Screenshot-3817.png', type: 'PNG', size: '4mb' },
            { name: 'sharefile.docx', type: 'DOC', size: '555kb' },
            { name: 'Jerry-2020_I-9_Form.xxl', type: 'XXL', size: '24mb' }
        ];

        const teamMembersHtml = teamMembers.map(member => 
            `<div class="item">
                <img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
                <div class="info">
                    <h4>${member.name}</h4>
                    <p>${member.role}</p>
                </div>
            </div>`
        ).join('');

        return (
            `<div class="dir-container">
                <div class="header">
                    <h2>Directory</h2>
                    <div class="options">•••</div>
                </div>
                <div class="section">
                    <h3>Team Members <span>(${teamMembers.length})</span></h3>
                    <div class="items">
                        ${teamMembersHtml}
                    </div>
                </div>
                <div class="section">
                <div class="room-search-bar">
                    <input type="text" placeholder="Search Chatroom">
                </div>
                <div class="search-rooms"></div>
                </div>
                <div id="profile-modal" class="modal">
                    <div class="modal-content">
                        <span class="close-button">&times;</span>
                        <input id="room-password" type="password" placeholder="Enter Room Password">
                        <button class="submit-password">Submit</button>
                    </div>
                </div>
            </div>`
        );
    }
}
