import { Component } from "../core/component.js";

export class Totp extends Component {
    constructor(router, params, state) {
        super(router, params, state);
        this.findElement("form.totp-form").onsubmit = this.handleTotp;
    }

    postTotp = async (jsonData) => {
        const response = await fetch("/pong/api/v1/auth/token/totp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: jsonData,
        });
        console.log(response);
        const data = await response.json();
    
        if (!response.ok) {
          switch (response.status) {
            case 400:
              throw Error("認証コードに誤りがあります");
            default:
              throw Error(data.status);
          }
        }
        return data;
      };

    handleTotp = async (event) => {
        event.preventDefault();
        const totpJson = JSON.stringify({
            code: event.target["totp-code"].value,
        });
        try {
            await this.postTotp(totpJson);
        } catch (error) {
            alert(error);
            return;
        }
        this.router.goNextPage("/home");
    };

    get html() {
        return `
                <h1>二要素認証</h1>
                <br/>
                <form class="totp-form">
                    <label for="totp-code">6桁の認証コード:</label>
                    <input type="text" class="totp-code" name="totp-code" maxlength="6" required>
                    <br><br>
                    <button type="submit">送信</button>
                </form>
                </br>
            `;
      }
}
