document.addEventListener('DOMContentLoaded', (event) => {
    const pongButton = document.getElementById('pongButton');
    const profileButton = document.getElementById('profileButton');
    const contentDiv = document.getElementById('content');

    pongButton.addEventListener('click', () => {
        fetch('/pong/')
            .then(response => response.text())
            .then(html => {
                contentDiv.innerHTML = html;
                loadScript('/static/js/pong.js', () => {
                    if (typeof startPongGame === 'function') {
                        startPongGame();
                    } else {
                        console.error('startPongGame is not defined');
                    }
                });
            });
    });

    profileButton.addEventListener('click', () => {
        fetch('/profile/')
            .then(response => response.text())
            .then(html => {
                contentDiv.innerHTML = html;
            });
    });
});

function loadScript(url, callback) {
    const script = document.createElement('script');
    script.src = url;
    script.onload = callback;
    document.head.appendChild(script);
}