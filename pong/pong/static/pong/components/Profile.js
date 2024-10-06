import { Component } from "../core/component.js";
import { Header } from "./Header.js";
import { getUuid, getUserFromUuid } from "../api/api.js";

export class Profile extends Component {
  constructor(router, params, state) {
    super(router, params, state);
    this.loadUserProfile();
    this.findElement("button.edit-profile-button").onclick = this.goEditProfile;
  }

  afterPageLoaded() {
    this.headerComponent = new Header(this.router, this.params, this.state);
    this.element.parentElement.prepend(this.headerComponent.element);
    this.headerComponent.afterPageLoaded();
  }

  beforePageUnload() {
    this.element.parentElement.removeChild(this.headerComponent.element);
  }

  async loadUserProfile() {
    try {
      const uuid = await getUuid();
      if (!uuid) {
        throw new Error("UUID not found");
      }
      const user = await getUserFromUuid(uuid);
      if (!user) {
        throw new Error("User not found");
      }
      this.updateProfileUI(user);
    } catch (error) {
      console.error("Failed to load user profile:", error);
      window.alert("Failed to load user profile");
      this.router.goNextPage("/");
    }
  }

  updateProfileUI(user) {
    this.findElement("#username").textContent = user.name;
    this.findElement("#email").textContent = user.email;
    this.findElement("#user-icon").src = user.icon;
    console.log(user.icon);
  }

  goEditProfile = () => {
    this.router.goNextPage("/edit-profile");
  };

  get html() {
    return `
        <div class="profile-card">
            <h1>プロフィールページ</h1>
            <img id="user-icon" height="256" width="256">
            <br>
            <br>
            <p><strong>Username:</strong> <span id="username"></span></p>
            <p><strong>E-mail:</strong> <span id="email"></span></p>
            <br>
            <button class="edit-profile-button">プロフィールを変更する</button>
        </div>
        `;
  }
}
