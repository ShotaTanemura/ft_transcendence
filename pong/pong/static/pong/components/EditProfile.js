import { Component } from "../core/component.js";

export class EditProfile extends Component {
  constructor(router, params, state) {
    super(router, params, state);
    this.loadUserProfile();
  }

  async loadUserProfile() {
    try {
      const uuid = await this.get_uuid();
      if (!uuid) {
        throw new Error("UUID not found");
      }
      const user = await this.get_user_from_uuid(uuid);
      if (!user) {
        throw new Error("User not found");
      }
      this.updatePlaseholders(user);
      this.findElement("button.submit-form").onsubmit = this.handleEditProfile(uuid);
    } catch (error) {
      console.error("Failed to load user profile:", error);
      window.alert("Failed to load user profile");
      this.router.goNextPage("/");
    }
  }

  async get_uuid() {
    try {
      const response = await fetch("/pong/api/v1/auth/token/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        throw new Error(data.message || "Failed to verify token");
      }
      return data.uuid;
    } catch (error) {
      console.error("Error verifying token:", error);
      return null;
    }
  }

  async get_user_from_uuid(uuid) {
    try {
      const response = await fetch(`/pong/api/v1/users/${uuid}`, {
      method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user data");
      }
      return data;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }

  updatePlaseholders(user) {
    this.findElement("#username").placeholder = user.name;
    this.findElement("#email").placeholder = user.email;
  }

  async handleEditProfile(uuid) {
    try {
      console.log(
        this.findElement("#username").value,
        this.findElement("#email").value,
      )
      const response = await fetch(`/pong/api/v1/users/${uuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: this.findElement("#username").value,
          email: this.findElement("#email").value,
        }),
      });
      console.log(response);
    } catch (error) {
      console.error("Failed to edit user profile:", error);
      window.alert("Failed to edit user profile");
    }
  }

  get html() {
    return `
      <h1>Edit Profile</h1>
      <form class="edit-profile-form">
          <label for="username">Username</label>
          <input type="text" placeholder="username" id="username" name="name"><br/>
          <label for="email">Email</label>
          <input type="email" placeholder="email" id="email" name="email"><br/>
          <label for="icon">Icon</label>
          <input type="file" id="icon" name="icon" accept="image/*"><br/>
          <button class="submit-form" type="submit">確定する</button>
      </form>
    `;
  }
}
