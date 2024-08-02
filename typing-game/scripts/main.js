import { gameController } from './gameController.js';
import { uiController } from './uiController.js';

// client
document.addEventListener('DOMContentLoaded', async () => {
    uiController.initializeUI();
    const gameInitialized = await gameController.initializeGame();
    if (gameInitialized) {
        document.getElementById('startButton').addEventListener('click', () => {
            gameController.startGame();
        });
    } else {
        console.error('Failed to initialize game.');
    }
});