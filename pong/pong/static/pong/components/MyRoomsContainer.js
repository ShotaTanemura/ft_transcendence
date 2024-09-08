import { Component } from "../core/component.js";

export class MyRoomsContainer extends Component {
  constructor(router, params, state, onRoomSelected) {
    super(router, params, state);
    this.onRoomSelected = onRoomSelected;
    this.initializeEventListeners();
    this.connectToWebSocket();
  }

  initializeEventListeners() {
    document.removeEventListener(
      "DOMContentLoaded",
      this.handleDOMContentLoaded,
    );
    document.addEventListener(
      "DOMContentLoaded",
      this.handleDOMContentLoaded.bind(this),
    );
  }

  connectToWebSocket() {
    if (this.socket) {
      this.socket.close();
    }

    const wsUrl = "ws://" + window.location.host + "/ws/chat/rooms/";
    this.socket = new WebSocket(wsUrl);

    this.socket.addEventListener("open", () => {
      console.log("WebSocket connected URL:", wsUrl);
    });

    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      console.log(message);
      if (message.rooms) {
        this.displayRooms(message.rooms);
      }
    });

    this.socket.addEventListener("close", () => {
      console.log("WebSocket disconnected");
    });

    this.socket.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
    });
  }

  handleDOMContentLoaded() {
    const createChatroomButton = document.querySelector(
      ".create-chatroom-button",
    );
    const modal = document.getElementById("createChatroomModal");
    const closeModal = document.querySelector(".close-modal");
    const createChatroomForm = document.getElementById("createChatroomForm");

    createChatroomButton.addEventListener("click", () => {
      modal.style.display = "block";
    });

    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
    });

    createChatroomForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const chatroomName = document.getElementById("chatroomName").value;

      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(
          JSON.stringify({
            type: "create_chatroom",
            name: chatroomName,
          }),
        );
      }

      modal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  displayRooms(rooms, query = "") {
    const myRoomsContainer = document.querySelector(".myrooms");
    myRoomsContainer.innerHTML = "";

    const filteredRooms = rooms.filter(
      (room) =>
        room.name &&
        typeof room.name === "string" &&
        room.name.toLowerCase().includes(query.toLowerCase()),
    );

    filteredRooms.forEach((room) => {
      const roomElement = document.createElement("div");
      roomElement.className = "room";
      roomElement.textContent = room.name;

      roomElement.addEventListener("click", () => {
        this.handleRoomClick(room);
      });

      myRoomsContainer.appendChild(roomElement);
    });
  }
  handleRoomClick(room) {
    this.state.selectedRoom = room;
    if (this.onRoomSelected) {
      this.onRoomSelected(room);
    }
  }
  get html() {
    return `
            <div class="myrooms-container">
                <div class="create-chatroom">
                    <button class="create-chatroom-button" type="button">Create Chatroom</button>
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
                        <button type="submit">Create</button>
                    </form>
                </div>
            </div>
        `;
  }
}
