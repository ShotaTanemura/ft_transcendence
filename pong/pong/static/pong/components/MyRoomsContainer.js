import { Component } from "../core/component.js";

export class MyRoomsContainer extends Component {
    constructor(router, params, state) {
        super(router, params, state);
        this.onRoomSelect = onRoomSelect;
        this.initEventListeners();
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
