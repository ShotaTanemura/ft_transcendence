import { Component } from "../core/component.js";
import { Header } from "./Header.js";

export class Friend extends Component {
  constructor(router, params, state) {
    super(router, params, state);
  }

  afterPageLoaded = () => {
    this.headerComponent = new Header(this.router, this.params, this.state);
    this.element.parentElement.prepend(this.headerComponent.element);
    this.headerComponent.afterPageLoaded();
    document.getElementById("button-to-move-home-page").onclick =
      this.goHomePage;
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
    const userElement = document.createElement("div");
    userElement.innerHTML = `
        <div class="card m-5 p-2 bg-light border">
          <div class="card-body text-start d-flex align-items-center gap-5">
            <img size="32" height="128" width="128" data-view-component="true" class="avatar rounded-circle me-5" src=${userData.icon}>
            <span class="display-4 fw-bold">${userData.name}</span>
          </div>
        </div>
      `;
    return userElement;
  };

  get html() {
    return `
      <main class="text-center p-5">
        <h1 id="friends-header">Friends</h1>
        <div class="friend-list-container container border mb-2">
            <h2 id="friend-list-header">Friend List</h1>
            <div id="friend-list-box" class="d-grid gap-3">
                <p>no friend..</p>
            </div>
        </div>
        <div class="friend-request-list-container container border mb-2">
            <h2 id="friend-request-list-header">Requested</h2>
            <div id="friend-request-list-box" class="d-grid gap-3">
                <p>no friend request.</p>
            </div>
        </div>
        <div class="pending-friend-list-container container border mb-2">
            <h2 id="pending-friend-list-header">Pending</h2>
            <div id="pending-friend-list-box" class="d-grid gap-3">
                <p>no pending friend.</p>
            </div>
        </div>
        <button id="button-to-move-home-page" class="btn btn-primary">back</button>
      </main>
        `;
  }
}
