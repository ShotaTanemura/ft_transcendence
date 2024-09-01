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
    this.fetchAnd(room);
  }

  fetchAnd(select) {
    this.displayRoom(select);
  }

  displayRoom(select) {
    const chatContainer = document.querySelector(".chat");
    chatContainer.innerHTML = "";

    const roomHeader = document.createElement("div");
    roomHeader.classList.add("room-header");
    roomHeader.innerText = select.name;

    const messages = document.createElement("div");
    messages.classList.add("messages");

    this.fetchMessages(select.uuid, messages);

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

  async fetchMessages(roomUuid, messagesContainer) {
    try {
      const response = await fetch(`/chat/api/v1/rooms/${roomUuid}/messages`);
      if (response.ok) {
        const data = await response.json();

        console.log("Fetched messages data:", data);

        const messages = data.messages || [];

        if (Array.isArray(messages)) {
          messages.forEach((message) => {
            console.log("Message:", message);
            const messageElement = document.createElement("div");
            messageElement.classList.add("message");
            messageElement.innerText = `${message.user}: ${message.message}`;
            messagesContainer.appendChild(messageElement);
          });
        } else {
          console.error("Messages is not an array:", messages);
        }
      } else {
        console.error("Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }

  async postMessage(roomUuid, message) {
    try {
      const response = await fetch(`/chat/api/v1/rooms/${roomUuid}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room_uuid: roomUuid,
          message: message,
        }),
      });

      if (response.ok) {
        console.log("Message sent successfully");
        this.refreshChat(this.selectedRoom);
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
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
