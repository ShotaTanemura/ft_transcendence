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
    console.log("ChatContainer: Refresh chat");
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
    console.log("ChatContainer: Get HTML");
    console.log(this.selectedRoom);
    if (!this.selectedRoom) {
      console.log("ChatContainer: No room selected");
      console.log(this.selectedRoom);
      return `<div class="chat">Select a room</div>`;
    }

    console.log("ChatContainer: Room selected");
    console.log(this.selectedRoom);
    return `
            <div class="chat">
            </div>
        `;
  }
}
