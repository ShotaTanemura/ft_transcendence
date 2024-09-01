import { Component } from "../core/component.js";
import { MyRoomsContainer } from "./MyRoomsContainer.js";
import { ChatContainer } from "./ChatContainer.js";
import { DirectoryContainer } from "./DirectoryContainer.js";

export class Chat extends Component {
  constructor(router, params, state) {
    super(router, params, state, ".parent-container");
    this.state = {
      selectedRoom: null,
    };

    this.initializeContainers();

    this.verifyJwtToken();
    this.render();
  }

  initializeContainers() {
    console.log("Chat: Initialize containers");
    this.chatContainer = new ChatContainer(
      this.router,
      this.params,
      this.state,
    );
    this.myRoomsContainer = new MyRoomsContainer(
      this.router,
      this.params,
      this.state,
      (room) => {
        console.log("Room selected");
        this.chatContainer.refreshChat(room);
        this.chatContainer.render();
      },
    );
    this.directoryContainer = new DirectoryContainer(
      this.router,
      this.params,
      this.state,
      () => {
        this.myRoomsContainer.refreshRooms();
      },
    );
  }

  verifyJwtToken = async () => {
    const response = await fetch("/pong/api/v1/auth/token/verify", {
      method: "POST",
    });
    if (!response.ok) {
      this.router.goNextPage("/");
    }
  };

  get html() {
    if (
      !this.myRoomsContainer ||
      !this.chatContainer ||
      !this.directoryContainer
    ) {
      return "";
    }

    return `
            <div class="parent-container">
                ${this.myRoomsContainer.html}
                ${this.chatContainer.html}
                ${this.directoryContainer.html}
            </div>
        `;
  }
}
