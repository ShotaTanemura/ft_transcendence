import { gameController } from './gameController.js';

document.addEventListener('DOMContentLoaded', async () => {
    const gameInitialized = await gameController.initializeGame();
    if (gameInitialized) {
        document.getElementById('startButton').addEventListener('click', () => {
            gameController.startGame();
        });
    } else {
        console.error('Failed to initialize game.');
    }
});
