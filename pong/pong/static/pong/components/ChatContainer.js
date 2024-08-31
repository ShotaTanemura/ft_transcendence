import { Component } from "../core/component.js";

export class ChatContainer extends Component {
    constructor(router, params, state) {
        super(router, params, state, '.chat-container');
        this.fetchAndDisplayChat();
    }

    async fetchAndDisplayChat() {
        const { selectedRoom } = this.state;
        console.log('selectedRoom:', selectedRoom);
        if (!selectedRoom) {
            this.render();
            return;
        }
        console.log('Fetching chat data...');

        try {
            const response = await fetch(`/chat/api/v1/rooms/${selectedRoom.uuid}`);
            if (response.ok) {
                const chatData = await response.json();
                console.log('chatData:', chatData);
                this.state.chatData = chatData;
                this.render();
            } else {
                console.error('Failed to fetch chat data');
            }
        } catch (error) {
            console.error('Error fetching chat data:', error);
        }
    }

    render() {
        super.render();
    }

    get html() {
        const { selectedRoom, chatData } = this.state;

        if (!selectedRoom) {
            return `<div class="chat">Select a room</div>`;
        }

        if (!chatData) {
            return `<div class="chat">Loading...</div>`;
        }

        return `
            <div class="chat">
                <h2>Room UUID: ${chatData.uuid}</h2>
                <h2>Room Name: ${chatData.name}</h2>
                <div class="messages">
                    ${chatData.messages.map(message => `
                        <div class="message">
                            <strong>${message.sender}</strong>: ${message.text}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}