import { Component } from "../core/component.js";


export class TypingGame extends Component {
    constructor(router, parameters, state) {
        super(router, parameters, state);
        
        // websocketでの接続テスト
        this.connection = this.getRouteContext("WebSocket");
        if (!this.connection) {
            console.error("WebSocket connection is undefined, creating a new connection.");
        }
        this.connection.onmessage = this.onMessage;
        
        document.addEventListener("keydown", (e) => {
            this.connection.send(
                JSON.stringify({
                    sender: "player",
                    type: "gameKeyEvent",
                    contents: e.key,
                }),
            );
        });
    }
    onMessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("Message received:", message);
    };
}
