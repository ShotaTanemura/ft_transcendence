import { Component } from "../core/component.js";

export class MyRoomsContainer extends Component {
  constructor(router, params, state, onRoomSelected, socket) {
    super(router, params, state);
    this.onRoomSelected = onRoomSelected;
    this.socket = socket;
    this.rooms = [];

    if (this.socket) {
      this.setupWebSocketListeners();
    }
  }

  setWebSocket(socket) {
    this.socket = socket;
    this.setupWebSocketListeners();
  }

  setupWebSocketListeners() {
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.rooms) {
        this.displayRooms(message.rooms);
        this.rooms = message.rooms;
      }
      if (message.invited_rooms) {
        this.displayInvitedRooms(message.invited_rooms);
      }
    });
  }

  updateRoomsUI(rooms) {
    this.displayRooms(rooms);
    this.rooms = rooms;
  }

  updateInvitedRoomsUI(invitedRooms) {
    this.displayInvitedRooms(invitedRooms);
  }

  initializeEventListeners() {
    this.handleDOMContentLoaded();
  }

  handleDOMContentLoaded() {
    const createChatroomButton = document.querySelector(
      ".create-chatroom-button",
    );
    const modal = document.getElementById("createChatroomModal");
    const closeModal = document.querySelector(".close-modal");
    const createChatroomForm = document.getElementById("createChatroomForm");
    const roomTypeSelect = document.getElementById("roomType");
    const emailField = document.getElementById("emailField");
    const emailInput = document.getElementById("email");
    const searchBar = document.querySelector(".search-bar input");

    searchBar.addEventListener("input", (event) => {
      const query = event.target.value.toLowerCase();
      this.displayRooms(this.rooms, query);
    });

    roomTypeSelect.addEventListener("change", (event) => {
      if (event.target.value === "dm") {
        emailField.style.display = "block";
        emailInput.setAttribute("required", "true");
      } else {
        emailField.style.display = "none";
        emailInput.removeAttribute("required");
      }
    });

    createChatroomButton.addEventListener("click", () => {
      modal.style.display = "block";
    });

    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
    });

    createChatroomForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const chatroomName = document.getElementById("chatroomName").value;
      const roomType = document.getElementById("roomType").value;
      const email = document.getElementById("email").value;

      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        const chatroomData = {
          job_type: "create_chatroom",
          name: chatroomName,
          room_type: roomType,
        };

        if (roomType === "dm") {
          chatroomData.email = email;
        }

        this.socket.send(JSON.stringify(chatroomData));
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
    if (!myRoomsContainer) {
      return;
    }
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

  displayInvitedRooms(invitedRooms) {
    const invitedRoomsContainer = document.querySelector(".invited-rooms");
    if (!invitedRoomsContainer) {
      return;
    }
    invitedRoomsContainer.innerHTML = "";

    invitedRooms.forEach((room) => {
      const roomElement = document.createElement("div");
      roomElement.className = "invited-room";
      roomElement.textContent = room.name;

      roomElement.addEventListener("click", () => {
        this.handleInvitedRoomClick(room);
      });

      invitedRoomsContainer.appendChild(roomElement);
    });
  }

  handleRoomClick(room) {
    this.state.selectedRoom = room;
    if (this.onRoomSelected) {
      this.onRoomSelected(room);
    }
  }

  handleInvitedRoomClick(room) {
    if (this.socket.readyState === WebSocket.OPEN) {
      const inviteRequest = {
        job_type: "invited_room",
        room_uuid: room.uuid,
        status: "active",
      };

      this.socket.send(JSON.stringify(inviteRequest));
    }
    this.state.selectedRoom = room;
    if (this.onRoomSelected) {
      this.onRoomSelected(room);
    }
  }

  get html() {
    return `
        <div class="myrooms-container">
            <div class="create-chatroom">
                <button class="create-chatroom-button" type="button">チャットルームの作成</button>
            </div>
            <div class="search-bar">
                <input type="text" placeholder="チャットルームの検索">
            </div>
            <div class="myrooms"></div>
            <div class="invited-rooms-container">
                <h3>招待されているDM</h3>
                <div class="invited-rooms"></div>
            </div>
        </div>
        <div id="createChatroomModal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>チャットルームの作成</h2>
                <form id="createChatroomForm">
                    <label for="chatroomName">ルームの名前</label>
                    <input type="text" id="chatroomName" name="name" required>

                    <label for="roomType">ルームタイプ</label>
                    <select id="roomType" name="room_type" required>
                        <option value="group">Group</option>
                        <option value="dm">Direct Message</option>
                    </select>

                    <div id="emailField" style="display:none;">
                        <label for="email">Invite Email</label>
                        <input type="email" id="email" name="email">
                    </div>

                    <button type="submit">作成</button>
                </form>
            </div>
        </div>
    `;
  }
}
