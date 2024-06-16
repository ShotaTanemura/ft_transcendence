import {Component} from '../core/component.js'

export class Room extends Component {
	constructor(router, parameters, state) {
		super(router, parameters, state);

		//get global context
		this.roomID = this.router.getContext("roomID");
		this.displayName = this.router.getContext("displayName");

		//creating websocket
		this.gameSocket = new WebSocket("ws://"
		+ window.location.host
		+ "/ws/realtime/"
		+ this.roomID
		+ "/");

		//register event handler
		this.gameSocket.onopen = (e) => {
			this.gameSocket.send(JSON.stringify({
				"type": "socket-connected",
				'displayName': this.displayName,
            }));
		}

		this.gameSocket.onmessage = (e) => {
            const data = JSON.parse(e.data);
			switch (data.type){
				case "user_connected":
            		document.querySelector('#chat-log').value += ("#Hoooo! " + data.displayName +' is connected\n');
					break;
				case "user_disconnected":
            		document.querySelector('#chat-log').value += ("#Oops! " + data.displayName +' is disconnected\n');
					break;
				case "chat_message": 
            		document.querySelector('#chat-log').value += (data.displayName + ': ' + data.message + '\n');
					break;
			}
        };

        this.gameSocket.onclose = (e) => {
			this.gameSocket.send(JSON.stringify({
				"type": "socket-disconnected",
				'displayName': this.displayName,
            }));
            console.error('Chat socket closed unexpectedly');
        };

		this.findElement('#chat-message-input').focus();
		this.findElement('#chat-message-input').onkeyup = (e) =>  {
            if (e.keyCode === 13) {  // enter, return
                document.querySelector('#chat-message-submit').click();
            }
        };

        this.findElement('#chat-message-submit').onclick = (e) => {
            const messageInputDom = document.querySelector('#chat-message-input');
            const message = messageInputDom.value;

            this.gameSocket.send(JSON.stringify({
				"type": "message",
				'displayName': this.displayName,
                'message': message
            }));
            messageInputDom.value = '';
        };
	}

	get html() {
		return (`
			<h1>Display Name: ${this.router.getContext("displayName")}</h1>
			<h1>Room ID: ${this.router.getContext("roomID")}</h1>
			<textarea id="chat-log" cols="100" rows="20"></textarea><br>
			<input id="chat-message-input" type="text" size="100"><br>
			<input id="chat-message-submit" type="button" value="Send">
		`)
	}
}
