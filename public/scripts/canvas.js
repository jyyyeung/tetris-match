$(function () {
    /* Get the canvas and 2D context */
    console.log("canvas.js");

    /* Create the sprites in the game */
    // const player = Player(context, 427, 240, gameArea); // The player
    // const gem = Gem(context, 427, 350, "green"); // The gem
});
const MATRIX_WIDTH = 10;
const MATRIX_HEIGHT = 15;
const BLOCK_SIZE = 32;

const grassland = [];

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Represents a matrix for rendering tetromino blocks on a canvas.
 *
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @returns {Object} An object containing methods for manipulating and rendering the matrix.
 */
const Matrix = function (ctx) {
    let matrix = resetMatrix();

    /**
     * Creates a 2D array representing the matrix.
     *
     * @param {number} [d1=MATRIX_WIDTH] - The width of the matrix.
     * @param {number} [d2=MATRIX_HEIGHT] - The height of the matrix.
     * @returns {Array} The created matrix array.
     */
    function makeArray(d1 = MATRIX_WIDTH, d2 = MATRIX_HEIGHT) {
        var arr = [];
        for (let i = 0; i < d2; i++) {
            arr.push(new Array(d1));
        }
        matrix = arr;
        return arr;
    }

    /**
     * Renders the matrix on the canvas.
     */
    function renderMatrix() {
        const colors = {
            0: "empty",
            O: "red",
            S: "yellow",
            L: "green",
            Z: "lightBlue",
            J: "pink",
            T: "darkBlue",
            I: "purple",
            1: "grey",
        };
        for (let y = 0; y < MATRIX_HEIGHT; y++) {
            for (let x = 0; x < MATRIX_WIDTH; x++) {
                const n = matrix[y][x];
                if (n) {
                    renderSingle(x, y, colors[n]);
                }
            }
        }
    }

    /**
     * Renders a single tetromino block on the canvas.
     *
     * @param {number} x - The x-coordinate of the block.
     * @param {number} y - The y-coordinate of the block.
     * @param {string} color - The color of the block.
     */
    function renderSingle(x, y, color) {
        Mino(ctx, 16 + 32 * x, 432 - 32 * y, color).draw();
    }

    function resetMatrix() {
        return makeArray(MATRIX_WIDTH, MATRIX_HEIGHT + 2);
    }

    return {
        array: matrix,
        renderMatrix,
        renderSingle,
        resetMatrix,
    };
};

/**
 * Represents a canvas object.
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
 * @returns {Object} - The canvas object with various methods.
 */
const Canvas = function (ctx) {
    var p = 0;

    var GA_WIDTH = MATRIX_WIDTH * BLOCK_SIZE;
    var GA_HEIGHT = MATRIX_HEIGHT * BLOCK_SIZE;
    const gameArea = BoundingBox(ctx, 0, 0, GA_HEIGHT, GA_WIDTH);
    /**
     * Draws a grid on the canvas.
     */
    function drawGrid() {
        ctx.beginPath();
        for (var x = 0; x <= GA_WIDTH; x += BLOCK_SIZE) {
            ctx.moveTo(0.5 + x + p, p);
            ctx.lineTo(0.5 + x + p, GA_HEIGHT + p);
        }

        for (var y = 0; y <= GA_HEIGHT; y += BLOCK_SIZE) {
            ctx.moveTo(p, 0.5 + y + p);
            ctx.lineTo(GA_WIDTH + p, 0.5 + y + p);
        }
        ctx.strokeStyle = "rgba(0,255,255,0.3)";
        ctx.stroke();
        ctx.closePath();
    }

    /**
     * Sets the time value in the DOM element with id "time".
     * @param {number} time - The time value to be set.
     */
    function setTime(time) {
        $("#time").text(time);
    }

    /**
     * Sets the level of difficulty.
     * @param {number} level - The level of difficulty.
     */
    function setLevel(level) {
        $("#difficulty").text(level);
    }

    return {
        gameArea,
        drawGrid,
        setTime,
        setLevel,
    };
};

const TIME_MODE = 1;
const SURVIVAL_MODE = 2;

const GameArea = function (cv, ctx, isPlayer = true) {
    const totalGameTime = 120; // Total game time in seconds

    const icons = {
        O: "url(../src/res/icon-sprite.png) 0 0",
        Z: "url(../src/res/icon-sprite.png) 128px 0",
        S: "url(../src/res/icon-sprite.png) 384px 0",
        L: "url(../src/res/icon-sprite.png) 256px 0",
        J: "url(../src/res/icon-sprite.png) 0 96px",
        T: "url(../src/res/icon-sprite.png) 384px 96px",
        I: "url(../src/res/icon-sprite.png) 256px 96px",
    };

    let gameArea = null;
    const canvas = Canvas(ctx);

    let score = 0;
    let tetrisCount = 0;
    let linesOfBlocks = 0;
    let level = 1;

    /**
     * Represents the current tetromino.
     * @type {Tetromino|null}
     */
    let currentTetromino = null;
    let nextTetrominos = [];
    let holdTetromino = null;

    let isCheating = false;
    let isTetris = false;
    let lastKeyUpAt = 0;
    let keyDownAt = 0;

    /**
     * Represents the game mode.
     * @type {number} - The game mode. 1 for time mode, 2 for survival mode.
     */
    let gameMode = 0;

    function translateAction(action, isKeyDown) {
        if (isKeyDown) {
            // Invalid Action
            if (action == INVALID_KEY) return;

            if (action == MOVE_LEFT) {
                return currentTetromino.move(MOVE_LEFT, isPlayer, level);
            }
            if (action == MOVE_RIGHT) {
                return currentTetromino.move(MOVE_RIGHT, isPlayer, level);
            }
            if (action == ROTATE_LEFT) {
                return currentTetromino.move(ROTATE_LEFT, isPlayer, level);
            }
            if (action == ROTATE_RIGHT) {
                return currentTetromino.move(ROTATE_RIGHT, isPlayer, level);
            }
            if (action == SOFT_DROP) {
                console.log("soft dropping");
                return currentTetromino.move(SOFT_DROP, isPlayer, level);
            }
            if (action == HARD_DROP) {
                console.log("keydown: hard drop");
                // console.table(currentTetromino.minosMatrix);
                // const fixTetromino = currentTetromino;
                currentTetromino.move(HARD_DROP, isPlayer, level);
                isHardDrop = true;
                return;
            }
            if (action == HOLD) {
                holdCurrentTetromino();
                return;
            }
            if (action == CHEAT_MODE) {
                keyDownAt = new Date();
                setTimeout(function () {
                    // Compare key down time with key up time
                    if (keyDownAt > lastKeyUpAt) {
                        // Key has been held down for x seconds
                        isCheating = true;
                        lastKeyUpAt = new Date();
                    }
                    // Key has not been held down for x seconds
                    else isCheating = false;
                }, 1000);
                return console.log("keydown: cheat mode");
            }
            if (action == PUNISH_DEBUG) {
                console.log("y is pressed");
                isTetris = true;
            }
        } else {
            // Invalid Action
            if (action == INVALID_KEY) return;
            // Handle other movements
            // if (action == SOFT_DROP)
            //     return currentTetromino.move(SOFT_DROP, isPlayer, level, false);
            if (action == CHEAT_MODE) {
                isCheating = false;
                lastKeyUpAt = new Date();
                return console.log("keyup: cheat mode");
            }
        }
    }
    timeRemaining = 4;

    function countdown() {
        // Decrease the remaining time
        timeRemaining--;

        if (timeRemaining > 0) {
            // Continue the countdown if there is still time;
            $("#countdown").text(timeRemaining);
            // Wait for 1 second, and call countdown() again
            setTimeout(countdown, 1000);
        } else {
            // otherwise, start the game when the time is up
            $("#countdown").text("Start");
            // startGame();
            $("#countdown").hide();
            $("#countdown").text("3");
            timeRemaining = 4;
            initGame();
        }
    }

    /* Create the sounds */
    const sounds = {
        background: new Audio("src/res/gameplay-bgm.mp3"),
        rotate: new Audio("src/res/rotate.wav"),
        softdrop: new Audio("src/res/softdrop.wav"),
        harddrop: new Audio("src/res/harddrop.wav"),
        move: new Audio("src/res/move.wav"),
        hold: new Audio("src/res/hold.wav"),
        cheat: new Audio("src/res/cheat.wav"),
        // collect: new Audio("collect.mp3"),
        // gameover: new Audio("gameover.mp3"),
    };

    // let matrix = null;
    // let renderMatrix = null;
    // let resetMatrix = null;

    let matrix = resetMatrix();

    /**
     * Creates a 2D array representing the matrix.
     *
     * @param {number} [d1=MATRIX_WIDTH] - The width of the matrix.
     * @param {number} [d2=MATRIX_HEIGHT] - The height of the matrix.
     * @returns {Array} The created matrix array.
     */
    function makeArray(d1 = MATRIX_WIDTH, d2 = MATRIX_HEIGHT) {
        var arr = [];
        for (let i = 0; i < d2; i++) {
            arr.push(new Array(d1));
        }
        return arr;
    }

    /**
     * Renders the matrix on the canvas.
     */
    function renderMatrix() {
        const colors = {
            0: "empty",
            O: "red",
            S: "yellow",
            L: "green",
            Z: "lightBlue",
            J: "pink",
            T: "darkBlue",
            I: "purple",
            1: "grey",
        };
        for (let y = 0; y < MATRIX_HEIGHT; y++) {
            for (let x = 0; x < MATRIX_WIDTH; x++) {
                const n = matrix[y][x];
                if (n) {
                    renderSingle(x, y, colors[n]);
                }
            }
        }
    }

    /**
     * Renders a single tetromino block on the canvas.
     *
     * @param {number} x - The x-coordinate of the block.
     * @param {number} y - The y-coordinate of the block.
     * @param {string} color - The color of the block.
     */
    function renderSingle(x, y, color) {
        Mino(ctx, 16 + 32 * x, 432 - 32 * y, color).draw();
    }

    function resetMatrix() {
        const _matrix = makeArray(MATRIX_WIDTH, MATRIX_HEIGHT + 2);
        return _matrix;
    }

    const initialize = function (_mode) {
        for (sound in sounds) {
            sound.volume = UI.getSoundsVolume();
        }

        console.log("Game Area Initialized", { isPlayer }, { _mode });
        gameArea = canvas.gameArea;

        gameMode = _mode;

        matrix = resetMatrix();

        /* Handle the start of the game */
        $("#game-container").show(function () {
            console.log("Game Container Shown");

            // Rest all values
            nextTetrominos = [];
            for (let i = 0; i < 3; i++) {
                setNextIcon(i, null);
            }
            currentTetromino = null;
            linesOfBlocks = 0;
            score = 0;
            setScore(0);
            tetrisCount = 0;
            gameStartTime = 0;
            level = 1;
            holdTetromino = null;
            setHoldIcon(null);

            isHardDrop = false;
            isCheating = false;
            clearAndRedraw(false, false);

            if (isPlayer) {
                canvas.setTime("000");
                canvas.setLevel(1);
                countdown();
            }
        });
    };

    /**
     * Sets the background of the next icon element based on the provided parameters.
     *
     * @param {boolean} bool - Indicates whether the player or opponent is being updated. True for player, false for opponent.
     * @param {number} index - The index of the next icon element to update. Must be between 0 and 3.
     * @param {string} block - The character representing the icon to set. Must be one of O, S, L, Z, J, T, or I.
     */
    function setNextIcon(index, block) {
        // bool - true if player, false if opponent. index max 3. block - char (OSLZJTI)
        if (isPlayer)
            $("#player-next")
                .children()
                .eq(index)
                .css("background", block ? icons[block] : "none");
        else
            $("#opponent-next")
                .children()
                .eq(index)
                .css("background", block ? icons[block] : "none");
    }

    function updateNextIcons() {
        // bool - true if player, false if opponent
        for (let i = 0; i < 3; i++) {
            setNextIcon(i, nextTetrominos[i].getLetter());
        }
    }

    /**
     * Sets the score for the player or opponent.
     * @param {boolean} bool - True if player, false if opponent.
     * @param {number} score - The score to set.
     */
    function setScore(score) {
        // bool - true if player, false if opponent
        if (isPlayer) $("#player-score").text(score);
        else $("#opponent-score").text(score);
    }

    /**
     * Sets the hold icon for the player or opponent.
     * @param {boolean} bool - True if player, false if opponent.
     * @param {string} block - The character representing the block (OSLZJTI).
     */
    function setHoldIcon(block) {
        // bool - true if player, false if opponent. block - char (OSLZJTI)
        if (isPlayer)
            $("#player-hold")
                .children()
                .css("background", block ? icons[block] : "none");
        else
            $("#opponent-hold")
                .children()
                .css("background", block ? icons[block] : "none");
    }

    function pushNextTetromino(letter) {
        nextTetrominos.push(new Tetromino(ctx, gameArea, matrix, letter));
        updateNextIcons();
    }

    function holdCurrentTetromino() {
        console.log("Hold Tetromino");
        if (!holdTetromino) {
            // If there is no tetromino in hold
            holdTetromino = currentTetromino;
            currentTetromino = nextTetrominos.shift();
            if (isPlayer) {
                newTetromino = spawnRandomTetromino(ctx, gameArea, matrix);
                nextTetrominos.push(newTetromino);
                Socket.pushNextTetromino(newTetromino.getLetter());
                updateNextIcons();
            }
        } else {
            // If there is a tetromino in hold
            const temp = currentTetromino;
            currentTetromino = holdTetromino;
            holdTetromino = temp;
            currentTetromino.setMatrixXY(3, 12);
        }
        // Update the hold icon
        setHoldIcon(holdTetromino.getLetter());
        currentTetromino.draw();
    }

    const addCheatRow = function () {
        // Loop over rows and shift them up
        // make the last row 1
        console.log("adding cheat row");
        for (let i = MATRIX_HEIGHT - 1; i > 0; i--) {
            matrix[i] = matrix[i - 1];
        }
        matrix[0] = new Array(MATRIX_WIDTH).fill(1);
        sounds.cheat.pause();
        sounds.cheat.currentTime = 0;
        sounds.cheat.play();
        console.table(matrix);
    };

    const addPunishRow = function (hole) {
        // Loop over rows and shift them up
        // make the last row 1
        console.log("adding punish row");
        for (let i = MATRIX_HEIGHT - 1; i > 0; i--) {
            matrix[i] = matrix[i - 1];
        }
        matrix[0] = new Array(MATRIX_WIDTH).fill("O");
        matrix[0][hole] = undefined;
        sounds.cheat.pause();
        sounds.cheat.currentTime = 0;
        sounds.cheat.play();
        console.table(matrix);
    };

    const setLevel = (level) => canvas.setLevel(level);

    /**
     * Checks for full rows in the matrix and updates the score accordingly.
     */
    function checkFullRows() {
        let single = 0;
        let double = 0;
        let triple = 0;
        let tetris = 0;
        let consecuitive = 0;
        const soundEffect = new Audio("src/res/clear.wav");
        soundEffect.volume = UI.getSoundsVolume();

        // Iterate through the rows
        for (let y = MATRIX_HEIGHT - 1; y >= 0; y--) {
            let isFull = true;
            // Iterate through the columns
            for (let x = 0; x < MATRIX_WIDTH; x++) {
                if (!matrix[y][x] || matrix[y][x] == 1) {
                    // If the cell is empty, the row is not full
                    isFull = false;
                    break;
                }
            }
            if (isFull) {
                consecuitive++;
                linesOfBlocks++;
                soundEffect.pause();
                soundEffect.currentTime = 0;
                soundEffect.play();
                // Remove the row
                for (let i = y; i < MATRIX_HEIGHT - 1; i++) {
                    matrix[i] = matrix[i + 1];
                }
                matrix[MATRIX_HEIGHT - 1] = new Array(MATRIX_WIDTH).fill(
                    undefined
                );
            }
            if ((!isFull && consecuitive > 0) || y == 0) {
                if (consecuitive == 1) single++;
                else if (consecuitive == 2) double++;
                else if (consecuitive == 3) triple++;
                else if (consecuitive == 4) tetris++;

                consecuitive = 0;
            }
            // Increase the level if either player has cleared 5 lines
            if (linesOfBlocks % 5 == 0) {
                const newLevel = Math.floor(linesOfBlocks / 5) + 1;
                if (newLevel > level) {
                    Game.setLevel(newLevel);
                }
            }
        }
        score += 40 * level * single;
        score += 50 * level * double * 2;
        score += 100 * level * triple * 3;
        score += 300 * level * tetris * 4;
        tetrisCount += tetris;
        if (tetris) {
            isTetris = true;
            //Game.addPunishRow(false, hole);
        }
        setScore(score);
    }

    const initGame = (_firstTetromino = "", _tetrominos = []) => { 
        nextTetrominos = [];
        if (isPlayer) {
            const initTetrominos = [];
            // console.table(matrix);
            console.log("init", currentTetromino);
            currentTetromino = spawnRandomTetromino(ctx, gameArea, matrix);
            for (let i = 0; i < 3; i++) {
                const tetromino = spawnRandomTetromino(ctx, gameArea, matrix);
                initTetrominos.push(tetromino.getLetter());
                nextTetrominos.push(tetromino);
            }
            Socket.initGame(currentTetromino.getLetter(), initTetrominos);
        } else {
            // console.table(matrix);
            currentTetromino = new Tetromino(
                ctx,
                gameArea,
                matrix,
                _firstTetromino
            );
            nextTetrominos = _tetrominos.map(
                (letter) => new Tetromino(ctx, gameArea, matrix, letter)
            );
            Socket.readyToStart();
        }
    };

    const handleKeyDown = (event) => {
        currentTetromino.updateMinosMatrix(matrix);
        action = action_from_key(event.keyCode);
        if (action == HARD_DROP) {
            // console.table(matrix);
            // console.table(currentTetromino.minosMatrix);
        }
        console.log("Send Key Down", action);
        Socket.keyDown(action);
        playSounds(action);
        translateAction(action, true);
    };

    const handleKeyUp = function (event) {
        action = action_from_key(event.keyCode);
        Socket.keyUp(action);
        translateAction(action, false);
    };

    let gameStartTime = 0; // The timestamp when the game starts
    function startGame() {
        clearAndRedraw();
        gameStartTime = performance.now();

        // Initialize game time and level
        if (gameMode == SURVIVAL_MODE) {
            canvas.setTime(0);
        } else if (gameMode == TIME_MODE) canvas.setTime(totalGameTime);

        canvas.setLevel(level);

        setScore(score);

        updateNextIcons();

        if (isPlayer) {
            // Play Packground music
            sounds.background.volume = UI.getBGMVolume();
            sounds.background.play();
            currentTetromino.updateMinosMatrix(matrix);

            // Handle keydown of controls
            // $(document).on("keydown", handleKeyDown);
            document.addEventListener("keydown", handleKeyDown);

            // Handle keyup of controls
            // $(document).on("keyup");
            document.addEventListener("keyup", handleKeyUp);
        }

        /* Start the game */
        requestAnimationFrame(doFrame);
    }

    /**
     * Checks if the tetromino has hit the ceiling.
     * @returns {boolean} Returns true if the tetromino has hit the ceiling, otherwise returns false.
     */
    const checkHitCeiling = () => {
        for (let x = 0; x < MATRIX_WIDTH; x++) {
            if (matrix[MATRIX_HEIGHT - 1][x]) {
                return true;
            }
        }
        return false;
    };

    const getStats = () => {
        return {
            score,
            linesOfBlocks,
            tetrisCount,
            time: performance.now() - gameStartTime,
        };
    };

    function playSounds(action) {
        if (Game.isGameOver) {
            return;
        }
        let sound = null;
        switch (action) {
            case HOLD:
                sound = sounds.hold;
                break;
            case MOVE_LEFT:
            case MOVE_RIGHT:
                sound = sounds.move;
                break;
            case ROTATE_LEFT:
            case ROTATE_RIGHT:
                sound = sounds.rotate;
                break;
            case SOFT_DROP:
                sound = sounds.softdrop;
                break;
            case HARD_DROP:
                sound = sounds.harddrop;
                break;
        }
        if (sound) {
            sound.volume = UI.getSoundsVolume();
            sound.pause();
            sound.currentTime = 0;
            sound.play();
        }
    }

    function sendStatsAndReset() {
        sounds.background.pause();
        matrix = resetMatrix();
        currentTetromino.updateMinosMatrix(matrix);
        for (let i = 0; i < nextTetrominos.length; i++) {
            nextTetrominos[i].updateMinosMatrix(matrix);
        }
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
        const gameStats = getStats();
        Socket.setGameStats(gameStats);
    }

    /**
     * Displays the game over screen and plays the game over sound.
     */
    function gameOver(isDraw = false, isLost = true) {
        console.log("Game Over: ", { isLost }, { isDraw });
        // Game.setGameOver();
        // $("#final-gems").text(collectedGems);
        // sounds.background.pause();

        if (!isPlayer || !isLost) return;
        // matrix = resetMatrix();
        // currentTetromino.updateMinosMatrix(matrix);
        // for (let i = 0; i < nextTetrominos.length; i++) {
        //     nextTetrominos[i].updateMinosMatrix(matrix);
        // }
        // sounds.collect.pause();
        // sounds.gameover.play();

        // Socket.setGameOver(true);

        Socket.setGameOver(true);
        if (isDraw) {
            $("#player-standing").text("Draw! ");
        } else if (isLost) {
            Socket.gameOver();
            $("#player-standing").text("You Lose! ");
        } else $("#player-standing").text("You Won! ");

        Game.gameOver(true);
        // else {
        // }

        // Game.hide();
        // GameOver.show();
    }
    let isHardDrop = false;
    /**
     * Clears the screen and redraws the canvas.
     *
     * @param {boolean} [_matrix=true] - Indicates whether to render the matrix.
     * @param {boolean} [_tetromino=true] - Indicates whether to render the current tetromino.
     */
    function clearAndRedraw(_matrix = true, _tetromino = true) {
        /* Clear the screen */
        ctx.clearRect(0, 0, cv.width, cv.height);
        // /* Draw the sprites */
        canvas.drawGrid(ctx);
        if (_matrix) renderMatrix();
        if (_tetromino) currentTetromino.draw();
    }

    /* The main processing of the game */
    /**
     * Performs the main logic for each frame of the game.
     * @param {DOMHighResTimeStamp} now - The current timestamp.
     */
    function doFrame(now) {
        // console.log("frame");
        if (Game.getGameOver()) {
            sounds.background.pause();
            matrix = resetMatrix();
            currentTetromino.updateMinosMatrix(matrix);
            for (let i = 0; i < nextTetrominos.length; i++) {
                nextTetrominos[i].updateMinosMatrix(matrix);
            }
            return;
        }

        Game.doFrameGrassland(now);

        // /* Update the time remaining */
        const gameTimeSoFar = now - gameStartTime;
        // console.log("game time so far", gameTimeSoFar);
        if (gameMode == TIME_MODE) {
            const timeRemaining = Math.ceil(
                (totalGameTime * 1000 - gameTimeSoFar) / 1000
            );

            canvas.setTime(timeRemaining);

            // /* Handle the game over situation here */
            if (timeRemaining <= 0) {
                gameOver(true);
                return;
            }
        }
        if (gameMode == SURVIVAL_MODE) {
            canvas.setTime(milisecondsToText(gameTimeSoFar));
        }

        const hitBottom = currentTetromino.drop(now, level);
        if (hitBottom && !isHardDrop) {
            // const fitTetromino = currentTetromino;
            // Add the tetromino to the matrix
            const noCollision = currentTetromino.tetrominoToMinos();
            if (!noCollision) {
                clearAndRedraw(true, false);
                // Show Game Over
                console.log("hit bottom collision Game Over");
                gameOver(false, true);
                return;
            }
        }

        if (isCheating) {
            isCheating = false;
            if (isPlayer) {
                Game.addCheatRow(false);
            } else {
                Game.addCheatRow(true);
            }
        }

        if (isTetris) {
            isTetris = false;
            let hole = getRandomInt(0, MATRIX_WIDTH - 1);
            if (isPlayer) {
                Game.addPunishRow(false, hole);
                Socket.addPunishRow(hole);
            }
            //

            /* let hole = getRandomInt(0, MATRIX_WIDTH-1);
            console.log(hole);
            if (isPlayer) {
                Game.addPunishRow(false, hole);
            }
            else {
                Game.addPunishRow(true, hole);
            } */
        }

        // clearAndRedraw(false, false);

        if (isHardDrop || hitBottom) {
            // Check for full rows
            checkFullRows(matrix);

            // Check for game over
            if (checkHitCeiling(matrix)) {
                clearAndRedraw(true, false);

                // Show Game Over
                gameOver(false, true);
                console.log("Hit Ceiling Game Over");
                return;
            }
            // Reset hard drop flag
            isHardDrop = false;

            // get next tetromino
            currentTetromino = nextTetrominos.shift();

            // Generate new tetromino and add to nextTetrominos
            if (isPlayer) {
                newTetromino = spawnRandomTetromino(ctx, gameArea, matrix);
                Socket.pushNextTetromino(newTetromino.getLetter());
                nextTetrominos.push(newTetromino);
                // Update next up terminos icons
                updateNextIcons();
            }
            // Draw current Tetromino
            currentTetromino.draw();

            if (!currentTetromino.canSpawn()) {
                // Game over
                clearAndRedraw(true, false);
                gameOver(false, true);
                // Show Game Over
                console.log("Cannot Spawn Game Over");
                return;
            }
        }
        currentTetromino.updateMinosMatrix(matrix);

        clearAndRedraw(true, true);

        /* Process the next frame */
        requestAnimationFrame(doFrame);
    }

    return {
        initialize,
        setScore,
        translateAction,
        startGame,
        initGame,
        pushNextTetromino,
        gameOver,
        addCheatRow,
        addPunishRow,
        getStats,
        sendStats: sendStatsAndReset,
        setLevel,
    };
};
