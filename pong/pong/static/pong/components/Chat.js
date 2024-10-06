import { Component } from "../core/component.js";
import { Header } from "./Header.js";
import { MyRoomsContainer } from "./MyRoomsContainer.js";
import { ChatContainer } from "./ChatContainer.js";
import { DirectoryContainer } from "./DirectoryContainer.js";

export class Chat extends Component {
  constructor(router, params, state) {
    super(router, params, state, ".parent-container");
    this.state = {
      selectedRoom: null,
      socketRooms: null,
      socketRoomSpecific: null,
    };
    this.uuid = null;

    this.initializeContainers();
    this.connectToRoomsWebSocket();

    this.verifyJwtToken();
    this.render();
  }

  connectToRoomsWebSocket() {
    if (this.state.socketRooms) {
      return;
    }

    const wsUrl = `wss://${window.location.host}/ws/chat/rooms/`;
    const socket = new WebSocket(wsUrl);

    socket.addEventListener("open", () => {
      console.log("WebSocket connected to rooms URL:", wsUrl);
      this.state.socketRooms = socket;

      if (this.myRoomsContainer) {
        this.myRoomsContainer.setWebSocket(socket);
        this.directoryContainer.setWebSocket(socket);
      }
    });

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);

      if (message.rooms) {
        this.myRoomsContainer.updateRoomsUI(message.rooms);
      }

      if (message.invited_rooms) {
        this.myRoomsContainer.updateInvitedRoomsUI(message.invited_rooms);
      }

      if (message.non_participation) {
        this.directoryContainer.updateNonParticipationRoomsUI(
          message.non_participation,
        );
      }
    });

    socket.addEventListener("close", () => {
      console.log("WebSocket disconnected (rooms)");
    });

    socket.addEventListener("error", (error) => {
      console.error("WebSocket error (rooms):", error);
    });
  }

  requestRoomRefresh() {
    if (
      this.state.socketRooms &&
      this.state.socketRooms.readyState === WebSocket.OPEN
    ) {
      const refreshMessage = JSON.stringify({ job_type: "refresh_rooms" });
      this.state.socketRooms.send(refreshMessage);
    } else {
      console.error("WebSocket connection is not open.");
    }
  }

  connectToRoomWebSocket(roomUuid) {
    if (this.state.socketRoomSpecific) {
      this.state.socketRoomSpecific.close();
    }

    const wsUrl = `wss://${window.location.host}/ws/chat/${roomUuid}/`;
    const socket = new WebSocket(wsUrl);

    socket.addEventListener("open", () => {
      console.log("WebSocket connected to room URL:", wsUrl);
      this.state.socketRoomSpecific = socket;
      this.directoryContainer.setupChatSocket(socket);
    });

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);

      if (message.user && message.message) {
        this.chatContainer.appendMessage(message, this.uuid);
      }
      if (message.users) {
        this.directoryContainer.refreshRoomMembers(message.users);
      }
    });

    socket.addEventListener("close", () => {
      console.log("WebSocket disconnected (room-specific)");
    });

    socket.addEventListener("error", (error) => {
      console.error("WebSocket error (room-specific):", error);
    });
  }

  initializeContainers() {
    this.chatContainer = new ChatContainer(
      this.router,
      this.params,
      this.state,
    );

    this.chatContainer.onSendMessage = (roomUuid, message) => {
      if (
        this.state.socketRoomSpecific &&
        this.state.socketRoomSpecific.readyState === WebSocket.OPEN
      ) {
        this.state.socketRoomSpecific.send(
          JSON.stringify({
            job_type: "send_message",
            room_uuid: roomUuid,
            message: message,
          }),
        );
      } else {
        console.error("WebSocket connection is not open for the room");
      }
    };

    this.chatContainer.onLeaveRoom = (roomUuid) => {
      if (
        this.state.socketRoomSpecific &&
        this.state.socketRoomSpecific.readyState === WebSocket.OPEN
      ) {
        this.state.socketRoomSpecific.send(
          JSON.stringify({
            job_type: "leave_room",
            room_uuid: roomUuid,
          }),
        );

        this.state.socketRoomSpecific.close();

        this.chatContainer.clear();
        this.requestRoomRefresh();
      } else {
        console.error("WebSocket connection is not open for the rooms");
      }
    };
    this.myRoomsContainer = new MyRoomsContainer(
      this.router,
      this.params,
      this.state,
      (room) => {
        this.state.selectedRoom = room.uuid;
        this.connectToRoomWebSocket(room.uuid);
        this.chatContainer.refreshChat(room);
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
      this.router.goNextPage("/signin");
    }
    const data = await response.json();

    const uuid = data.uuid;
    this.uuid = uuid;
  };

  afterPageLoaded() {
    this.headerComponent = new Header(this.router, this.params, this.state);
    this.element.parentElement.prepend(this.headerComponent.element);
    this.headerComponent.afterPageLoaded();
  }

  beforePageUnload() {
    this.element.parentElement.removeChild(this.headerComponent.element);
  }

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
