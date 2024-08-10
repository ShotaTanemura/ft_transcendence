import { Component } from "../core/component.js";

export class MyRoomsContainer extends Component {
    constructor(router, params, state) {
        super(router, params, state);
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.removeEventListener('DOMContentLoaded', this.handleDOMContentLoaded);
        document.addEventListener('DOMContentLoaded', this.handleDOMContentLoaded.bind(this));
    }

    handleDOMContentLoaded() {
        const createChatroomButton = document.querySelector('.create-chatroom-button');
        const modal = document.getElementById('createChatroomModal');
        const closeModal = document.querySelector('.close-modal');
        const createChatroomForm = document.getElementById('createChatroomForm');

        createChatroomButton.addEventListener('click', () => {
            console.log('Create Chatroom button clicked');
            modal.style.display = 'block';
        });

        closeModal.addEventListener('click', () => {
            console.log('Close modal button clicked');
            modal.style.display = 'none';
        });

        createChatroomForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log('Form submitted');
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
                } else {
                    alert('Failed to create chatroom. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again later.');
            }
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                console.log('Window click detected, closing modal');
                modal.style.display = 'none';
            }
        });
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
