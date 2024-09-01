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
    this.displayRooms(select);
  }

  displayRooms(select) {
    const chatContainer = document.querySelector(".chat");
    chatContainer.innerHTML = "";

    const roomElement = document.createElement("div");
    roomElement.classList.add("room");
    roomElement.innerText = select.name;

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

    chatContainer.appendChild(roomElement);
    chatContainer.appendChild(messageForm);

    messageForm.addEventListener("submit", (event) => {
      event.preventDefault();
      this.postMessage(select.uuid, messageInput.value);
      messageInput.value = "";
    });
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