/*
参考コード: https://github.com/CodeExplainedRepo/Ping-Pong-Game-JavaScript
*/

//TODO:後で修正
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 1200;

data = {
  ball: {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    radius: 10,
    color: "WHITE",
  },
  user: {
    x: 0,
    y: 0,
    width: 10,
    height: 100,
    color: "WHITE",
  },
  com: {
    x: 0,
    y: 0,
    width: 10,
    height: 100,
    color: "WHITE",
  },
};

const PONGURL = "ws://127.0.0.1:8000/ws/pong/";

const socket = new WebSocket(PONGURL);

// キーが押されたら、JSON形式でserverに送信
function sendKeyToServer(event) {
    const key = event.key;
    console.log("キーが押されました:", key);
    const jsonData = JSON.stringify({
        "key": key,
    });
    socket.send(jsonData);
}

// WebSocket 接続時の処理
socket.onopen = function () {
    console.log("WebSocket 接続成功");
};

// メッセージ受信時の処理
socket.onmessage = function (event) {
    data = JSON.parse(event.data);
    console.log("受信メッセージ:", data);
    render();
};

// エラー発生時の処理
socket.onerror = function (error) {
    console.log("WebSocket エラー:", error);
};

const canvas = document.getElementById("pong");
const ctx = canvas.getContext('2d');
document.addEventListener("keypress", sendKeyToServer);

function drawText(text, x, y) {
    ctx.fillStyle = "#FFF";
    ctx.font = "75px Arial";
    ctx.fillText(text, x, y);
}

function drawRect(x, y, w, h, color) {
    
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawArc(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

// render function, the function that does al the drawing
function render() {
    drawRect(0, 0, canvas.width, canvas.height, "dimgray");
    drawText(data.user.score, canvas.width / 4, canvas.height / 5);
    drawText(data.com.score, 3 * canvas.width / 4, canvas.height / 5);
    drawRect(data.user.x, data.user.y, data.user.width, data.user.height, data.user.color);
    drawRect(data.com.x, data.com.y, data.com.width, data.com.height, data.com.color);
    drawArc(data.ball.x, data.ball.y, data.ball.radius, data.ball.color);
}

