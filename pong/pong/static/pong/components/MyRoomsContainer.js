import { Component } from "../core/component.js";

export class MyRoomsContainer extends Component {
    constructor(router, params, state, onRoomSelected) {
        super(router, params, state);
        this.onRoomSelected = onRoomSelected;
        this.handleRoomClick = this.handleRoomClick.bind(this);
        this.fetchAndDisplayRooms().then(() => {
            this.initializeEventListeners();
        });
    }

    async fetchAndDisplayRooms(query = '') {
        try {
            const response = await fetch('/chat/api/v1/rooms');
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
        const myRoomsContainer = document.querySelector('.myrooms');
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

    handleRoomClick = (room) => {
        this.state.selectedRoom = room;
        console.log('Room selected from MyRoomsContainer: room:', room);
        console.log('Room selected from MyRoomsContainer: this', this.state.selectedRoom);
        if (this.onRoomSelected) {
            console.log('Room selected from MyRoomsContainer:', room);
            this.onRoomSelected(room);
        }
    }

    initializeEventListeners() {
        const createChatroomButton = document.querySelector('.create-chatroom-button');
        const modal = document.getElementById('createChatroomModal');
        const closeModal = document.querySelector('.close-modal');
        const createChatroomForm = document.getElementById('createChatroomForm');
        const searchBar = document.querySelector('.search-bar input');

        if (createChatroomButton) {
            createChatroomButton.addEventListener('click', () => {
                modal.style.display = 'block';
            });
        }

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        if (createChatroomForm) {
            createChatroomForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const formData = new FormData(createChatroomForm);
                const data = Object.fromEntries(formData.entries());

                try {
                    const response = await fetch('/chat/api/v1/rooms', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    });

                    if (response.ok) {
                        alert('Chatroom created successfully!');
                        modal.style.display = 'none';
                        this.fetchAndDisplayRooms();
                    } else {
                        alert('Failed to create chatroom. Please try again.');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('An error occurred. Please try again later.');
                }
            });
        }

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });

        if (searchBar) {
            searchBar.addEventListener('input', (event) => {
                const query = event.target.value;
                this.fetchAndDisplayRooms(query);
            });
        }
    }

    get html() {
        return (`
            <div class="myrooms-container">
                <div class="create-chatroom">
                    <button class="create-chatroom-button" type="button">Create Chatroom</button>
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
                        <button type="submit">Create</button>
                    </form>
                </div>
            </div>
        `);
    }
}