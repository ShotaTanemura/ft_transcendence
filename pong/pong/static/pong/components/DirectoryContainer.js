import { Component } from "../core/component.js";

export class DirectoryContainer extends Component {
  constructor(router, params, state, onRoomJoined, socket) {
    super(router, params, state, ".directory-container");
    this.onRoomJoined = onRoomJoined;
    this.socket = socket;
    this.initializeEventListeners();
    this.chatSocket = null;
    if (this.socket) {
      this.setupWebSocketListeners();
    }
  }

  initializeEventListeners() {
    window.addEventListener("load", () => {
      this.handleDOMContentLoaded();
    });
  }

  setWebSocket(socket) {
    this.socket = socket;
    this.setupWebSocketListeners();
  }
  setupChatSocket(socket) {
    this.chatSocket = socket;
  }

  refreshRoomMembers(users) {
    const membersContainer = document.querySelector(".members-list");
    membersContainer.innerHTML = "";

    users.forEach((user) => {
      const memberElement = document.createElement("div");
      memberElement.className = "member";
      memberElement.textContent = user.name;

      memberElement.addEventListener("click", (event) => {
        this.showMemberOptions(event, user);
      });

      membersContainer.appendChild(memberElement);
    });
  }

  showMemberOptions(event, user) {
    const optionsContainer = document.createElement("div");
    optionsContainer.className = "member-options";

    const select = document.createElement("select");
    select.innerHTML = `
      <option value="">選択してください</option>
      <option value="profile">プロフィール表示</option>
      <option value="block">ブロック</option>
    `;

    select.addEventListener("change", (event) => {
      const selectedOption = event.target.value;
      if (selectedOption === "profile") {
        this.showUserProfile(user, optionsContainer);
      } else if (selectedOption === "block") {
        this.blockUser(user, optionsContainer);
      }
    });

    optionsContainer.appendChild(select);
    document.body.appendChild(optionsContainer);

    optionsContainer.style.position = "absolute";
    optionsContainer.style.top = `${event.clientY}px`;
    optionsContainer.style.left = `${event.clientX}px`;
  }

  showUserProfile(user, optionsContainer) {
    optionsContainer.remove();
    alert(`ユーザー ${user.name} のプロフィールを表示します。`);
  }

  blockUser(user, optionsContainer) {
    if (this.chatSocket && this.chatSocket.readyState === WebSocket.OPEN) {
      const blockRequest = {
        job_type: "block_user",
        user_uuid: user.uuid,
        status: "blocked",
      };

      console.log("Block Request:", blockRequest);
      this.chatSocket.send(JSON.stringify(blockRequest));

      alert(`${user.name} をブロックしました。`);

      optionsContainer.remove();
    } else {
      alert("WebSocketが接続されていません。");
    }
  }

  setupWebSocketListeners() {
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);

      if (message.non_participation) {
        this.updateNonParticipationRoomsUI(message.non_participation);
      }

      if (message.users) {
        this.refreshRoomMembers(message.users);
      }
    });
  }

  updateNonParticipationRoomsUI(rooms) {
    this.displayRooms(rooms);
  }

  displayRooms(rooms, query = "") {
    const unjoinedRoomsContainer = document.querySelector(".unjoined-rooms");
    unjoinedRoomsContainer.innerHTML = "";

    const filteredRooms = rooms.filter((room) =>
      room.name.toLowerCase().includes(query.toLowerCase()),
    );

    filteredRooms.forEach((room) => {
      const roomElement = document.createElement("div");
      roomElement.className = "room";
      roomElement.textContent = room.name;

      roomElement.addEventListener("click", () => {
        this.handleRoomClick(room);
      });

      unjoinedRoomsContainer.appendChild(roomElement);
    });
  }

  handleRoomClick(room) {
    const modal = document.getElementById("joinChatroomModal");
    const modalRoomName = document.getElementById("modalRoomName");
    const confirmJoinButton = document.getElementById("confirmJoinButton");
    const cancelJoinButton = document.getElementById("cancelJoinButton");

    modalRoomName.textContent = room.name;
    modal.style.display = "block";

    confirmJoinButton.onclick = () => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        const joinRequest = {
          job_type: "join_chatroom",
          room_uuid: room.uuid,
          status: "active",
        };
        console.log("Join Request:", joinRequest);
        this.socket.send(JSON.stringify(joinRequest));

        alert("参加リクエストを送信しました。");

        modal.style.display = "none";
      } else {
        alert("WebSocketが接続されていません。");
      }
    };

    cancelJoinButton.onclick = () => {
      modal.style.display = "none";
    };

    window.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
  }

  handleDOMContentLoaded() {
    const searchBar = document.querySelector(".unjoined-search-bar input");
    if (searchBar) {
      searchBar.addEventListener("input", (event) => {
        const query = event.target.value;
        this.fetchAndDisplayRooms(query);
      });
    } else {
      console.error("Search bar element not found.");
    }
  }

  get html() {
    return `<div class="dir-container">
                <div class="header">
                    <h2>未参加</h2>
                    <div class="options">•••</div>
                </div>
                <div class="unjoined-search-bar">
                    <input type="text" placeholder="Search Chatroom">
                </div>
                <div class="unjoined-rooms"></div>

                <!-- メンバーリストの表示領域 -->
                <div class="members-container">
                    <h3>Members</h3>
                    <div class="members-list"></div> <!-- メンバーリストのコンテナ -->
                </div>

                <!-- Modal for joining chatroom -->
                <div id="joinChatroomModal" class="modal">
                    <div class="modal-content">
                        <span class="close-modal">&times;</span>
                        <h2>Join Chatroom</h2>
                        <p id="modalRoomName"></p>
                        <button id="confirmJoinButton">Yes</button>
                        <button id="cancelJoinButton">No</button>
                    </div>
                </div>
            </div>`;
  }
}
