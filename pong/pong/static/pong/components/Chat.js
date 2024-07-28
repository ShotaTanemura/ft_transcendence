import { Component } from "../core/component.js";
import { MyRoomsContainer } from "./MyRoomsContainer.js";
import { ChatContainer } from "./ChatContainer.js";
import { DirectoryContainer } from "./DirectoryContainer.js";

export class Chat extends Component {
    constructor(router, params, state) {
        super(router, params, state, '.parent-container');
        this.state = {
            selectedRoom: null,
        };

        this.verifyJwtToken();
        this.handleRoomSelect = this.handleRoomSelect.bind(this);
        this.setState = this.setState.bind(this);
        this.render();
    }

    verifyJwtToken = async () => {
        const response = await fetch("/pong/api/v1/auth/token/verify", {
            method: "POST",
        });
        const data = await response.json();
        if (!response.ok) {
            this.router.goNextPage("/");
        }
    }

    setState(newState, callback) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...newState };
        this.update(prevState, this.state);
        if (callback) callback();
        this.render();
    }

    handleRoomSelect(room) {
        this.setState({ selectedRoom: room }, () => {
            console.log("Room selected (after):", this.state.selectedRoom);
        });
		this.render();
    }

    get html() {
        const selectedRoomName = this.state.selectedRoom ? this.state.selectedRoom.name : "No room selected";
        return (`
            <div class="parent-container">
                ${selectedRoomName}
                ${new MyRoomsContainer(this.router, this.params, this.state, this.handleRoomSelect).html}
                ${new ChatContainer(this.router, this.params, this.state, this.state.selectedRoom).html}
                ${new DirectoryContainer(this.router, this.params, this.state).html}
            </div>
        `);
    }
}
