import { Component } from "../core/component.js";

export class DirectoryContainer extends Component {
    constructor(router, params, state) {
        super(router, params, state, '.directory-container');
        this.initializeEventListeners();
        this.fetchAndDisplayRooms();
    }

    initializeEventListeners() {
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

    handleRoomClick(room) {
        const modal = document.getElementById('joinChatroomModal');
        const modalRoomName = document.getElementById('modalRoomName');
        const confirmJoinButton = document.getElementById('confirmJoinButton');
        const cancelJoinButton = document.getElementById('cancelJoinButton');

        modalRoomName.textContent = room.name;
        modal.style.display = 'block';

        confirmJoinButton.onclick = async () => {
            try {
                const response = await fetch('/chat/api/v1/rooms/unjoined', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ room_id: room.uuid }),
                });

                if (response.ok) {
                    alert('You have successfully joined the chatroom!');
                    modal.style.display = 'none';
                    this.fetchAndDisplayRooms();
                } else {
                    alert('Failed to join the chatroom. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again later.');
            }
        };

        cancelJoinButton.onclick = () => {
            modal.style.display = 'none';
        };

        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    handleDOMContentLoaded() {
        const searchBar = document.querySelector('.unjoined-search-bar input');
        if (searchBar) {
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

                <!-- Modal for joining chatroom -->
                <div id="joinChatroomModal" class="modal">
                    <div class="modal-content">
                        <span class="close-modal">&times;</span>
                        <h2>Join Chatroom</h2>
                        <p id="modalRoomName"></p>
                        <button id="confirmJoinButton">Yes</button>
                        <button id="cancelJoinButton">No</button>
                    </div>
                </div>
            </div>`
        );
    }
}