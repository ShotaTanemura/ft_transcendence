import { Component } from "../core/component.js";

export class ChatContainer extends Component {
  constructor(router, params, state) {
    super(router, params, state, ".chat-container");
    this.selectedRoom = undefined;
    this.socket = state.socket;
    this.render();
  }

  refreshChat(room) {
    this.selectedRoom = {
      uuid: room.uuid,
      name: room.name,
    };
    this.displayRoom(room);
  }

  appendMessage(message) {
    const messagesContainer = document.querySelector(
      ".direct-message-messages",
    );
    if (messagesContainer) {
      const messageElement = document.createElement("div");
      messageElement.classList.add("message");
      messageElement.innerText = `${message.user}: ${message.message}`;
      messagesContainer.appendChild(messageElement);
    } else {
      console.error("Messages container not found");
    }
  }

  displayRoom(select) {
    const chatContainer = document.querySelector(".direct-message-content");
    chatContainer.innerHTML = "";

    const roomHeader = document.querySelector(".direct-message-header");
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
      messageInput.placeholder = "Enter your message";

      const sendButton = document.createElement("button");
      sendButton.type = "submit";
      sendButton.innerText = "Send";

      messageForm.appendChild(messageInput);
      messageForm.appendChild(sendButton);
      form.appendChild(messageForm);

      chatContainer.appendChild(form);

      messageForm.addEventListener("submit", (event) => {
        event.preventDefault();
        this.emitMessage(select.uuid, messageInput.value);
        messageInput.value = "";
      });

      const header = document.querySelector(".direct-message-header");
      header.innerHTML = `<h3>${select.name}</h3> <button class="leave-button">ルームから退出</button>`;

      const leaveButton = document.querySelector(".leave-button");
      leaveButton.addEventListener("click", () => this.confirmLeaveRoom());
    }
  }

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
    header.innerHTML = "ルームを選択してください";
    this.render();
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
                <input type="text" name="message" placeholder="Enter your message" />
                <button type="submit">Send</button>
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
