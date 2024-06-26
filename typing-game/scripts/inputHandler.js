import { gameController } from "./gameController.js";

const inputHandler = (function() {
    const inputDisplay = document.getElementById("inputDisplay");

    function handleInput(value) {
        const currentWord = gameController.getCurrentWord();
        if (value === currentWord) {
            gameController.handleCorrectInput();
            inputDisplay.textContent = ''; // 正解したら表示をクリア
        }
    }

    return {
        handleInput,
        resetInput: () => {
            inputDisplay.textContent = "";
        }
    };
})();

export { inputHandler };