import { Component } from "../core/component.js";
import { Header } from "./Header.js";
import {
  sendFriendRequest,
  approveFriendRequest,
  getUserStatus,
} from "../api/api.js";

export class SearchUsers extends Component {
  constructor(router, params, state) {
    super(router, params, state);
    this.intervalElements = [];
  }

  afterPageLoaded = () => {
    this.headerComponent = new Header(this.router, this.params, this.state);
    this.element.parentElement.prepend(this.headerComponent.element);
    this.headerComponent.afterPageLoaded();
    const usersData = this.getRouteContext("searchedUsersData");
    this.setRouteContext("searchedUsersData", []);
    this.createSearchedUsersList(usersData);
    document.getElementById("button-to-move-home-page").onclick =
      this.goHomePage;
    this.unsetRouteContext("searchedUsersData");
  };

  beforePageUnload = () => {
    this.element.parentElement.removeChild(this.headerComponent.element);
  };

  goHomePage = () => {
    this.goNextPage("/");
  };
  createSearchedUsersList = async (usersData) => {
    if (!usersData) {
      const userNotFoundElement = Object.assign(document.createElement("p"), {
        className: "p-3 text-secondary",
      });
      userNotFoundElement.innerHTML = "Sorry. User Not Found.";
      document.getElementById("search-users-title").after(userNotFoundElement);
      return;
    }
    const searchedUsersDiv = Object.assign(document.createElement("div"), {
      className: "p-3",
    });
    usersData.forEach(async (userData) => {
      searchedUsersDiv.appendChild(
        await this.createSearchedUserElement(userData),
      );
    });
    document.getElementById("searched-users-box").appendChild(searchedUsersDiv);
  };

  createSearchedUserElement = async (userData) => {
    const userElement = document.createElement("form");
    userElement.innerHTML = `
        <div class="card m-5 p-2 bg-light border">
          <div class="card-body text-start d-flex align-items-center gap-5">
            <img size="32" height="128" width="128" data-view-component="true" class="avatar rounded-circle me-5" src=${userData.icon}>
            <span class="display-4 fw-bold">${userData.name}</span>
            ${await this.getUserStatus(userData.name)}
            ${this.getButton(userData.name, userData.friend_status)}
          </div>
        </div>
      `;
    userElement.onsubmit = async (event) => {
      event.preventDefault();
      const button_id = event.submitter.id;
      const buttonElement = document.getElementById(button_id);
      if (button_id.startsWith("send-friend-request")) {
        if (await sendFriendRequest(userData.name)) {
          buttonElement.id = "pending";
          buttonElement.classList.replace("btn-primary", "btn-secondary");
          buttonElement.innerHTML = "pending";
        }
      } else if (button_id.startsWith("accept-friend-request")) {
        if (await approveFriendRequest(userData.name)) {
          const parentElement = buttonElement.parentNode;
          parentElement.removeChild(buttonElement);
        }
      }
    };
    return userElement;
  };

  getUserStatus = async (name) => {
    const user_status = await getUserStatus(name);
    switch (user_status) {
      case "online":
        return `<div style="width: 25px; height: 25px; border-radius: 50%; background-color: #7FFF00; border: 2px solid white;"></div>`;
      default:
        return ``;
    }
  };

  getButton = (friend_name, friend_status) => {
    switch (friend_status) {
      case ("yourself", "friend"):
        return "";
      case "stranger":
        return `<button id="send-friend-request-from-${friend_name}" class="btn btn-primary ms-auto gap-5">send friend request</button>`;
      case "pending":
        return `<button id="pending-approval-from-${friend_name}" class="btn btn-secondary ms-auto gap-5">pending...</button>`;
      case "requested":
        return `<button id="accept-friend-request-from${friend_name}" class="btn btn-success ms-auto gap-5">accept friend request</button>`;
      default:
        return "";
    }
  };
  get html() {
    return `
      <main class="text-center p-5">
        <h1 id="search-users-title">search results</h1>
        <div id="searched-users-box" class="d-grid gap-3"></div>
        <button id="button-to-move-home-page" class="btn btn-primary">back</button>
      </main>
        `;
  }
}
