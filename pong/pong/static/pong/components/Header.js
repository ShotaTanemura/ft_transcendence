import { Component } from "../core/component.js";
import { getUsersDataFromName } from "../api/api.js";

export class Header extends Component {
  constructor(router, params, state) {
    super(router, params, state);
  }

  afterPageLoaded() {
    document.getElementById("search-user-form").onsubmit =
      this.onSubmitSearchUserForm;
    document.getElementById("title-link").onclick = this.onClickHomeLink;
    document.getElementById("user-profile-button").onclick =
      this.onClickUserProfileButton;
    document.getElementById("navigate-home-link").onclick =
      this.onClickHomeLink;
    document.getElementById("navigate-chat-link").onclick =
      this.onClickChatLink;
    document.getElementById("navigate-pong-game-link").onclick =
      this.onClickPongGameLink;
    document.getElementById("navigate-typing-game-link").onclick =
      this.onClickTypingGameLink;
    document.getElementById("navigate-settings-link").onclick =
      this.onClickSettingsLink;
    document.getElementById("navigate-signout-link").onclick =
      this.onClickSignoutButton;
  }

  onSubmitSearchUserForm = async (event) => {
    event.preventDefault();
    const searchedName = event.target.elements["search-user-input"].value;
    this.setRouteContext(
      "searchedUsersData",
      await getUsersDataFromName(searchedName),
    );
    this.goNextPage("/search-users");
  };

  onClickUserProfileButton = () => {
    this.router.goNextPage("/profile");
    this.render();
  };

  onClickHomeLink = () => {
    this.router.goNextPage("/");
    this.render();
  };

  onClickChatLink = () => {
    this.router.goNextPage("/chat");
    this.render();
  };

  onClickPongGameLink = () => {
    this.router.goNextPage("/pong-game-home");
    this.render();
  };

  onClickTypingGameLink = () => {
    //TODO handle action
    alert("#TODO TypingGameに移動する");
  };

  onClickSettingsLink = () => {
    //TODO handle action
    alert("#TODO Settingsに移動する");
  };

  onClickSignoutButton = async (event) => {
    event.preventDefault();
    try {
      await this.revokeToken();
      this.router.goNextPage("/signin");
    } catch (error) {
      alert(error);
    }
  };

  revokeToken = async () => {
    const response = await fetch("/pong/api/v1/auth/token/revoke", {
      method: "POST",
    });
    console.log(response);
    const data = await response.json();
    if (!response.ok) {
      throw Error(data.status);
    }
  };

  get html() {
    return `
      <nav class="navbar navbar-expand-lg bg-body-secondary navbar-light bg-light sticky-stop">
        <a class="btn border border-secondary border-2" data-bs-toggle="offcanvas" href="#header-offcanvas" role="button" aria-controls="header-offcanvas">
          <span class="navbar-toggler-icon"></span>
        </a>
        <a id="title-link" class="navbar-brand ps-4 display-4">Transcendence</a>
        <div class="ms-auto px-5 d-flex">
          <form id="search-user-form" class="form-inline px-4 d-none d-md-block">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text" id="basic-addon1">@</span>
              </div>
              <input id="search-user-input" type="text" class="form-control" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1">
            </div>
          </form>
          <button id="user-profile-button" class="btn btn-link"">
            <span class="Button-content">
              <span class="Button-label"><img src="https://avatars.githubusercontent.com/u/110250805?v=4" alt="" size="32" height="32" width="32" data-view-component="true" class="avatar rounded-circle"></span>
            </span>
          </button>
        </div>
      </nav>
      <div class="offcanvas offcanvas-dark offcanvas-start rounded-end mw-100 p-3 bg-body-secondary" tabindex="-1" id="header-offcanvas" aria-labelledby="offcanvasExampleLabel">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title fa-2x" id="offcanvasExampleLabel">Transcendence</h5>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
            <li class="nav-item">
              <a id="navigate-home-link" class="nav-link active" aria-current="page">
                <i class="bi bi-house px-2 fa-2x"></i>
                <span class="fa-2x align-bottom">
                  Home
                </span>
              </a>
            </li>
            <li class="nav-item">
              <a id="navigate-pong-game-link" class="nav-link active" aria-current="page">
                <i class="bi bi-controller px-2 fa-2x"></i>
                <span class="fa-2x align-bottom">
                  PongGame
                </span>
              </a>
            </li>
            <li class="nav-item">
              <a id="navigate-chat-link" class="nav-link active" aria-current="page">
                <i class="bi bi-chat-dots px-2 fa-2x"></i>
                <span class="fa-2x align-bottom">
                  Chat
                </span>
              </a>
            </li>
            <li class="nav-item">
              <a id="navigate-typing-game-link" class="nav-link active" aria-current="page">
                <i class="bi bi-keyboard px-2 fa-2x"></i>
                <span class="fa-2x align-bottom">
                  TypingGame
                </span>
              </a>
            </li>
            <li class="nav-item">
              <a id="navigate-settings-link" class="nav-link active" aria-current="page">
                <i class="bi bi-gear px-2 fa-2x"></i>
                <span class="fa-2x align-bottom">
                  Settings
                </span>
              </a>
            </li>
            <li class="nav-item">
              <a id="navigate-signout-link" class="nav-link active" aria-current="page">
                <i class="bi bi-box-arrow-right px-2 fa-2x"></i>
                <span class="fa-2x align-bottom">
                  Signout
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    `;
  }
}
