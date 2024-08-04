import { Component } from "../core/component.js";

export class Profile extends Component {
    constructor(router, params, state) {
        super(router, params, state);
        this.loadUserProfile();
    }

    async loadUserProfile() {
        try {
            const uuid = await this.get_uuid();
            if (!uuid) {
                throw new Error('UUID not found');
            }
            const user = await this.get_user_from_uuid(uuid);
            if (!user) {
                throw new Error('User not found');
            }
            this.updateProfileUI(user);
        } catch (error) {
            console.error('Failed to load user profile:', error);
            // アラート出してから
			this.router.goNextPage("/");
        }
    }

    async get_uuid() {
        try {
            const response = await fetch("/pong/api/v1/auth/token/verify", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            const data = await response.json();
            console.log(data);
            if (!response.ok) {
                throw new Error(data.message || 'Failed to verify token');
            }
            return data.uuid;
        } catch (error) {
            console.error('Error verifying token:', error);
            return null;
        }
    }

    updateProfileUI(user) {
        this.findElement("#username").textContent = user.name;
        this.findElement("#email").textContent = user.email;
        this.findElement("#user-icon").src = user.icon;
        console.log(user.icon);
    }

    async get_user_from_uuid(uuid) {
        try {
            const response = await fetch(`/pong/api/v1/users/${uuid}`, {
                method: "GET",
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            const data = await response.json();
            console.log(data);
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch user data');
            }
            return data;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    }

    get html() {
        return (`
            <h1>プロフィールページ</h1>
            <img id="user-icon">
            <p><strong>Username:</strong> <span id="username"></span></p>
            <p><strong>E-mail:</strong> <span id="email"></span></p>
        `);
    }
}
