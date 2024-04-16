// utils.js includes helper functions

/**
 * Checks if a given text contains only word characters.
 * @param {string} text - The text to be checked.
 * @returns {boolean} - True if the text contains only word characters, false otherwise.
 */
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

/**
 * Checks if a given text is empty.
 * @param {string} text - The text to check.
 * @returns {boolean} - True if the text is empty, false otherwise.
 */
function isEmpty(text) {
    return text == null || text.trim().length == 0;
}
