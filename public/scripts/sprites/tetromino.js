// A Tetromino is a Piece that contains 4 blocks (mino)
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the Tetromino
// - `y` - The initial y position of the Tetromino
// - `letter` - The colour of the Tetromino
const Tetromino = function (ctx, matrixX, matrixY, letter) {
    const sequences = {
        O: { x: 32, y: 20, width: 64, height: 64 }, // Piece O
        S: { x: 160, y: 0, width: 64, height: 96 }, // Piece S
        L: { x: 288, y: 0, width: 64, height: 96 }, // Piece L
        Z: { x: 416, y: 0, width: 64, height: 96 }, // Piece Z
        J: { x: 32, y: 96, width: 64, height: 96 }, // Piece J
        T: { x: 160, y: 96, width: 64, height: 96 }, // Piece T
        I: { x: 256, y: 128, width: 128, height: 32 }, // Piece I
    };

    const MINO_WIDTH = 32;
    const MINO_HEIGHT = 32;
    const CANVAS_HEIGHT = 448;
    const WIDTH = sequences[letter].width;
    const HEIGHT = sequences[letter].height;
    const BLOCK_WIDTH = WIDTH / MINO_WIDTH;
    const BLOCK_HEIGHT = HEIGHT / MINO_HEIGHT;

    const convertMatrixToPx = (matrixX, matrixY) => {
        return {
            x: matrixX * MINO_WIDTH + sequences[letter].width / 2,
            y:
                CANVAS_HEIGHT -
                sequences[letter].height / 2 -
                matrixY * MINO_HEIGHT,
        };
    };

    // This is the sprite object of the Tetromino created from the Sprite module.
    const sprite = Sprite(
        ctx,
        convertMatrixToPx(matrixX, matrixY).x,
        convertMatrixToPx(matrixX, matrixY).y
    );
    // Set Sprite anchor point to bottom left corner
    // sprite.anchorPoint = (0, 0);

    // The sprite object is configured for the Tetromino sprite here.
    sprite
        .setSequence(sequences[letter])
        .setScale(1)
        .useSheet("../../src/res/icon-sprite.png");

    // This is the birth time of the Tetromino for finding its age.
    /* let birthTime = performance.now(); */

    // This function sets the color of the Tetromino.
    // - `color` - The colour of the Tetromino which can be
    // `"green"`, `"red"`, `"yellow"` or `"purple"`
    const set = function (color) {
        sprite.setSequence(sequences[color]);
        /* birthTime = performance.now(); */
    };

    // This function gets the age (in millisecond) of the Tetromino.
    // - `now` - The current timestamp
    /* const getAge = function (now) {
        return now - birthTime;
    }; */

    // This function randomizes the Tetromino colour and position.
    // - `area` - The area that the Tetromino should be located in.
    const randomize = function (area) {
        /* Randomize the color */
        // const colors = [
        //     "red",
        //     "yellow",
        //     "green",
        //     "lightBlue",
        //     "pink",
        //     "darkBlue",
        //     "purple",
        //     "grey",
        // ];
        // setColor(colors[Math.floor(Math.random() * 7)]);

        /* Randomize the position */
        const { x, y } = area.randomPoint();
        sprite.setXY(x, y);
    };

    const move = function (gameArea, action) {
        if (action != INVALID_KEY) {
            let { x, y } = sprite.getXY();
            /* Move the player */
            switch (action) {
                case MOVE_LEFT:
                    x -= MINO_WIDTH;
                    break;
                case MOVE_RIGHT:
                    x += MINO_WIDTH;
                    break;
                // case 3:
                //     y += speed / 60;
                //     break;
                // case 4:
                //     y += speed / 60;
                //     break;
            }

            // console.log("Will Check ", x, y);

            /* Set the new position if it is within the game area */
            if (isValidPosition(x, y) && gameArea.isPointInBox(x, y)) {
                sprite.setXY(x, y);
            }
        }
    };

    const isValidPosition = (x, y) => {
        const MATRIX_WIDTH = 10;
        const MATRIX_HEIGHT = 14;
        const { matrixX, matrixY } = getMatrixXY(x, y);
        // console.log("Checking ", matrixX, matrixY);
        if (matrixX < 0 || matrixY < 0) return false;
        if (matrixX + BLOCK_WIDTH > MATRIX_WIDTH) return false;
        if (matrixY + BLOCK_HEIGHT > MATRIX_HEIGHT) return false;
        return true;
    };

    let lastUpdate = 0;
    const speed = 1000;
    // This function updates the tetromino depending on its movement.
    // - `time` - The timestamp when this function is called
    const drop = (gameArea, time) => {
        /* Update the player if the player is moving */
        let { x, y } = sprite.getXY();
        if (lastUpdate == 0) lastUpdate = time;

        if (time - lastUpdate >= speed) {
            /* Update the player if the player is moving */
            y += MINO_HEIGHT;

            /* Set the new position if it is within the game area */
            if (isValidPosition(x, y) && gameArea.isPointInBox(x, y))
                sprite.setXY(x, y);
            lastUpdate = time;
            // TODO: if matrixY is 0, fix position
        }
    };

    const getMatrixXY = (x = null, y = null) => {
        if (x == null && y == null) {
            x = sprite.getXY().x;
            y = sprite.getXY().y;
        }
        const matrixX = (x - WIDTH / 2) / MINO_WIDTH;
        const matrixY = (CANVAS_HEIGHT - y - HEIGHT / 2) / MINO_HEIGHT;
        return { matrixX, matrixY };
    };

    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        getMatrixXY,
        move: move,
        // setColor: setColor,
        drop: drop,
        /* getAge: getAge, */
        getBoundingBox: sprite.getBoundingBox,
        randomize: randomize,
        draw: sprite.draw,
    };
};
