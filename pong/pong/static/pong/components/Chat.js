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

    get html() {
        const chatContainer = new ChatContainer(this.router, this.params, this.state);
        const myRoomsContainer = new MyRoomsContainer(this.router, this.params, this.state, (room) => {
            console.log('Room selected');
            chatContainer.refreshChat(room);
        });
        const directoryContainer = new DirectoryContainer(this.router, this.params, this.state, () => {
            myRoomsContainer.refreshRooms();
        });

        return (`
            <div class="parent-container">
                ${myRoomsContainer.html}
                ${chatContainer.html}
                ${directoryContainer.html}
            </div>
        `);
    }
}