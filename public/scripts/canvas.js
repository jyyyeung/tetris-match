$(function () {
    /* Get the canvas and 2D context */
    console.log("canvas.js");
    const opponent_cv = $("canvas").get(1);
    const opponent_context = opponent_cv.getContext("2d");
    const player_cv = $("canvas").get(0);
    const player_context = player_cv.getContext("2d", {
        willReadFrequently: false,
        alpha: true,
        // desynchronized: true,
    });
    console.log("player_context", player_context);

    const icons = {
        O: "url(../src/res/icon-sprite.png) 0 0",
        Z: "url(../src/res/icon-sprite.png) 128px 0",
        S: "url(../src/res/icon-sprite.png) 384px 0",
        L: "url(../src/res/icon-sprite.png) 256px 0",
        J: "url(../src/res/icon-sprite.png) 0 96px",
        T: "url(../src/res/icon-sprite.png) 384px 96px",
        I: "url(../src/res/icon-sprite.png) 256px 96px",
    };
    /* Create the sounds */
    /* const sounds = {
        background: new Audio("background.mp3"),
        collect: new Audio("collect.mp3"),
        gameover: new Audio("gameover.mp3"),
    }; */

    const totalGameTime = 10; // Total game time in seconds
    const gemMaxAge = 3000; // The maximum age of the gems in milliseconds
    let gameStartTime = 0; // The timestamp when the game starts
    let collectedGems = 0; // The number of gems collected in the game

    const MATRIX_WIDTH = 10;
    const MATRIX_HEIGHT = 14;

    let level = 0;
    let score = 0;
    let tetrisCount = 0;

    // TODO: Create game sprites

    function makeArray(d1, d2) {
        var arr = [];
        for (let i = 0; i < d2; i++) {
            arr.push(new Array(d1));
        }
        return arr;
    }

    //gameAreaPoints = gameArea.getPoints();
    //let matrix = makeArray(10, 14);

    var bw = 320;
    var bh = 448;
    var p = 0;

    /* Create the game area */
    const gameArea = BoundingBox(player_context, 0, 0, bh, bw);
    let nextTetrominos = [];
    let holdTetromino = null;

    /**
     * Draws a grid on the canvas.
     *
     * @param {CanvasRenderingContext2D} ctx - The rendering context of the canvas.
     */
    function drawGrid(ctx) {
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
    drawGrid(opponent_context);
    // drawGrid(player_context);

    /**
     * Sets the background of the next icon element based on the provided parameters.
     *
     * @param {boolean} bool - Indicates whether the player or opponent is being updated. True for player, false for opponent.
     * @param {number} index - The index of the next icon element to update. Must be between 0 and 3.
     * @param {string} block - The character representing the icon to set. Must be one of O, S, L, Z, J, T, or I.
     */
    function setNextIcon(bool, index, block) {
        // bool - true if player, false if opponent. index max 3. block - char (OSLZJTI)
        if (bool)
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

    function updateNextIcons(bool, nextTetrominos) {
        // bool - true if player, false if opponent
        for (let i = 0; i < 3; i++) {
            setNextIcon(bool, i, nextTetrominos[i].getLetter());
        }
    }

    /**
     * Sets the score for the player or opponent.
     * @param {boolean} bool - True if player, false if opponent.
     * @param {number} score - The score to set.
     */
    function setScore(bool, score) {
        // bool - true if player, false if opponent
        if (bool) $("#player-score").text(score);
        else $("#opponent-score").text(score);
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

    /**
     * Sets the hold icon for the player or opponent.
     * @param {boolean} bool - True if player, false if opponent.
     * @param {string} block - The character representing the block (OSLZJTI).
     */
    function setHoldIcon(bool, block) {
        // bool - true if player, false if opponent. block - char (OSLZJTI)
        if (bool) $("#player-hold").children().css("background", icons[block]);
        else $("#opponent-hold").children().css("background", icons[block]);
    }

    /* Create the sprites in the game */
    // const player = Player(context, 427, 240, gameArea); // The player
    // const gem = Gem(context, 427, 350, "green"); // The gem

    /**
     * Renders the matrix on the canvas.
     *
     * @param {number[][]} matrix - The matrix to be rendered.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    function renderMatrix(matrix, ctx) {
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
                    renderSingle(ctx, x, y, colors[n]);
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
    function renderSingle(ctx, x, y, color) {
        Mino(ctx, 16 + 32 * x, 432 - 32 * y, color).draw();
    }

    function holdCurrentTetromino() {
        console.log("Hold Tetromino");
        if (!holdTetromino) {
            holdTetromino = currentTetromino;
            currentTetromino = nextTetrominos.shift();
            nextTetrominos.push(
                spawnRandomTetromino(player_context, gameArea, player_matrix)
            );
            updateNextIcons(true, nextTetrominos);
        } else {
            const temp = currentTetromino;
            currentTetromino = holdTetromino;
            holdTetromino = temp;
        }
        setHoldIcon(true, holdTetromino.getLetter());
        currentTetromino.draw();
    }

    function checkFullRows(matrix) {
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
    }

    setNextIcon(false, 1, "Z");
    setScore(true, 0);
    setScore(false, 456);
    setHoldIcon(false, "T");
    setTime(123);
    setLevel(3);

    const player_matrix = makeArray(MATRIX_WIDTH, MATRIX_HEIGHT + 2);

    // setTimeout(function () {
    //     renderMatrix(test_matrix, player_context);
    // }, 100);

    //updateNext();
    let currentTetromino = spawnRandomTetromino(
        player_context,
        gameArea,
        player_matrix
    );
    nextTetrominos.push(
        spawnRandomTetromino(player_context, gameArea, player_matrix)
    );
    nextTetrominos.push(
        spawnRandomTetromino(player_context, gameArea, player_matrix)
    );
    nextTetrominos.push(
        spawnRandomTetromino(player_context, gameArea, player_matrix)
    );
    updateNextIcons(true, nextTetrominos);

    const checkHitCeiling = (matrix) => {
        for (let x = 0; x < MATRIX_WIDTH; x++) {
            if (matrix[MATRIX_HEIGHT - 1][x]) {
                console.log("Game Over");
                return true;
            }
        }
        return false;
    };

    let isHardDrop = false;

    function clearAndRedraw(_matrix = true, _tetromino = true) {
        /* Clear the screen */
        player_context.clearRect(0, 0, player_cv.width, player_cv.height);
        // /* Draw the sprites */
        drawGrid(player_context);
        if (_matrix) renderMatrix(player_matrix, player_context);

        if (_tetromino) currentTetromino.draw();
    }

    /* The main processing of the game */
    /**
     * Performs the main logic for each frame of the game.
     * @param {DOMHighResTimeStamp} now - The current timestamp.
     */
    function doFrame(now) {
        if (gameStartTime == 0) gameStartTime = now;

        // /* Update the time remaining */
        const gameTimeSoFar = now - gameStartTime;
        const timeRemaining = Math.ceil(
            (totalGameTime * 1000 - gameTimeSoFar) / 1000
        );
        // $("#time-remaining").text(timeRemaining);
        setTime(timeRemaining);

        // /* Handle the game over situation here */
        if (timeRemaining <= 0) {
            // $("#final-gems").text(collectedGems);
            // sounds.background.pause();
            // sounds.collect.pause();
            // sounds.gameover.play();
            // $("#game-over").show();
            return;
        }

        const hitBottom = currentTetromino.drop(now);
        if (hitBottom && !isHardDrop) {
            // TODO: Clear and redraw?
            console.log(currentTetromino.getLetter() + " hit bottom");

            console.log("Hit bottom");
            const fitTetromino = currentTetromino;
            // Add the tetromino to the matrix
            const noCollision = fitTetromino.tetrominoToMinos();
            if (!noCollision) {
                clearAndRedraw(true, false);
                console.log("hit bottom collision Game Over");
                return;
            }
        }
        /* Clear the screen */
        player_context.clearRect(0, 0, player_cv.width, player_cv.height);
        // /* Draw the sprites */
        drawGrid(player_context);

        if (isHardDrop || hitBottom) {
            // Check for full rows
            checkFullRows(player_matrix);

            setScore(true, score);
            // Check for game over
            if (checkHitCeiling(player_matrix)) {
                clearAndRedraw(true, false);

                console.log("Hit Ceiling Game Over");
                return;
            }
            // Reset hard drop flag
            isHardDrop = false;

            // get next tetromino
            currentTetromino = nextTetrominos.shift();

            // Generate new tetromino and add to nextTetrominos
            nextTetrominos.push(
                spawnRandomTetromino(player_context, gameArea, player_matrix)
            );
            // Update next up terminos icons
            updateNextIcons(true, nextTetrominos);
            // Draw current Tetromino
            currentTetromino.draw();

            if (!currentTetromino.canSpawn()) {
                // Game over
                clearAndRedraw(true, false);
                console.log("Cannot Spawn Game Over");
                return;
            }
        }

        clearAndRedraw(true, true);
        // renderMatrix(player_matrix, player_context);

        // currentTetromino.draw();

        /* Process the next frame */
        requestAnimationFrame(doFrame);
    }

    /* Handle the start of the game */
    $("#game-container").show(function () {
        console.log("Game Container Shown");
        // const test = Tetromino(player_context, 16 + 32 * 1, 432 - 32 * 1, "O"); // This line is for loading the images
        // test.draw();
        // console.log(test);
        // console.log(test.getXY());
        // test.randomize(player_cv);

        // test.draw();
        // $("#game-start").on("click", function () {
        // /* Hide the start screen */
        // $("#game-start").hide();

        // // Play Packground music
        // sounds.background.play();

        // // Randomize Gem location and color
        // gem.randomize(gameArea);

        // TODO: Handle controls
        // Handle keydown of controls
        $(document).on("keydown", function (event) {
            action = action_from_key(event.keyCode);
            // Invalid Action
            if (action == INVALID_KEY) return;

            if (action == MOVE_LEFT) {
                // console.log("keydown: move left");
                return currentTetromino.move(MOVE_LEFT);
            }
            if (action == MOVE_RIGHT) {
                // console.log("keydown: move right");
                return currentTetromino.move(MOVE_RIGHT);
            }
            if (action == ROTATE_LEFT) {
                // console.log("keydown: rotate left");
                return currentTetromino.move(ROTATE_LEFT);
            }
            if (action == ROTATE_RIGHT) {
                // console.log("keydown: rotate right");
                return currentTetromino.move(ROTATE_RIGHT);
            }
            if (action == SOFT_DROP) {
                // console.log("keydown: soft drop");
                return currentTetromino.move(SOFT_DROP);
            }
            if (action == HARD_DROP) {
                // console.log("keydown: hard drop");
                const fixTetromino = currentTetromino;
                fixTetromino.move(HARD_DROP);
                isHardDrop = true;
                return;
            }
            if (action == HOLD) {
                // console.log("keydown: hold");
                holdCurrentTetromino();
                return;
            }
            // TODO: Handle other movements
            if (action == CHEAT_MODE) return console.log("keydown: cheat mode");
        });

        // Handle keyup of controls
        $(document).on("keyup", function (event) {
            action = action_from_key(event.keyCode);
            // Invalid Action
            if (action == INVALID_KEY) return;
            // if (action == MOVE_LEFT) return console.log("keyup: move left");
            // if (action == MOVE_RIGHT) return console.log("keyup: move right");
            // if (action == ROTATE_LEFT) return console.log("keyup: rotate left");
            // if (action == ROTATE_RIGHT)
            //     return console.log("keyup: rotate right");

            // TODO: Handle othe rmovements
            if (action == SOFT_DROP) {
                // console.log("keyup: soft drop");
                return currentTetromino.move(SOFT_DROP, 0);
            }
            // if (action == HARD_DROP) return console.log("keyup: hard drop");
            // if (action == HOLD) return console.log("keyup: hold");
            if (action == CHEAT_MODE) return console.log("keyup: cheat mode");
        });

        /* Start the game */
        requestAnimationFrame(doFrame);
    });
});
