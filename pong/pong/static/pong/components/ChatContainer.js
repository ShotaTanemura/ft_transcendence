import { getAvailablePongGameRoomId } from "../api/api.js";
import { Component } from "../core/component.js";

export class ChatContainer extends Component {
  constructor(router, params, state) {
    super(router, params, state, ".chat-container");
    this.selectedRoom = undefined;
    this.socket = state.socket;

    this.eventListeners = {};

    this.render();
  }

  refreshChat(room) {
    this.selectedRoom = {
      uuid: room.uuid,
      name: room.name,
    };
    this.displayRoom(room);
  }

  appendMessage(message, myId) {
    const messagesContainer = document.querySelector(
      ".direct-message-messages",
    );
    if (!message || !messagesContainer) {
      return;
    }

    const messageElement = document.createElement("div");
    const messageContent = document.createElement("div");

    messageElement.classList.add("message");
    if (message.user_uuid === myId) {
      messageContent.classList.add("my-message");
      messageContent.innerHTML = `<div class="my-user-message">${message.message}</div>`;
    } else {
      messageContent.classList.add("other-message");
      messageContent.innerHTML = `<div class="other-user-name">${message.user}</div><div class="other-user-message">${message.message}</div>`;
    }

    messageElement.appendChild(messageContent);
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  displayRoom(select) {
    const chatContainer = document.querySelector(".direct-message-content");
    if (!chatContainer) {
      return;
    }
    chatContainer.innerHTML = "";

    const roomHeader = document.querySelector(".direct-message-header");
    if (!roomHeader) {
      return;
    }
    roomHeader.innerHTML = `<h3>${select.name}</h3>`;

    const messages = document.createElement("div");
    messages.classList.add("direct-message-messages");

    chatContainer.appendChild(messages);

    if (this.selectedRoom) {
      const form = document.createElement("div");
      form.classList.add("form");

      const messageForm = document.createElement("form");
      messageForm.classList.add("direct-message-form");

      const messageInput = document.createElement("input");
      messageInput.type = "text";
      messageInput.name = "message";
      messageInput.placeholder = "メッセージ";

      const sendButton = document.createElement("button");
      sendButton.type = "submit";
      sendButton.innerText = "送信";

      messageForm.appendChild(messageInput);
      messageForm.appendChild(sendButton);
      form.appendChild(messageForm);

      chatContainer.appendChild(form);

      this.eventListeners.messageFormSubmitListener = (event) => {
        event.preventDefault();
        this.emitMessage(select.uuid, messageInput.value);
        messageInput.value = "";
      };
      messageForm.addEventListener(
        "submit",
        this.eventListeners.messageFormSubmitListener,
      );

      const header = document.querySelector(".direct-message-header");
      if (!header) {
        return;
      }
      header.innerHTML = `<h3>${select.name}</h3> 
                          <button class="invite-button">ゲームに招待する</button> 
                          <button class="leave-button">ルームから退出</button>`;

      const leaveButton = document.querySelector(".leave-button");
      if (!leaveButton) {
        return;
      }
      this.eventListeners.leaveButtonClickListener = () =>
        this.confirmLeaveRoom();
      leaveButton.addEventListener(
        "click",
        this.eventListeners.leaveButtonClickListener,
      );

      const inviteButton = document.querySelector(".invite-button");
      if (!inviteButton) {
        return;
      }
      this.eventListeners.inviteButtonClickListener = () =>
        this.inviteToGame(select.uuid);
      inviteButton.addEventListener(
        "click",
        this.eventListeners.inviteButtonClickListener,
      );
    }
  }

  inviteToGame = async (roomUuid) => {
    this.showNumberOfPlayersModal(roomUuid);
  };

  showNumberOfPlayersModal = (roomUuid) => {
    const modal = document.createElement("div");
    modal.classList.add("direct-message-modal");

    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");

    const modalHeader = document.createElement("div");
    modalHeader.classList.add("modal-header");
    const closeModalButton = document.createElement("span");
    closeModalButton.classList.add("close");
    closeModalButton.innerHTML = "&times;";
    modalHeader.appendChild(closeModalButton);
    const modalTitle = document.createElement("h2");
    modalTitle.textContent = "プレイヤー数を選択";
    modalHeader.appendChild(modalTitle);

    const modalBody = document.createElement("div");
    modalBody.classList.add("modal-body");

    const numberOfPlayersForm = document.createElement("form");

    const twoPlayersOption = document.createElement("label");
    twoPlayersOption.innerHTML =
      '<input type="radio" name="number-of-players" value="2"> 2人プレイ';

    const fourPlayersOption = document.createElement("label");
    fourPlayersOption.innerHTML =
      '<input type="radio" name="number-of-players" value="4" checked> 4人プレイ';

    numberOfPlayersForm.appendChild(twoPlayersOption);
    numberOfPlayersForm.appendChild(fourPlayersOption);

    modalBody.appendChild(numberOfPlayersForm);

    const modalFooter = document.createElement("div");
    modalFooter.classList.add("modal-footer");
    const startGameButton = document.createElement("button");
    startGameButton.textContent = "ゲームを開始する";

    modalFooter.appendChild(startGameButton);

    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    closeModalButton.onclick = () => {
      document.body.removeChild(modal);
    };

    startGameButton.onclick = async () => {
      const selectedOption =
        numberOfPlayersForm.elements["number-of-players"].value;
      const numberOfPlayers = selectedOption;
      const roomId = await getAvailablePongGameRoomId();
      if (this.onSendMessage) {
        const href = `${window.location.origin}/pong-game-home?room-id=${roomId}&name=guest&number-of-players=${numberOfPlayers}`;

        this.onSendMessage(
          roomUuid,
          `${numberOfPlayers}人用ゲームを開始します!以下のリンクからゲームに参加してください<br>
           <a href="${href}" target="_blank" rel="noopener noreferrer">ゲームに参加する</a>`,
        );
      }
      window.open(
        `/pong-game-home?room-id=${roomId}&name=host&number-of-players=${numberOfPlayers}`,
        "_blank",
        "noopener,noreferrer",
      );
      document.body.removeChild(modal);
    };
  };

  confirmLeaveRoom() {
    const confirmation = window.confirm("本当に退出しますか？");
    if (confirmation) {
      this.leaveRoom();
    }
  }

  leaveRoom() {
    if (this.selectedRoom) {
      this.onLeaveRoom(this.selectedRoom.uuid);
      this.clear();
    }
  }

  emitMessage(roomUuid, message) {
    if (this.onSendMessage) {
      this.onSendMessage(roomUuid, message);
    }
  }

  clear() {
    console.log("Clearing chat container");
    this.selectedRoom = undefined;

    const messagesContainer = document.querySelector(
      ".direct-message-messages",
    );
    if (messagesContainer) {
      messagesContainer.innerHTML = "";
    }

    const header = document.querySelector(".direct-message-header");
    if (header) {
      header.innerHTML = "ルームを選択してください";
    }

    this.removeEventListeners();
    this.render();
  }

  removeEventListeners() {
    const {
      messageFormSubmitListener,
      leaveButtonClickListener,
      inviteButtonClickListener,
    } = this.eventListeners;

    const messageForm = document.querySelector(".direct-message-form");
    if (messageForm && messageFormSubmitListener) {
      messageForm.removeEventListener("submit", messageFormSubmitListener);
    }

    const leaveButton = document.querySelector(".leave-button");
    if (leaveButton && leaveButtonClickListener) {
      leaveButton.removeEventListener("click", leaveButtonClickListener);
    }

    const inviteButton = document.querySelector(".invite-button");
    if (inviteButton && inviteButtonClickListener) {
      inviteButton.removeEventListener("click", inviteButtonClickListener);
    }
  }

  get html() {
    return `
      <div class="direct-message-container">
        <div class="direct-message-header">
          <h3>${this.selectedRoom ? this.selectedRoom.name : "ルームを選択してください"}</h3>
        </div>
        <div class="direct-message-content">
        ${
          this.selectedRoom
            ? `
            <div class="direct-message-messages"></div>
            <div class="form">
              <form class="direct-message-form">
                <input type="text" name="message" placeholder="メッセージ" />
                <button type="submit">送信</button>
              </form>
            </div>
            `
            : ""
        }
        </div>
      </div>
    `;
  }
}
