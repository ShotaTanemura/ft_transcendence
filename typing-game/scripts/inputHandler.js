import { gameController } from "./gameController.js";

const inputHandler = (function() {

    function handleInput(value) {
        const currentWord = gameController.getCurrentWord();
        if (value === currentWord) {
            gameController.handleCorrectInput();
        }
    }

    return {
        handleInput,
    };
})();

export { inputHandler };