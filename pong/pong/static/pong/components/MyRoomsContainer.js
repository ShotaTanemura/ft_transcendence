import { Component } from "../core/component.js";

export class MyRoomsContainer extends Component {
  constructor(router, params, state, onRoomSelected, socket) {
    super(router, params, state);
    this.onRoomSelected = onRoomSelected;
    this.socket = socket;
    this.rooms = [];

    this.eventListeners = {};

    if (this.socket) {
      this.setupWebSocketListeners();
    }
  }

  setWebSocket(socket) {
    this.socket = socket;
    this.setupWebSocketListeners();
  }

  setupWebSocketListeners() {
    this.socket.addEventListener("message", this.handleWebSocketMessage);
  }

  handleWebSocketMessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.rooms) {
      this.displayRooms(message.rooms);
      this.rooms = message.rooms;
    }
    if (message.invited_rooms) {
      this.displayInvitedRooms(message.invited_rooms);
    }
  };

  updateRoomsUI(rooms) {
    this.displayRooms(rooms);
    this.rooms = rooms;
  }

  updateInvitedRoomsUI(invitedRooms) {
    this.displayInvitedRooms(invitedRooms);
  }

  initializeEventListeners() {
    this.handleDOMContentLoaded();
    window.addEventListener("beforeunload", this.beforePageUnload);
  }

  beforePageUnload = () => {
    const {
      searchBarListener,
      roomTypeListener,
      createChatroomListener,
      closeModalListener,
      formSubmitListener,
      modalClickListener,
    } = this.eventListeners;

    if (searchBarListener) {
      const searchBar = document.querySelector(".search-bar input");
      if (searchBar) {
        searchBar.removeEventListener("input", searchBarListener);
      }
    }
    if (roomTypeListener) {
      const roomTypeSelect = document.getElementById("roomType");
      if (roomTypeSelect) {
        roomTypeSelect.removeEventListener("change", roomTypeListener);
      }
    }
    if (createChatroomListener) {
      const createChatroomButton = document.querySelector(
        ".create-chatroom-button",
      );
      if (createChatroomButton) {
        createChatroomButton.removeEventListener(
          "click",
          createChatroomListener,
        );
      }
    }
    if (closeModalListener) {
      const closeModal = document.querySelector(".close-modal");
      if (closeModal) {
        closeModal.removeEventListener("click", closeModalListener);
      }
    }
    if (formSubmitListener) {
      const createChatroomForm = document.getElementById("createChatroomForm");
      if (createChatroomForm) {
        createChatroomForm.removeEventListener("submit", formSubmitListener);
      }
    }
    if (modalClickListener) {
      window.removeEventListener("click", modalClickListener);
    }
  };

  handleDOMContentLoaded() {
    const searchBar = document.querySelector(".search-bar input");
    const roomTypeSelect = document.getElementById("roomType");
    const createChatroomButton = document.querySelector(
      ".create-chatroom-button",
    );
    const closeModal = document.querySelector(".close-modal");
    const createChatroomForm = document.getElementById("createChatroomForm");
    const modal = document.getElementById("createChatroomModal");

    this.eventListeners.searchBarListener = (event) => {
      const query = event.target.value.toLowerCase();
      this.displayRooms(this.rooms, query);
    };
    if (searchBar) {
      searchBar.addEventListener(
        "input",
        this.eventListeners.searchBarListener,
      );
    }

    this.eventListeners.roomTypeListener = (event) => {
      const emailField = document.getElementById("emailField");
      const emailInput = document.getElementById("email");
      if (event.target.value === "dm") {
        emailField.style.display = "block";
        emailInput.setAttribute("required", "true");
      } else {
        emailField.style.display = "none";
        emailInput.removeAttribute("required");
      }
    };
    if (roomTypeSelect) {
      roomTypeSelect.addEventListener(
        "change",
        this.eventListeners.roomTypeListener,
      );
    }

    this.eventListeners.createChatroomListener = () => {
      modal.style.display = "block";
    };
    if (createChatroomButton) {
      createChatroomButton.addEventListener(
        "click",
        this.eventListeners.createChatroomListener,
      );
    }

    this.eventListeners.closeModalListener = () => {
      modal.style.display = "none";
    };
    if (closeModal) {
      closeModal.addEventListener(
        "click",
        this.eventListeners.closeModalListener,
      );
    }

    this.eventListeners.formSubmitListener = (event) => {
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
    };
    if (createChatroomForm) {
      createChatroomForm.addEventListener(
        "submit",
        this.eventListeners.formSubmitListener,
      );
    }

    this.eventListeners.modalClickListener = (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
    window.addEventListener("click", this.eventListeners.modalClickListener);
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
