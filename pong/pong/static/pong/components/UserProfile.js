import { Component } from "../core/component.js";
import { Header } from "./Header.js";
import { getUsersDataFromName } from "../api/api.js";

export class UserProfile extends Component {
  constructor(router, params, state) {
    super(router, params, state);
    this.parameters = params;
    if (this.parameters.user_name) {
      this.loadUserProfile(this.parameters.user_name);
    }
  }

  afterPageLoaded() {
    this.headerComponent = new Header(this.router, this.params, this.state);
    this.element.parentElement.prepend(this.headerComponent.element);
    this.headerComponent.afterPageLoaded();

    const backButton = this.findElement("#back-button");
    if (backButton) {
      backButton.addEventListener("click", () => {
        this.router.goBackPage();
      });
    }
  }

  beforePageUnload() {
    this.element.parentElement.removeChild(this.headerComponent.element);
  }

  async loadUserProfile(user_name) {
    try {
      const users = await getUsersDataFromName(user_name);
      if (!users) {
        throw new Error("User not found");
      }
      if (users[0]) {
        this.updateProfileUI(users[0]);
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
      window.alert("Failed to load user profile");
      this.router.goNextPage("/");
    }
  }

  updateProfileUI(user) {
    this.findElement("#username").textContent = user.name;
    this.findElement("#user-icon").src = user.icon;
  }

  get html() {
    return `
        <div class="profile-card">
            <h1>プロフィールページ</h1>
            <img id="user-icon">
            <p><strong>Username:</strong> <span id="username"></span></p>
            <br>
            <button id="back-button">元のページに戻る</button>
        </div>
        `;
  }
}
