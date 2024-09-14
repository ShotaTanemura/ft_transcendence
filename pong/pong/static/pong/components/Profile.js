import { Component } from "../core/component.js";
import { getUuid, getUserFromUuid } from "../api/api.js";

export class Profile extends Component {
  constructor(router, params, state) {
    super(router, params, state);
    this.loadUserProfile();
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
      // アラート出してから
      this.router.goNextPage("/");
    }
  }

  updateProfileUI(user) {
    this.findElement("#username").textContent = user.name;
    this.findElement("#email").textContent = user.email;
    this.findElement("#user-icon").src = user.icon;
    console.log(user.icon);
  }

  get html() {
    return `
            <h1>プロフィールページ</h1>
            <img id="user-icon">
            <p><strong>Username:</strong> <span id="username"></span></p>
            <p><strong>E-mail:</strong> <span id="email"></span></p>
        `;
  }
}
