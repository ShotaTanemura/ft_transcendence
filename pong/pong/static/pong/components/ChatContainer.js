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
    const messagesContainer = document.querySelector(".direct-message-messages");
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
    roomHeader.innerText = select.name;

    const messages = document.createElement("div");
    messages.classList.add("direct-message-messages");

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

    chatContainer.appendChild(messages);
    chatContainer.appendChild(form);

    messageForm.addEventListener("submit", (event) => {
      event.preventDefault();
      this.emitMessage(select.uuid, messageInput.value);
      messageInput.value = "";
    });
  }

  emitMessage(roomUuid, message) {
    if (this.onSendMessage) {
      this.onSendMessage(roomUuid, message);
    }
  }

  get html() {
    return `
      <div class="direct-message-container">
        <div class="direct-message-header">${this.selectedRoom ? this.selectedRoom.name : "Select a room"}</div>
        <div class="direct-message-content">
          <div class="direct-message-messages"></div>
          <div class="form">
            <form class="direct-message-form">
              <input type="text" name="message" placeholder="Enter your message" />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      </div>
    `;
  }
}