import { Component } from "../core/component.js";
import { Header } from "./Header.js";

export class EditProfile extends Component {
  #uuid = null;

  constructor(router, params, state) {
    super(router, params, state);

    this.findElement("form.edit-profile-form").onsubmit =
      this.handleEditProfile;
  }

  afterPageLoaded = () => {
    this.headerComponent = new Header(this.router, this.params, this.state);
    this.element.parentElement.prepend(this.headerComponent.element);
    this.headerComponent.afterPageLoaded();
    this.loadUserProfile();
  };

  beforePageUnload = () => {
    this.element.parentElement.removeChild(this.headerComponent.element);
  };

  async loadUserProfile() {
    try {
      this.#uuid = await this.get_uuid();
      if (!this.#uuid) {
        throw new Error("UUID not found");
      }
      const user = await this.get_user_from_uuid(this.#uuid);
      if (!user) {
        throw new Error("User not found");
      }
      this.updatePlaseholders(user);
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

  handleEditProfile = async (event) => {
    event.preventDefault();
    try {
      const user_response = await fetch(`/pong/api/v1/users/${this.#uuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: event.target.username.value,
          email: event.target.email.value,
        }),
      });
      console.log(user_response);
      if (!user_response.ok) {
        const errorData = await user_response.json();
        const errorMessage = errorData.message;
        console.log(errorMessage);
        alert(`既に存在するメールアドレスまたはユーザー名です`);
        return;
      }

      const fileField = event.target.icon;
      if (fileField.files.length <= 0) {
        this.router.goNextPage("/");
        return;
      }
      const formData = new FormData();
      formData.append("icon", fileField.files[0]);

      const icon_response = await fetch(
        `/pong/api/v1/users/${this.#uuid}/icon`,
        {
          method: "POST",
          body: formData,
        },
      );
      console.log(icon_response);
      this.router.goNextPage("/");
    } catch (error) {
      console.error("Failed to edit user profile:", error);
      window.alert("Failed to edit user profile");
    }
  };

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
