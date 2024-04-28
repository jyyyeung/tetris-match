$(function () {
    /* Get the canvas and 2D context */
    console.log("canvas.js");

    /* Create the sounds */
    /* const sounds = {
        background: new Audio("background.mp3"),
        collect: new Audio("collect.mp3"),
        gameover: new Audio("gameover.mp3"),
    }; */

    /* Create the sprites in the game */
    // const player = Player(context, 427, 240, gameArea); // The player
    // const gem = Gem(context, 427, 350, "green"); // The gem
});
const MATRIX_WIDTH = 10;
const MATRIX_HEIGHT = 14;
const Matrix = function (ctx) {
    let matrix;
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
     *
     * @param {number[][]} matrix - The matrix to be rendered.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
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
                    // console.log(n);
                    renderSingle(x, y, colors[n]);
                }
            }
        }
    }

    /**
     * Renders a single tetromino block on the canvas.
     *
     * @param {CanvasRenderingContext2D} ctx - The rendering context of the canvas.
     * @param {number} x - The x-coordinate of the block.
     * @param {number} y - The y-coordinate of the block.
     * @param {string} color - The color of the block.
     */
    function renderSingle(x, y, color) {
        Mino(ctx, 16 + 32 * x, 432 - 32 * y, color).draw();
    }

    return {
        array: makeArray(MATRIX_WIDTH, MATRIX_HEIGHT + 2),
        renderMatrix,
        renderSingle,
    };
};

const Canvas = function (ctx) {
    var p = 0;
    var bw = 320;
    var bh = 448;
    const gameArea = BoundingBox(ctx, 0, 0, bh, bw);
    /**
     * Draws a grid on the canvas.
     *
     * @param {CanvasRenderingContext2D} ctx - The rendering context of the canvas.
     */
    function drawGrid() {
        // ctx.save();
        for (var x = 0; x <= bw; x += 32) {
            ctx.moveTo(0.5 + x + p, p);
            ctx.lineTo(0.5 + x + p, bh + p);
        }

        for (var x = 0; x <= bh; x += 32) {
            ctx.moveTo(p, 0.5 + x + p);
            ctx.lineTo(bw + p, 0.5 + x + p);
        }
        ctx.strokeStyle = "rgba(0,255,255,0.3)";
        ctx.stroke();
        // ctx.restore();
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
        // clearAndRedraw,
        // setNextIcon,
        // updateNextIcons,
        // setScore,
        setTime,
        setLevel,
        // setHoldIcon,
    };
};

const GameArea = function (cv, ctx, isPlayer = true) {
    const totalGameTime = 10; // Total game time in seconds

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
    const { array: matrix, renderMatrix } = Matrix(ctx);

    let score = 0;
    let tetrisCount = 0;

    let currentTetromino = null;
    let nextTetrominos = [];
    let holdTetromino = null;

    const translateAction = function (action, isKeyDown) {
        if (isKeyDown) {
            // Invalid Action
            if (action == INVALID_KEY) return;

            if (action == MOVE_LEFT) {
                return currentTetromino.move(MOVE_LEFT);
            }
            if (action == MOVE_RIGHT) {
                return currentTetromino.move(MOVE_RIGHT);
            }
            if (action == ROTATE_LEFT) {
                return currentTetromino.move(ROTATE_LEFT);
            }
            if (action == ROTATE_RIGHT) {
                return currentTetromino.move(ROTATE_RIGHT);
            }
            if (action == SOFT_DROP) {
                return currentTetromino.move(SOFT_DROP);
            }
            if (action == HARD_DROP) {
                const fixTetromino = currentTetromino;
                fixTetromino.move(HARD_DROP);
                isHardDrop = true;
                return;
            }
            if (action == HOLD) {
                holdCurrentTetromino();
                return;
            }
            // TODO: Handle other movements
            if (action == CHEAT_MODE) return console.log("keydown: cheat mode");
        } else {
            // Invalid Action
            if (action == INVALID_KEY) return;
            // Handle other movements
            if (action == SOFT_DROP) return currentTetromino.move(SOFT_DROP, 0);

            // TODO: Handle Cheat Mode
            if (action == CHEAT_MODE) return console.log("keyup: cheat mode");
        }
    };

    const initialize = function () {
        console.log("Game Area Initialized", { isPlayer });
        gameArea = canvas.gameArea;
        //$("#game-container").hide();
        // canvas.drawGrid();

        /* Handle the start of the game */
        $("#game-container").show(function () {
            console.log("Game Container Shown");

            // $("#game-start").on("click", function () {
            /* TODO: Hide the start screen */
            // $("#game-start").hide();
            // GameArea.initialize();

            if (isPlayer) {
                // startGame();
                initGame();

                // TODO: Play Packground music
                // sounds.background.play();
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
                .css("background", icons[block]);
        else
            $("#opponent-next")
                .children()
                .eq(index)
                .css("background", icons[block]);
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
        if (isPlayer) {
            if (score > 0) Socket.updateScore(score);
            $("#player-score").text(score);
        } else $("#opponent-score").text(score);
    }

    /**
     * Sets the hold icon for the player or opponent.
     * @param {boolean} bool - True if player, false if opponent.
     * @param {string} block - The character representing the block (OSLZJTI).
     */
    function setHoldIcon(block) {
        // bool - true if player, false if opponent. block - char (OSLZJTI)
        if (isPlayer) {
            $("#player-hold").children().css("background", icons[block]);
        } else $("#opponent-hold").children().css("background", icons[block]);
    }

    function pushNextTetromino(letter) {
        nextTetrominos.push(Tetromino(ctx, gameArea, matrix, letter));
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
        }
        // Update the hold icon
        setHoldIcon(holdTetromino.getLetter());
        currentTetromino.draw();
    }
    let level = 0;

    /**
     * Checks for full rows in the matrix and updates the score accordingly.
     */
    function checkFullRows() {
        let single = 0;
        let double = 0;
        let triple = 0;
        let tetris = 0;
        let consecuitive = 0;
        // Iterate through the rows
        for (let y = MATRIX_HEIGHT - 1; y >= 0; y--) {
            let isFull = true;
            // Iterate through the columns
            for (let x = 0; x < MATRIX_WIDTH; x++) {
                if (!matrix[y][x]) {
                    // If the cell is empty, the row is not full
                    isFull = false;
                    break;
                }
            }
            if (isFull) {
                consecuitive++;
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
        }
        score += 40 * (level + 1) * single;
        score += 50 * (level + 1) * double * 2;
        score += 100 * (level + 1) * triple * 3;
        score += 300 * (level + 1) * tetris * 4;
        tetrisCount += tetris;
        setScore(score);
    }
    let gameStartTime = 0; // The timestamp when the game starts

    const initGame = (
        // _gameStartTime = performance.now(),
        _firstTetromino = "",
        _tetrominos = []
    ) => {
        nextTetrominos = [];

        if (isPlayer) {
            setScore(score);
            const initTetrominos = [];
            currentTetromino = spawnRandomTetromino(ctx, gameArea, matrix);
            for (let i = 0; i < 3; i++) {
                const tetromino = spawnRandomTetromino(ctx, gameArea, matrix);
                initTetrominos.push(tetromino.getLetter());
                nextTetrominos.push(tetromino);
            }
            Socket.initGame(
                // gameStartTime,
                currentTetromino.getLetter(),
                initTetrominos
            );
        } else {
            currentTetromino = Tetromino(
                ctx,
                gameArea,
                matrix,
                _firstTetromino
            );
            nextTetrominos = _tetrominos.map((t) =>
                Tetromino(ctx, gameArea, matrix, t)
            );
            Socket.readyToStart();
        }
    };

    function startGame() {
        gameStartTime = performance.now();

        canvas.setTime(123);
        canvas.setLevel(3);

        updateNextIcons();

        if (isPlayer) {
            // Handle keydown of controls
            $(document).on("keydown", function (event) {
                action = action_from_key(event.keyCode);
                Socket.keyDown(action);
                translateAction(action, true);
            });

            // Handle keyup of controls
            $(document).on("keyup", function (event) {
                action = action_from_key(event.keyCode);
                Socket.keyUp(action);
                translateAction(action, false);
            });
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
                console.log("Hit Ceiling Game Over");
                return true;
            }
        }
        return false;
    };

    /**
     * Displays the game over screen and plays the game over sound.
     */
    function gameOver() {
        // $("#final-gems").text(collectedGems);
        // sounds.background.pause();
        // sounds.collect.pause();
        // sounds.gameover.play();
        $("#game-over").show();
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
        // if (gameStartTime == 0) gameStartTime = now;

        // /* Update the time remaining */
        const gameTimeSoFar = now - gameStartTime;
        const timeRemaining = Math.ceil(
            (totalGameTime * 1000 - gameTimeSoFar) / 1000
        );

        canvas.setTime(timeRemaining);

        // /* Handle the game over situation here */
        if (timeRemaining <= 0) {
            gameOver();
            return;
        }

        const hitBottom = currentTetromino.drop(now);
        if (hitBottom && !isHardDrop) {
            const fitTetromino = currentTetromino;
            // Add the tetromino to the matrix
            const noCollision = fitTetromino.tetrominoToMinos();
            if (!noCollision) {
                clearAndRedraw(true, false);
                // Show Game Over
                console.log("hit bottom collision Game Over");
                gameOver();
                return;
            }
        }

        clearAndRedraw(false, false);

        if (isHardDrop || hitBottom) {
            // Check for full rows
            checkFullRows(matrix);

            // Check for game over
            if (checkHitCeiling(matrix)) {
                clearAndRedraw(true, false);

                // Show Game Over
                gameOver();
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
                gameOver();
                // Show Game Over
                console.log("Cannot Spawn Game Over");
                return;
            }
        }

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
    };
};
