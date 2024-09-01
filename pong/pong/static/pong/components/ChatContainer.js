import { Component } from "../core/component.js";

export class ChatContainer extends Component {
    constructor(router, params, state) {
        super(router, params, state, '.chat-container');
        this.render();
    }

    render() {
        super.render();
    }

    get html() {
        const { selectedRoom } = this.state;

        if (!selectedRoom) {
            return `<div class="chat">Select a room</div>`;
        }
        
        return `
            <div class="chat">
                <h2>${selectedRoom.uuid}</h2>
                <h2>${selectedRoom.name}</h2>
            </div>
        `;
    }
}