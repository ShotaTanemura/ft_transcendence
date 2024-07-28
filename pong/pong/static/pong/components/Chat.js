import { Component } from "../core/component.js";
import { MyRoomsContainer } from "./MyRoomsContainer.js";
import { ChatContainer } from "./ChatContainer.js";
import { DirectoryContainer } from "./DirectoryContainer.js";

export class Chat extends Component {
    constructor(router, params, state) {
        super(router, params, state);
        this.state = {
            selectedRoom: null,
        };
        
        this.verifyJwtToken();
        this.handleRoomSelect = this.handleRoomSelect.bind(this);
        this.setState = this.setState.bind(this); 
        this.render();
        this.containerSelector = ".parent-container";
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

    setState(newState) {
        super.setState(newState);
    }

    handleRoomSelect(room) {
        this.setState({ selectedRoom: room });
    }


    get html() {
        return (`
            <div class="parent-container">
                ${this.state.selectedRoom}
                <h1>hoge</h1>
                ${new MyRoomsContainer(this.router, this.params, this.state, this.handleRoomSelect).html}
                ${new ChatContainer(this.router, this.params,this.state, this.state.selectedRoom).html}
                ${new DirectoryContainer(this.router, this.params, this.state).html}
            </div>
        `);
    }
}
