import { Component } from "../core/component.js";
import { getUuid, getUserFromUuid } from "../api/api.js";

export class Profile extends Component {
  constructor(router, params, state) {
    super(router, params, state);
    this.loadUserProfile();
    this.findElement("button.edit-profile-button").onclick = this.goEditProfile;
    this.findElement("button.edit-2fa-button").onclick = this.goEdit2FA;
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

  goEdit2FA = () => {
    this.router.goNextPage("/edit-2fa");
  };

  get html() {
    return `
            <h1>プロフィールページ</h1>
            <img id="user-icon">
            <p><strong>Username:</strong> <span id="username"></span></p>
            <p><strong>E-mail:</strong> <span id="email"></span></p>
            <br>
            <button class="edit-profile-button">プロフィールを変更する</button>
            <button class="edit-2fa-button">二要素認証の設定を変更する</button>
        `;
  }
}
