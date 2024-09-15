import { Component } from "../core/component.js";
import { Header } from "./Header.js";

export class Home extends Component {
  constructor(router, params, state) {
    super(router, params, state);
    this.findElement("button.go-realtime-pong-button").onclick =
      this.goRealtimePong;
    this.findElement("button.go-realtime-typing-button").onclick =
      this.goRealtimeTyping;
    this.findElement("button.go-chat-button").onclick = this.goChat;
  }

  afterPageLoaded() {
    this.headerComponent = new Header(this.router, this.params, this.state);
    this.element.parentElement.prepend(this.headerComponent.element);
    this.headerComponent.afterPageLoaded();
  }

  beforePageUnload() {
    this.element.parentElement.removeChild(this.headerComponent.element);
  }

  goRealtimePong = () => {
    this.router.goNextPage("/pong-game-home");
  };
  goRealtimeTyping = () => {
    this.router.goNextPage("/typing-game-home");
  };
  goChat = () => {
    this.router.goNextPage("/chat");
  };

  verifyJwtToken = async () => {
    const responseToken = await fetch("/pong/api/v1/auth/token/verify", {
      method: "POST",
    });
    console.log(responseToken);
    if (responseToken.ok) {
      return;
    }
    const responseRefreshToken = await fetch(
      "/pong/api/v1/auth/token/refresh",
      {
        method: "POST",
      },
    );
    console.log(responseRefreshToken);
    if (responseRefreshToken.ok) {
      return;
    }
    this.router.goNextPage("/");
  };

  goProfile = () => {
    this.router.goNextPage("/profile");
  };

  get html() {
    return `
    <main class="home">
      <div class="home-container">
        <div class="home-description">
          <h1>Realtime Pong Game</h1>
          <p>2人対戦が可能なPONG GAMEです。<br />操作はシンプルで、ボールを相手側に弾き返すだけの簡単なルールです。</p>
        </div>
        <div class="home-card">
        <button class="go-realtime-pong-button">PONG GAMEをする</button>
        </div>
      </div>
      <div class="home-container">
        <div class="home-card">
          <button class="go-chat-button">CHATをする</button>
        </div>
        <div class="home-description">
          <h1>Realtime Chat Application</h1>
          <p>チャットが可能です。<br />リアルタイムで友人や他のプレイヤーとコミュニケーションが取れます。</p>
        </div>
      </div>
      <div class="home-container">
        <div class="home-description">
          <h1>Realtime Typing Game</h1>
          <p>2人対戦が可能なTYPING GAMEです。<br />タイピング速度を競って、より早く正確に文字を入力するゲームです。</p>
        </div>
        <div class="home-card">
          <button class="go-realtime-typing-button">TYPING GAMEをする</button>
        </div>
      </div>
      </main>
      `;
  }
}
