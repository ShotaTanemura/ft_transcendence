import { Component } from "../core/component.js";
import { MyRoomsContainer } from "./MyRoomsContainer.js";
import { ChatContainer } from "./ChatContainer.js";
import { DirectoryContainer } from "./DirectoryContainer.js";

export class Chat extends Component {
    constructor(router, params, state) {
        super(router, params, state);
        this.containerSelector = ".parent-container";
        this.state = {
            selectedRoom: null,
        };

        this.verifyJwtToken();
        this.handleRoomSelect = this.handleRoomSelect.bind(this);
        this.setState = this.setState.bind(this); 
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
        console.log("Chat setState 呼び出し:", newState);
        super.setState(newState);
    }

    handleRoomSelect(room) {
        console.log("handleRoomSelect 呼び出し:", this.state.selectedRoom);
        console.log("選択された部屋:", room);
        this.setState({ selectedRoom: room });
    }

    render() {
        console.log("Chat render 呼び出し");
        super.render();
    }

    get html() {
        return (`
            <div class="parent-container">
                ${new MyRoomsContainer(this.router, this.params, this.state, this.handleRoomSelect).html}
                ${new ChatContainer(this.router, this.params,this.state, this.state.selectedRoom).html}
                ${new DirectoryContainer(this.router, this.params, this.state).html}
            </div>
        `);
    }
}
