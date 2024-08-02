import { gameController } from "./gameController.js";

const inputHandler = (function() {
    
    function handleInput(value) {
        const currentWord = gameController.getCurrentWord();
        if (value === currentWord) {
            gameController.handleCorrectInput();
        }
    }

    function resetInput() {
        const inputDisplay = document.getElementById('inputDisplay');
        if (inputDisplay) {
            inputDisplay.textContent = '';
        }
    }

    return {
        handleInput,
        resetInput
    };
})();

export { inputHandler };