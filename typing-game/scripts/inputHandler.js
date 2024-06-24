const inputHandler = (function() {
    const inputField = uiController.getInputField();

    inputField.addEventListener("input", () => {
		console.log("Input: ", inputField.value);
        if (inputField.value === gameController.getCurrentWord()) {
            gameController.handleCorrectInput();
        }
    });

    function resetInput() {
        inputField.value = "";
        inputField.focus();
    }

    return {
        resetInput
    };
})();
