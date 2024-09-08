import { Component } from "../core/component.js";

export class ChatContainer extends Component {
  constructor(router, params, state) {
    super(router, params, state, ".chat-container");
    this.selectedRoom = undefined;
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
    console.log("Appending message to UI:", message); // ログを追加
    const messagesContainer = document.querySelector(".messages");
    if (messagesContainer) {
      console.log("Appending message to UI:", message); // ログを追加
      const messageElement = document.createElement("div");
      messageElement.classList.add("message");
      messageElement.innerText = `${message.user}: ${message.message}`;
      messagesContainer.appendChild(messageElement);
    } else {
      console.error("Messages container not found");
    }
  }
  // appendMessage(message) {
  //   const messagesContainer = document.querySelector(".messages");
  //   if (messagesContainer) {
  //     const messageElement = document.createElement("div");
  //     messageElement.classList.add("message");
  //     messageElement.innerText = `${message.user}: ${message.message}`;
  //     messagesContainer.appendChild(messageElement);
  //   }
  // }

  displayRoom(select) {
    const chatContainer = document.querySelector(".chat");
    chatContainer.innerHTML = "";

    const roomHeader = document.createElement("div");
    roomHeader.classList.add("room-header");
    roomHeader.innerText = select.name;

    const messages = document.createElement("div");
    messages.classList.add("messages");

    const form = document.createElement("div");
    form.classList.add("form");

    const messageForm = document.createElement("form");
    messageForm.classList.add("message-form");

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

    chatContainer.appendChild(roomHeader);
    chatContainer.appendChild(messages);
    chatContainer.appendChild(form);

    messageForm.addEventListener("submit", (event) => {
      event.preventDefault();
      this.emitMessage(select.uuid, messageInput.value);
      messageInput.value = "";
    });
  }

  // WebSocketメッセージ送信
  emitMessage(roomUuid, message) {
    if (this.onSendMessage) {
      this.onSendMessage(roomUuid, message);
    }
  }

  get html() {
    if (!this.selectedRoom) {
      return `<div class="chat">Select a room</div>`;
    }

    return `
      <div class="chat"></div>
    `;
  }
}
