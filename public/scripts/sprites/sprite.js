/**
 * Represents a sprite object.
 *
 * This function defines a Sprite module.
 * @constructor
 * @param {CanvasRenderingContext2D} ctx - The rendering context of the canvas (A canvas context for drawing).
 * @param {number} x - The initial x coordinate of the sprite.
 * @param {number} y - The initial y coordinate of the sprite.
 * @returns {Object} - The sprite object.
 */
const Sprite = function (ctx, x, y) {
    /**
     * The sprite sheet image.
     *
     * This is the image object for the sprite sheet.
     * @type {Image}
     */
    const sheet = new Image();

    /**
     * Represents a sequence of frames for a sprite.
     *
     * This is an object containing the sprite sequence information used by the sprite
     * @typedef {Object} Sequence
     * @property {number} x - The starting x position of the sprite sequence in the sprite sheet
     * @property {number} y - The starting y position of the sprite sequence in the sprite sheet
     * @property {number} width - The width of each sprite frame.
     * @property {number} height - The height of each sprite frame.
     * @property {number} count - The number of frames in the sequence.
     * @property {number} timing - The timing between frames in milliseconds.
     * @property {boolean} loop - Indicates whether the sequence should loop.
     */
    let sequence = {
        x: 0,
        y: 0,
        width: 32,
        height: 32,
    };

    /**
     * Represents the index of the sprite.
     *
     * This is the index indicating the current sprite image used in the sprite sequence.
     * @type {number}
     */
    let index = 0;

    /**
     * The scale of the sprite.
     *
     * This is the scaling factor for drawing the sprite.
     * @type {number}
     */
    let scale = 1;

    /**
     * The scale of the shadow in the x and y directions.
     *
     * This is the scaling factor to determine the size of the shadow, relative to the scaled sprite image size.
     * @type {Object}
     * @property {number} x - The scale in the x direction (The x scaling factor).
     * @property {number} y - The scale in the y direction (The y scaling factor).
     */
    let shadowScale = { x: 1, y: 0.25 };

    /**
     * Represents the last update time of the current sprite image.
     *
     * It is used to determine the timing to switch to the next sprite image.
     * @type {number}
     */
    let lastUpdate = 0;

    /**
     * Sets the sprite sheet for the sprite.
     *
     * This function uses a new sprite sheet in the image object.
     * @param {string} spriteSheet - The URL of the sprite sheet.
     * @returns {Object} - The modified sprite object.
     */
    const useSheet = function (spriteSheet) {
        sheet.src = spriteSheet;
        return this;
    };

    // This function returns the readiness of the sprite sheet image.
    const isReady = function () {
        return sheet.complete && sheet.naturalHeight != 0;
    };

    // This function gets the current sprite position.
    /**
     * Returns the x and y coordinates of the sprite.
     * @returns {{x: number, y: number}} The x and y coordinates of the sprite.
     */
    const getXY = function () {
        return { x, y };
    };

    /**
     * Sets the x and y coordinates of the sprite.
     * @param {number} xvalue - The new x coordinate value.
     * @param {number} yvalue - The new y coordinate value.
     * @returns {Object} - The updated sprite object.
     */
    const setXY = function (xvalue, yvalue) {
        [x, y] = [xvalue, yvalue];
        return this;
    };

    /**
     * Sets the sequence of the sprite.
     *
     * @param {Array} newSequence - The new sprite sequence to be used by the sprite
     * @returns {Object} - The updated sprite object.
     */
    const setSequence = function (newSequence) {
        sequence = newSequence;
        index = 0;
        lastUpdate = 0;
        return this;
    };

    /**
     * Sets the scale value for the sprite.
     *
     * This function sets the scaling factor of the sprite.
     * @param {number} value - The new scaling factor
     * @returns {Object} - The current object instance.
     */
    const setScale = function (value) {
        scale = value;
        return this;
    };

    /**
     * Sets the shadow scale value.
     *
     * This function sets the scaling factor of the sprite shadow.
     * @param {Object} value - The value to set the shadow scale to.
     * @param {number} value.x - The x scaling factor
     * @param {number} value.y - The y scaling factor
     * @returns {Object} - The current object (sprite) instance.
     */
    const setShadowScale = function (value) {
        shadowScale = value;
        return this;
    };

    /**
     * Calculates the scaled width and height of the sprite.
     *
     * This function gets the display size of the sprite.
     * @returns {Object} The width and height of the sprite after scaling.
     */
    const getDisplaySize = function () {
        /* Find the scaled width and height of the sprite */
        const scaledWidth = sequence.width * scale;
        const scaledHeight = sequence.height * scale;
        return { width: scaledWidth, height: scaledHeight };
    };

    // This function gets the bounding box of the sprite.
    const getBoundingBox = function () {
        /* Get the display size of the sprite */
        const size = getDisplaySize();

        /* Find the box coordinates */
        const top = y - size.height / 2;
        const left = x - size.width / 2;
        const bottom = y + size.height / 2;
        const right = x + size.width / 2;

        return BoundingBox(ctx, top, left, bottom, right);
    };

    /**
     * Draws a shadow underneath the sprite.
     */
    const drawShadow = function () {
        /* Save the settings */
        ctx.save();

        /* Get the display size of the sprite */
        const size = getDisplaySize();

        /* Find the scaled width and height of the shadow */
        const shadowWidth = size.width * shadowScale.x;
        const shadowHeight = size.height * shadowScale.y;

        /* Draw a semi-transparent oval */
        ctx.fillStyle = "black";
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.ellipse(
            x,
            y + size.height / 2,
            shadowWidth / 2,
            shadowHeight / 2,
            0,
            0,
            2 * Math.PI
        );
        ctx.fill();

        /* Restore saved settings */
        ctx.restore();
    };

    /**
     * Draws the sprite on the canvas.
     */
    const drawSprite = function () {
        /* Save the settings */
        ctx.save();

        /* Get the display size of the sprite */
        const size = getDisplaySize();

        /* XXX: Replace the following code to draw the sprite correctly */
        ctx.drawImage(
            sheet,
            sequence.x + index * sequence.width,
            sequence.y,
            sequence.width,
            sequence.height,
            parseInt(x - size.width / 2),
            parseInt(y - size.height / 2),
            size.width,
            size.height
        );

        /* Restore saved settings */
        ctx.restore();
    };

    /**
     * Draws the sprite on the canvas.
     *
     * This function draws the shadow and the sprite.
     * @returns {Object} The current sprite.
     */
    const draw = function () {
        if (isReady()) {
            //drawShadow();
            drawSprite();
        }
        return this;
    };

    /**
     * Updates the sprite animation based on the elapsed time.
     *
     * This function updates the sprite by moving to the next sprite at appropriate time.
     * @param {number} time - The current time in milliseconds.
     * @returns {Object} - The updated sprite object.
     */
    // const update = function (time) {
    //     if (lastUpdate == 0) lastUpdate = time;

    //     // XXX: Move to the next sprite when the timing is right
    //     if (sequence.timing && time - lastUpdate >= sequence.timing) {
    //         // Draw the sprite
    //         index++;
    //         if (index >= sequence.count) {
    //             // Repeat the animation from the first sprite only if sequence.loop is true
    //             if (sequence.loop) index = 0;
    //             else index--;
    //         }

    //         lastUpdate = time;
    //     }

    //     return this;
    // };

    const isLoaded = function () {
        return loaded;
    };

    // The methods are returned as an object here.
    return {
        useSheet: useSheet,
        getXY: getXY,
        setXY: setXY,
        setSequence: setSequence,
        setScale: setScale,
        setShadowScale: setShadowScale,
        getDisplaySize: getDisplaySize,
        getBoundingBox: getBoundingBox,
        isReady: isReady,
        draw: draw,
        // update: update,
    };
};
