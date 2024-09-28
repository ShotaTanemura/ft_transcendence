import { Component } from "../core/component.js";
import { Header } from "./Header.js";

export class SearchUsers extends Component {
  constructor(router, params, state) {
    super(router, params, state);
  }

  afterPageLoaded = () => {
    this.headerComponent = new Header(this.router, this.params, this.state);
    this.element.parentElement.prepend(this.headerComponent.element);
    this.headerComponent.afterPageLoaded();
    const usersData = this.getRouteContext("searchedUsersData");
    this.createSearchedUsersList(usersData);
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
        <h1 id="search-users-title">search results</h1>
        <div id="searched-users-box" class="d-grid gap-3"></div>
        <button id="button-to-move-home-page" class="btn btn-primary">back</button>
      </main>
        `;
  }
}
