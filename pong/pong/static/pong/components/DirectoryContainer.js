import { Component } from "../core/component.js";

export class DirectoryContainer extends Component {
  constructor(router, params, state, onRoomJoined, socket) {
    super(router, params, state, ".directory-container");
    this.onRoomJoined = onRoomJoined;
    this.socket = socket;
    this.chatSocket = null;
    this.modalVisible = false;
    this.non_participation = [];

    this.eventListeners = {};

    if (this.socket) {
      this.setupWebSocketListeners();
    }

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    window.addEventListener("load", () => {
      this.handleDOMContentLoaded();
    });

    window.addEventListener("beforeunload", this.beforePageUnload);
  }

  beforePageUnload = () => {
    const {
      searchBarListener,
      confirmJoinButtonListener,
      cancelJoinButtonListener,
      modalClickListener,
    } = this.eventListeners;

    if (searchBarListener) {
      const searchBar = document.querySelector(".unjoined-search-bar input");
      if (searchBar) searchBar.removeEventListener("input", searchBarListener);
    }
    if (confirmJoinButtonListener) {
      const confirmJoinButton = document.getElementById("confirmJoinButton");
      if (confirmJoinButton) {
        confirmJoinButton.removeEventListener(
          "click",
          confirmJoinButtonListener,
        );
      }
    }
    if (cancelJoinButtonListener) {
      const cancelJoinButton = document.getElementById("cancelJoinButton");
      if (cancelJoinButton) {
        cancelJoinButton.removeEventListener("click", cancelJoinButtonListener);
      }
    }
    if (modalClickListener) {
      window.removeEventListener("click", modalClickListener);
    }
  };

  setWebSocket(socket) {
    this.socket = socket;
    this.setupWebSocketListeners();
  }

  setupChatSocket(socket) {
    this.chatSocket = socket;
  }

  refreshRoomMembers(users) {
    const membersContainer = document.querySelector(".members-list");
    if (membersContainer) {
      membersContainer.innerHTML = "";
    }

    users.forEach((user) => {
      const memberElement = document.createElement("div");
      memberElement.className = "member";
      memberElement.textContent = user.name;

      memberElement.addEventListener("click", (event) => {
        this.showMemberOptionsModal(event, user);
      });

      membersContainer.appendChild(memberElement);
    });
  }

  showMemberOptionsModal(event, user) {
    if (this.modalVisible) {
      return;
    }

    const modalContainer = document.createElement("div");
    modalContainer.className = "modal member-options-modal";

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";

    const closeButton = document.createElement("span");
    closeButton.className = "close-modal";
    closeButton.textContent = "×";
    closeButton.addEventListener("click", () => {
      this.closeModal(modalContainer);
    });

    const select = document.createElement("select");
    select.innerHTML = `
      <option value="">選択してください</option>
      <option value="profile">プロフィール表示</option>
      <option value="block">ブロック</option>
      <option value="close">閉じる</option>
    `;

    select.addEventListener("change", (event) => {
      const selectedOption = event.target.value;
      if (selectedOption === "profile") {
        this.showUserProfile(user, modalContainer);
      } else if (selectedOption === "block") {
        this.blockUser(user, modalContainer);
      } else if (selectedOption === "close") {
        this.closeModal(modalContainer);
      }
    });

    modalContent.appendChild(closeButton);
    modalContent.appendChild(select);
    modalContainer.appendChild(modalContent);
    document.body.appendChild(modalContainer);

    this.modalVisible = true;

    modalContainer.style.display = "block";
  }

  closeModal(modalContainer) {
    modalContainer.remove();
    this.modalVisible = false;
  }

  showUserProfile(user, modalContainer) {
    this.router.goNextPage(`/profile/${user.name}`);
    this.closeModal(modalContainer);
  }

  blockUser(user, modalContainer) {
    if (this.chatSocket && this.chatSocket.readyState === WebSocket.OPEN) {
      const blockRequest = {
        job_type: "block_user",
        user_uuid: user.uuid,
        status: "blocked",
      };

      console.log("Block Request:", blockRequest);
      this.chatSocket.send(JSON.stringify(blockRequest));

      alert(`${user.name} をブロックしました。`);
      this.closeModal(modalContainer);
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
    this.non_participation = rooms;
  }

  displayRooms(rooms, query = "") {
    if (!rooms) {
      return;
    }
    const unjoinedRoomsContainer = document.querySelector(".unjoined-rooms");
    if (!unjoinedRoomsContainer) {
      return;
    }
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

    confirmJoinButton.removeEventListener(
      "click",
      this.eventListeners.confirmJoinButtonListener,
    );
    cancelJoinButton.removeEventListener(
      "click",
      this.eventListeners.cancelJoinButtonListener,
    );
    window.removeEventListener("click", this.eventListeners.modalClickListener);

    this.eventListeners.confirmJoinButtonListener = () => {
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
    confirmJoinButton.addEventListener(
      "click",
      this.eventListeners.confirmJoinButtonListener,
    );

    this.eventListeners.cancelJoinButtonListener = () => {
      modal.style.display = "none";
    };
    cancelJoinButton.addEventListener(
      "click",
      this.eventListeners.cancelJoinButtonListener,
    );

    this.eventListeners.modalClickListener = (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
    window.addEventListener("click", this.eventListeners.modalClickListener);
  }

  handleDOMContentLoaded() {
    const searchBar = document.querySelector(".unjoined-search-bar input");
    if (!searchBar) {
      return;
    }

    this.eventListeners.searchBarListener = (event) => {
      const query = event.target.value;
      this.displayRooms(this.non_participation, query);
    };

    if (searchBar) {
      searchBar.addEventListener(
        "input",
        this.eventListeners.searchBarListener,
      );
    } else {
      console.error("Search bar element not found.");
    }
  }

  get html() {
    return `<div class="dir-container">
                <div class="header">
                    <h3>未参加</h3>
                </div>
                <div class="unjoined-search-bar">
                    <input type="text" placeholder="未参加ルームの検索">
                </div>
                <div class="unjoined-rooms"></div>

                <div class="members-container">
                    <h3>メンバー</h3>
                    <div class="members-list"></div> 
                </div>

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
