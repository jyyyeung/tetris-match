// This function defines the Tetromino module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the Tetromino
// - `y` - The initial y position of the Tetromino
// - `color` - The colour of the Tetromino
const Tetromino = function (ctx, x, y, color) {
    // This is the sprite sequences of the Tetromino of four colours
    // `green`, `red`, `yellow` and `purple`.
    const sequences = {
        red: { x: 0, y: 0, width: 32, height: 32 }, // Block O
        yellow: { x: 32, y: 0, width: 32, height: 32 }, // Block S
        green: { x: 64, y: 0, width: 32, height: 32 }, // Block L
        lightBlue: { x: 96, y: 0, width: 32, height: 32 }, // Block Z
        pink: { x: 0, y: 32, width: 32, height: 32 }, // Block J
        darkBlue: { x: 32, y: 32, width: 32, height: 32 }, // Block T
        purple: { x: 64, y: 32, width: 32, height: 32 }, // Block I
        grey: { x: 96, y: 32, width: 32, height: 32 }, // added block for cheat
    };

    // This is the sprite object of the Tetromino created from the Sprite module.
    const sprite = Sprite(ctx, x, y);

    // The sprite object is configured for the Tetromino sprite here.
    sprite
        .setSequence(sequences[color])
        .setScale(1)
        .useSheet("../../src/res/tetromino-sprite.png");

    // This is the birth time of the Tetromino for finding its age.
    /* let birthTime = performance.now(); */

    // This function sets the color of the Tetromino.
    // - `color` - The colour of the Tetromino which can be
    // `"green"`, `"red"`, `"yellow"` or `"purple"`
    const setColor = function (color) {
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
        const colors = [
            "red",
            "yellow",
            "green",
            "lightBlue",
            "pink",
            "darkBlue",
            "purple",
            "grey",
        ];
        setColor(colors[Math.floor(Math.random() * 7)]);

        /* Randomize the position */
        const { x, y } = area.randomPoint();
        sprite.setXY(x, y);
    };

    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        setColor: setColor,
        /* getAge: getAge, */
        getBoundingBox: sprite.getBoundingBox,
        randomize: randomize,
        draw: sprite.draw,
        update: sprite.update,
    };
};
