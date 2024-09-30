import { Component } from "../core/component.js";
import { Header } from "./Header.js";
import {
  getFriendsData,
  getRequestedFriendsData,
  getPendingFriendsData,
  approveFriendRequest,
} from "../api/api.js";

export class Friend extends Component {
  constructor(router, params, state) {
    super(router, params, state);
  }

  afterPageLoaded = async () => {
    this.headerComponent = new Header(this.router, this.params, this.state);
    this.element.parentElement.prepend(this.headerComponent.element);
    this.headerComponent.afterPageLoaded();
    this.createFriendList();
    this.createRequestedFriendList();
    this.createPendingFriendList();
    document.getElementById("button-to-move-home-page").onclick =
      this.goHomePage;
  };

  beforePageUnload = () => {
    this.element.parentElement.removeChild(this.headerComponent.element);
  };

  goHomePage = () => {
    this.goNextPage("/");
  };

  createFriendList = async () => {
    const friendsData = await getFriendsData();
    if (!friendsData) {
      const friendNotFoundElement = Object.assign(document.createElement("p"), {
        className: "p-3 text-secondary",
      });
      friendNotFoundElement.innerHTML = "Sorry. Friend Not Found.";
      document.getElementById("friend-list-box").after(friendNotFoundElement);
      return;
    }
    const friendsDiv = Object.assign(document.createElement("div"), {
      className: "p-3",
    });
    console.log(friendsData);
    friendsData.forEach(async (friendData) => {
      friendsDiv.appendChild(await this.createFriendElement(friendData));
    });
    document.getElementById("friend-list-box").appendChild(friendsDiv);
  };

  createFriendElement = async (friendData) => {
    const friendElement = document.createElement("div");
    friendElement.innerHTML = `
        <div class="card m-5 p-2 bg-light border">
          <div class="card-body text-start d-flex align-items-center gap-5">
            <img size="32" height="128" width="128" data-view-component="true" class="avatar rounded-circle me-5" src=${friendData.icon}>
            <span class="display-4 fw-bold">${friendData.name}</span>
          </div>
        </div>
      `;
    return friendElement;
  };

  createRequestedFriendList = async () => {
    const friendsData = await getRequestedFriendsData();
    if (!friendsData) {
      const friendNotFoundElement = Object.assign(document.createElement("p"), {
        className: "p-3 text-secondary",
      });
      friendNotFoundElement.innerHTML = "No Friend request.";
      document
        .getElementById("requested-friend-list-box")
        .after(friendNotFoundElement);
      return;
    }
    const friendsDiv = Object.assign(document.createElement("div"), {
      className: "p-3",
    });
    console.log(friendsData);
    friendsData.forEach(async (friendData) => {
      friendsDiv.appendChild(
        await this.createRequestedFriendElement(friendData),
      );
    });
    document
      .getElementById("requested-friend-list-box")
      .appendChild(friendsDiv);
  };

  createRequestedFriendElement = async (friendData) => {
    const requestedFriendElement = document.createElement("form");
    requestedFriendElement.innerHTML = `
        <div class="card m-5 p-2 bg-light border">
          <div class="card-body text-start d-flex align-items-center gap-5">
            <img size="32" height="128" width="128" data-view-component="true" class="avatar rounded-circle me-5" src=${friendData.icon}>
            <span class="display-4 fw-bold">${friendData.name}</span>
            <button id="send-friend-request-to-${friendData.name}" class="btn btn-success ms-auto gap-5">accept friend request</button>
          </div>
        </div>
      `;
    requestedFriendElement.onsubmit = async (event) => {
      event.preventDefault();
      console.log("ok");
      const button_id = event.submitter.id;
      const buttonElement = document.getElementById(button_id);
      if (await approveFriendRequest(friendData.name)) {
        const parentElement = buttonElement.parentNode;
        parentElement.removeChild(buttonElement);
      } else {
        alert("error!");
      }
    };
    return requestedFriendElement;
  };

  createPendingFriendList = async () => {
    const friendsData = await getPendingFriendsData();
    if (!friendsData) {
      const friendNotFoundElement = Object.assign(document.createElement("p"), {
        className: "p-3 text-secondary",
      });
      friendNotFoundElement.innerHTML = "No pending friend request.";
      document
        .getElementById("pending-friend-list-box")
        .after(friendNotFoundElement);
      return;
    }
    const friendsDiv = Object.assign(document.createElement("div"), {
      className: "p-3",
    });
    friendsData.forEach(async (friendData) => {
      friendsDiv.appendChild(await this.createPendingFriendElement(friendData));
    });
    document.getElementById("pending-friend-list-box").appendChild(friendsDiv);
  };

  createPendingFriendElement = async (friendData) => {
    const requestedFriendElement = document.createElement("div");
    requestedFriendElement.innerHTML = `
        <div class="card m-5 p-2 bg-light border">
          <div class="card-body text-start d-flex align-items-center gap-5">
            <img size="32" height="128" width="128" data-view-component="true" class="avatar rounded-circle me-5" src=${friendData.icon}>
            <span class="display-4 fw-bold">${friendData.name}</span>
            <button id="pedding-friend-${friendData.name}" class="btn btn-secondary ms-auto gap-5">pending..</button>
          </div>
        </div>
      `;
    return requestedFriendElement;
  };

  get html() {
    return `
      <main class="text-center p-5">
        <h1 id="friends-header">Friends</h1>
        <div class="friend-list-container container mb-2">
            <h2 id="friend-list-header">Friend List</h1>
            <div id="friend-list-box" class="d-grid gap-3">
            </div>
        </div>
        <div class="requested-friend-list-container container mb-2">
            <h2 id="requested-friend-list-header">Requested</h2>
            <div id="requested-friend-list-box" class="d-grid gap-3">
            </div>
        </div>
        <div class="pending-friend-list-container container mb-2">
            <h2 id="pending-friend-list-header">Pending</h2>
            <div id="pending-friend-list-box" class="d-grid gap-3">
            </div>
        </div>
        <button id="button-to-move-home-page" class="btn btn-primary">back</button>
      </main>
        `;
  }
}
