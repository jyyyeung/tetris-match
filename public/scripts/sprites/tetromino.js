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

    // This is the sprite object of the Tetromino created from the Sprite module.
    const sprite = Sprite(
        ctx,
        matrixX * MINO_WIDTH + sequences[letter].width / 2,
        CANVAS_HEIGHT - sequences[letter].height / 2 - matrixY * MINO_HEIGHT
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

    // This function updates the tetromino depending on its movement.
    // - `time` - The timestamp when this function is called
    const update = function (action) {
        /* Update the player if the player is moving */
        if (action != INVALID_KEY) {
            let { x, y } = sprite.getXY();

            /* Move the player */
            switch (action) {
                case MOVE_LEFT:
                    x -= 32;
                    break;
                case MOVE_RIGHT:
                    x += 32;
                    break;
                // case 3:
                //     y += speed / 60;
                //     break;
                // case 4:
                //     y += speed / 60;
                //     break;
            }

            /* Set the new position if it is within the game area */
            if (gameArea.isPointInBox(x, y)) sprite.setXY(x, y);
        }

        /* Update the sprite object */
        // sprite.setX();
        // sprite.update(time);
    };

    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        // setColor: setColor,
        update: update,
        /* getAge: getAge, */
        getBoundingBox: sprite.getBoundingBox,
        randomize: randomize,
        draw: sprite.draw,
        update: sprite.update,
    };
};
