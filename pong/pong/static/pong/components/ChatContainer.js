import { Component } from "../core/component.js";

export class ChatContainer extends Component {
  constructor(router, params, state) {
    super(router, params, state, ".chat-container");
    this.selectedRoom = undefined;
    this.socket = null;
    this.render();
  }

  refreshChat(room) {
    this.selectedRoom = {
      uuid: room.uuid,
      name: room.name,
    };
    this.connectToWebSocket(room.uuid);
    this.displayRoom(room);
  }

  connectToWebSocket(roomUuid) {
    if (this.socket) {
      this.socket.close();
    }

    const wsUrl = "ws://" + window.location.host + "/ws/chat/" + roomUuid + "/";

    this.socket = new WebSocket(wsUrl);

    this.socket.addEventListener("open", () => {
      console.log("WebSocket connected");
    });

    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      this.appendMessage(message);
    });

    this.socket.addEventListener("close", () => {
      console.log("WebSocket disconnected");
    });

    this.socket.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
    });
  }

  appendMessage(message) {
    const messagesContainer = document.querySelector(".messages");
    if (messagesContainer) {
      const messageElement = document.createElement("div");
      messageElement.classList.add("message");
      messageElement.innerText = `${message.user}: ${message.message}`;
      messagesContainer.appendChild(messageElement);
    }
  }

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
      this.postMessage(select.uuid, messageInput.value);
      messageInput.value = "";
    });
  }

  postMessage(roomUuid, message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          room_uuid: roomUuid,
          message: message,
        }),
      );
      console.log("Message sent via WebSocket:", message);
    } else {
      console.error("WebSocket connection is not open");
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
