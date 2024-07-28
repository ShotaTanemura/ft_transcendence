import { Component } from "../core/component.js";

export class DirectoryContainer extends Component {
    constructor(router, params, state) {
        super(router, params, state);
        this.initEventListeners();
    }

    async searchMessages(query) {
        console.log(`searchMessages called with query: ${query}`); // デバッグ用ログ
        try {
            const response = await fetch(`http://localhost:8001/chat/api/v1/rooms/search?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (response.ok) {
                return data.rooms;
            } else {
                console.error('Failed to search search-rooms:', data.rooms);
                return [];
            }
        } catch (error) {
            console.error('Error searching search-rooms:', error);
            return [];
        }
    }

    async handleSearch(event) {
        console.log('handleSearch called'); // デバッグ用ログ
        const query = event.target.value;
        console.log('Query:', query); // デバッグ用ログ
        if (event.key === 'Enter' && query.length > 0) {
            console.log('Enter key pressed with query:', query); // デバッグ用ログ
            const rooms = await this.searchMessages(query);
            this.updateMessages(rooms);
        }
    }

    updateMessages(search_rooms) {
        console.log("updateMessages called with search-rooms:", search_rooms); // デバッグ用ログ
        const search_roomsContainer = document.querySelector('.search-rooms');
        search_roomsContainer.innerHTML = search_rooms.map(message => `
            <div class="user-message">
                <img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
                <div class="message-content">
                    <p class="name">${message.name}</p>
               </div>
            </div>
        `).join('');
    }

    initEventListeners() {
        console.log('initEventListeners called'); // デバッグ用ログ
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOMContentLoaded event fired'); // デバッグ用ログ
            const items = document.querySelectorAll('.item');
            const modal = document.getElementById('profile-modal');
            const span = document.getElementsByClassName('close-button')[0];
            const profileName = document.getElementById('profile-name');
            const profileRole = document.getElementById('profile-role');
            const profileImg = document.getElementById('profile-img');
            const searchBar = document.querySelector('.room-search-bar input');

            console.log('Search bar element:', searchBar); // デバッグ用ログ

            if (searchBar) {
                searchBar.addEventListener('keydown', (event) => {
                    console.log('Key pressed:', event.key); // デバッグ用ログ
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

        const teamMembersHtml = teamMembers.map(member => `
            <div class="item">
                <img src="static/pong/images/snapchat.svg" alt="Profile Image" class="profile-img">
                <div class="info">
                    <h4>${member.name}</h4>
                    <p>${member.role}</p>
                </div>
            </div>
        `).join('');

        const search_rooms = Array(10).fill(`
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
            <div class="dir-container">
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
                    <input type="text" placeholder="Search Chatroom hahaha">
                </div>
                <div class="search-rooms">
                    ${search_rooms}
                </div>
                </div>
                <div id="profile-modal" class="modal">
                    <div class="modal-content">
                        <span class="close-button">&times;</span>
                        <img id="profile-img" class="profile-img"></h2>
                        <h2 id="profile-name"></h2>
                        <p id="profile-role"></p>
                    </div>
                </div>
            </div>
        `);
    }
}
