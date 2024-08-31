import { Component } from "../core/component.js";

export class DirectoryContainer extends Component {
    constructor(router, params, state) {
        super(router, params, state, '.directory-container');
        this.initializeEventListeners();
        this.fetchAndDisplayRooms();
    }

    initializeEventListeners() {
        // ページがロードされたらDOMContentLoadedの処理を実行
        window.addEventListener('load', () => {
            this.handleDOMContentLoaded();
        });
    }

    async fetchAndDisplayRooms(query = '') {
        try {
            const response = await fetch('/chat/api/v1/rooms/unjoined');
            if (response.ok) {
                const rooms = await response.json();
                this.displayRooms(rooms.rooms, query);
            } else {
                console.error('Failed to fetch rooms');
            }
        } catch (error) {
            alert('An error occurred. Please try again later.', error);
            console.error('Error fetching rooms:', error);
        }
    }

    displayRooms(rooms, query) {
        const myRoomsContainer = document.querySelector('.unjoined-rooms');
        myRoomsContainer.innerHTML = '';

        const filteredRooms = rooms.filter(room => 
            room.name.toLowerCase().includes(query.toLowerCase())
        );

        filteredRooms.forEach(room => {
            const roomElement = document.createElement('div');
            roomElement.className = 'room';
            roomElement.textContent = room.name;

            roomElement.addEventListener('click', () => {
                this.handleRoomClick(room);
            });

            myRoomsContainer.appendChild(roomElement);
        });
    }

    handleDOMContentLoaded() {
        console.log('handleDOMContentLoaded called');
        const searchBar = document.querySelector('.unjoined-search-bar input');
        console.log('searchBar:', searchBar);
        if (searchBar) {
            console.log('searchBar found');
            searchBar.addEventListener('input', (event) => {
                const query = event.target.value;
                this.fetchAndDisplayRooms(query);
            });
        } else {
            console.error('Search bar element not found.');
        }
    }

    get html() {
        return (
            `<div class="dir-container">
                <div class="header">
                    <h2>Directory</h2>
                    <div class="options">•••</div>
                </div>
                <div class="unjoined-search-bar">
                    <input type="text" placeholder="Search Chatroom">
                </div>
                <div class="unjoined-rooms"></div>
            </div>`
        );
    }
}