import { Component } from "../core/component.js";

export class Edit2FA extends Component {
    constructor(router, params, state) {
        super(router, params, state);
        this.findElement("button.generate-qrcode").onclick = this.generateQRCode;
    }

    async getTotpUri() {
        const response = await fetch(`/pong/api/v1/auth/two-factor/provisioning`, {
            method: "POST",
        });
        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch provisioning TOTP URI");
        }
        const data = await response.json();
        if (!data.uri) {
            throw new Error(data.message || "Failed to fetch provisioning TOTP URI");
        }
        return data.uri;
    }

    insertTotpCodeForm() {
        const formTotpCodeContainer = this.findElement("div.totp-fom-container");
        const formHTML = `
            <form class="totp-form">
                <label for="totp-code">6桁の認証コード:</label>
                <input type="text" class="totp-code" name="totp-code" maxlength="6" required>
                <br><br>
                <button type="submit">送信</button>
            </form>
        `;

        formTotpCodeContainer.innerHTML = formHTML;
    }

    generateQRCode = async () => {
        let uri_challange;

        try {
            uri_challange = await this.getTotpUri();
        } catch (error) {
            console.log(error);
            alert("QRコードの生成に失敗しました。");
        }

        const uri = uri_challange;

        const qrcodeContainer = this.findElement("div.qrcode-container");

        qrcodeContainer.innerHTML = "";

        new QRCode(qrcodeContainer, {
            text: uri,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        this.insertTotpCodeForm();
    };

    get html() {
        return `
          <button class="generate-qrcode" type="submit">二要素認証アプリケーション用QRコードを取得する</button>
          <div class="qrcode-container"></div>
          <div class="totp-fom-container"></div>
        `;
    }
}
