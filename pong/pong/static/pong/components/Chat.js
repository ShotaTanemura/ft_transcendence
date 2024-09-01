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
        this.render();
    }

    verifyJwtToken = async () => {
        const response = await fetch("/pong/api/v1/auth/token/verify", {
            method: "POST",
        });
        if (!response.ok) {
            this.router.goNextPage("/");
        }
    }

    handleRoomSelected = (room) => {
        this.state.selectedRoom = room;
        this.render();
    }

    get html() {
        const myRoomsContainer = new MyRoomsContainer(this.router, this.params, this.state, this.handleRoomSelected);
        const directoryContainer = new DirectoryContainer(this.router, this.params, this.state, () => {
            myRoomsContainer.refreshRooms();
        });

        return (`
            <div class="parent-container">
                ${myRoomsContainer.html}
                ${new ChatContainer(this.router, this.params, this.state).html}
                ${directoryContainer.html}
            </div>
        `);
    }
}