// MOVEMENTS
const INVALID_KEY = -1;
const HOLD = 0;

const MOVE_LEFT = 1;
const MOVE_RIGHT = 2;

const ROTATE_LEFT = 3;
const ROTATE_RIGHT = 4;

const SOFT_DROP = 5;
const HARD_DROP = 6;

const CHEAT_MODE = 7;
const PUNISH_DEBUG = 8;

/**
 * Array of possible movements in the game.
 * @type {Array<string>}
 */
const ACTIONS = [
    HOLD,

    MOVE_LEFT,
    MOVE_RIGHT,

    ROTATE_LEFT,
    ROTATE_RIGHT,

    SOFT_DROP,
    HARD_DROP,

    CHEAT_MODE,
    PUNISH_DEBUG
];

/**
 * Converts a key code to an action in the game.
 * @param {number} key - The key code of the pressed key.
 * @returns {number} - The corresponding action code.
 * @example
 * $(document).on("keydown", function(event){
 *    action = action_from_key(event.keyCode);
 *    if(action<0) return; // Invalid action
 *    // Use name of action
 *    if(action==HOLD) // do something
 *    // OR use ID of action
 *    if(action==0) // do something
 * });
 */
function action_from_key(key) {
    const SPACEBAR = 32;
    const LEFT_KEY = 37;
    const UP_KEY = 38;
    const RIGHT_KEY = 39;
    const DOWN_KEY = 40;
    const KEY_Z = 90;
    const KEY_C = 67;
    const KEY_X = 88;
    const KEY_Y = 89;

    if (key == KEY_C) return HOLD;

    if (key == LEFT_KEY) return MOVE_LEFT;
    if (key == RIGHT_KEY) return MOVE_RIGHT;

    if (key == KEY_Z) return ROTATE_LEFT;
    if (key == UP_KEY) return ROTATE_RIGHT;

    if (key == DOWN_KEY) return SOFT_DROP;
    if (key == SPACEBAR) return HARD_DROP;

    if (key == KEY_X) return CHEAT_MODE;

    // DEBUG
    if (key == KEY_Y) return PUNISH_DEBUG;

    return -1;
}
