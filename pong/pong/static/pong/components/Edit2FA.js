import { Component } from "../core/component.js";

export class Edit2FA extends Component {
    constructor(router, params, state) {
        super(router, params, state);
        this.findElement("button.generate-qrcode").onclick = this.generateQRCode.bind(this);
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

    async generateQRCode() {
        let uri_challange;
    
        try {
            uri_challange = await this.getTotpUri();
        } catch(error) {
            console.log(error);
            alert("QRコードの生成に失敗しました。");
        }
    
        const uri = uri_challange;
    
        const qrcodeContainer = document.getElementById("qrcode");
    
        qrcodeContainer.innerHTML = "";
    
        new QRCode(qrcodeContainer, {
            text: uri,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    };

    get html() {
        return `
          <button class="generate-qrcode" type="submit">二要素認証アプリケーション用QRコードを取得する</button>
          <div id="qrcode"></div>
        `;
      }
}
