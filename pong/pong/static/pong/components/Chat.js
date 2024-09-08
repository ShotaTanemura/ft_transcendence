import { Component } from "../core/component.js";
import { MyRoomsContainer } from "./MyRoomsContainer.js";
import { ChatContainer } from "./ChatContainer.js";
import { DirectoryContainer } from "./DirectoryContainer.js";

export class Chat extends Component {
  constructor(router, params, state) {
    super(router, params, state, ".parent-container");
    this.state = {
      selectedRoom: null,
      socket: null,
    };

    this.initializeContainers();
    this.connectToWebSocket();

    this.verifyJwtToken();
    this.render();
  }

  connectToWebSocket() {
    if (this.state.socket) {
      this.state.socket.close();
    }

    const wsUrl = "ws://" + window.location.host + "/ws/chat/rooms/";
    const socket = new WebSocket(wsUrl);

    socket.addEventListener("open", () => {
      console.log("WebSocket connected URL:", wsUrl);
      this.state.socket = socket;

      if (this.myRoomsContainer) {
        this.myRoomsContainer.setWebSocket(socket);
        this.directoryContainer.setWebSocket(socket);
      }
    });

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      console.log(message);
    });

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);

      if (data.rooms) {
        console.log("Rooms:", data.rooms);
        this.myRoomsContainer.updateRoomsUI(data.rooms);
      }

      if (data.invited_rooms) {
        console.log("Invited Rooms:", data.invited_rooms);
        this.myRoomsContainer.updateInvitedRoomsUI(data.invited_rooms);
      }

      if (data.non_participation) {
        console.log("Non-Participation Rooms:", data.non_participation);
        this.directoryContainer.updateNonParticipationRoomsUI(
          data.non_participation,
        );
      }
    };

    socket.addEventListener("close", () => {
      console.log("WebSocket disconnected");
    });

    socket.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
    });
  }

  initializeContainers() {
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
        this.chatContainer.refreshChat(room);
      },
      this.state.socket,
    );
    this.directoryContainer = new DirectoryContainer(
      this.router,
      this.params,
      this.state,
      () => {
        this.myRoomsContainer.refreshRooms();
      },
      this.state.socket,
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
