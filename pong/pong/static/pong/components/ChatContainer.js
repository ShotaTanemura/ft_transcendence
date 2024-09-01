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
    const myRoomsContainer = document.querySelector(".chat");
    myRoomsContainer.innerHTML = "";

    const roomElement = document.createElement("div");
    roomElement.classList.add("room");
    roomElement.innerText = select.name;

    myRoomsContainer.appendChild(roomElement);
  }

  get html() {
    if (!this.selectedRoom) {
      return `<div class="chat">Select a room</div>`;
    }
    
    return `
            <div class="chat">
            </div>
        `;
  }
}
