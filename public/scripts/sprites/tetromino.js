const spawnRandomTetromino = (player_context, gameArea, player_matrix) => {
    const letters = ["I", "J", "L", "O", "S", "T", "Z"];
    const randomLetter = letters[Math.floor(Math.random() * 7)];
    const tetromino = Tetromino(
        player_context,
        gameArea,
        player_matrix,
        randomLetter
    );
    return tetromino;
};

/**
 * Represents a Tetromino object.
 * @constructor
 * @param {CanvasRenderingContext2D} ctx - The rendering context of the canvas.
 * @param {BoundingBox} gameArea - The game area where the Tetromino is placed.
 * @param {number} matrixX - The x-coordinate of the Tetromino in the game matrix.
 * @param {number} matrixY - The y-coordinate of the Tetromino in the game matrix.
 * @param {string} letter - The letter representing the type of Tetromino.
 */
const Tetromino = function (
    ctx,
    gameArea,
    minosMatrix,
    letter,
    matrixX = 3,
    matrixY = 12
) {
    const sequences = {
        // J: { x: 32, y: 96, width: 64, height: 96 }, // Piece J
        J0: { x: 32, y: 0, width: 64, height: 96, count: 4 }, // Piece J
        J1: { x: 144, y: 16, width: 96, height: 64, count: 4 }, // Piece J
        J2: { x: 288, y: 0, width: 64, height: 96, count: 4 }, // Piece J
        J3: { x: 400, y: 16, width: 96, height: 64, count: 4 }, // Piece J
        // L: { x: 288, y: 0, width: 64, height: 96 }, // Piece L
        L0: { x: 32, y: 96, width: 64, height: 96, count: 4 }, // Piece L
        L1: { x: 144, y: 112, width: 96, height: 64, count: 4 }, // Piece L
        L2: { x: 288, y: 96, width: 64, height: 96, count: 4 }, // Piece L
        L3: { x: 400, y: 112, width: 96, height: 64, count: 4 }, // Piece L
        // S: { x: 160, y: 0, width: 64, height: 96 }, // Piece S
        S0: { x: 32, y: 192, width: 64, height: 96, count: 2 }, // Piece S
        S1: { x: 144, y: 208, width: 96, height: 64, count: 2 }, // Piece S
        // Z: { x: 416, y: 0, width: 64, height: 96 }, // Piece Z
        Z0: { x: 32, y: 288, width: 64, height: 96, count: 2 }, // Piece Z
        Z1: { x: 144, y: 304, width: 96, height: 64, count: 2 }, // Piece Z
        // O: { x: 32, y: 20, width: 64, height: 64 }, // Piece O
        O0: { x: 32, y: 404, width: 64, height: 64, count: 1 }, // Piece O

        // I: { x: 256, y: 128, width: 128, height: 32 }, // Piece I
        I0: { x: 0, y: 512, width: 128, height: 32, count: 2 },
        I1: { x: 160, y: 480, width: 32, height: 128, count: 2 }, // Piece I

        T0: { x: 0, y: 640, width: 96, height: 64, count: 4 }, // Piece T
        T1: { x: 112, y: 624, width: 64, height: 96, count: 4 }, // Piece T
        T2: { x: 192, y: 640, width: 96, height: 64, count: 4 }, // Piece T
        T3: { x: 304, y: 624, width: 64, height: 96, count: 4 }, // Piece T
    };

    const MINO_WIDTH = 32;
    const MINO_HEIGHT = 32;
    const CANVAS_HEIGHT = 448;
    const DEFAULT_SPEED = 1000;
    let speed = DEFAULT_SPEED;

    let rotation = 0;
    const getBlockId = () =>
        letter + (rotation % sequences[`${letter}0`].count);
    console.log(getBlockId());

    const COUNT = () => sequences[getBlockId()].count;
    const WIDTH = () => sequences[getBlockId()].width;
    const HEIGHT = () => sequences[getBlockId()].height;
    const BLOCK_WIDTH = () => WIDTH() / MINO_WIDTH;
    const BLOCK_HEIGHT = () => HEIGHT() / MINO_HEIGHT;

    /**
     * Converts the representing position of the tetromino in a matrix co-ordinate system to PX (where the tetromino is represented by its center point)
     * @param {number} _matrixX The X calue of the bottom-left Mino of the tetromino in the Matrix coordinate system
     * @param {number} _matrixY
     * @returns {{x: number, y: number}} Where the center of a tetromino should be placed in the canvas
     */
    const convertMatrixToPx = (_matrixX, _matrixY) => {
        const x = _matrixX * MINO_WIDTH + WIDTH() / 2;
        const y = CANVAS_HEIGHT - _matrixY * MINO_HEIGHT - HEIGHT() / 2;
        return {
            x,
            y,
        };
    };

    /**
     * Converts pixel coordinates to matrix coordinates.
     * @param {number} _x - The x-coordinate in pixels.
     * @param {number} _y - The y-coordinate in pixels.
     * @returns {Object} - An object containing the converted matrix coordinates.
     * @property {number} matrixX - The x-coordinate in matrix units.
     * @property {number} matrixY - The y-coordinate in matrix units.
     */
    const convertPxToMatrix = (_x, _y) => {
        const matrixX = (_x - WIDTH() / 2) / MINO_WIDTH;
        const matrixY = (CANVAS_HEIGHT - _y - HEIGHT() / 2) / MINO_HEIGHT;
        return { matrixX, matrixY };
    };

    /**
     * Calculates the matrix coordinates (matrixX, matrixY) for a given pixel coordinates (x, y).
     * If no coordinates are provided, it uses the current sprite's coordinates.
     * @param {number} [_x] - The x-coordinate in pixels.
     * @param {number} [_y] - The y-coordinate in pixels.
     * @returns {Object} - An object containing the matrix coordinates (matrixX, matrixY).
     */
    const getMatrixXY = (_x = null, _y = null) => {
        if (_x == null && _y == null) {
            _x = sprite.getXY().x;
            _y = sprite.getXY().y;
        }

        const { matrixX, matrixY } = convertPxToMatrix(_x, _y);
        return { matrixX, matrixY };
    };

    const setMatrixXY = (_matrixX, _matrixY) => {
        const { matrixX, matrixY } = getValidMatrixXY(_matrixX, _matrixY);
        const { x, y } = convertMatrixToPx(matrixX, matrixY);
        console.log(x, y, " is the converted values");
        sprite.setXY(x, y);
        console.log("Set xy to be", sprite.getXY());
    };

    const getValidMatrixXY = (_matrixX, _matrixY) => {
        if (isValidMatrixPosition(_matrixX, _matrixY)) {
            return { matrixX: _matrixX, matrixY: _matrixY };
        }

        let matrixX = _matrixX;
        let matrixY = _matrixY;
        // while (hasMinoBelow(matrixX, matrixY)) {
        //     console.log("hasMinoBelow");
        //     matrixY += 1;
        // }

        const mLeft = _matrixX;
        const mRight = _matrixX + BLOCK_WIDTH() - 1;
        const mTop = _matrixY + BLOCK_HEIGHT() - 1;
        const mBottom = _matrixY;

        if (mLeft < 0) matrixX = 0;
        else if (mRight >= 10) matrixX = 10 - BLOCK_WIDTH();
        if (mBottom < 0) matrixY = 0;
        // TODO: If movement, do not allow, if stacking, game over
        else if (mTop >= 14) matrixY = 14 - BLOCK_HEIGHT();

        console.log("Returning cleaned up matrixXY:", matrixX, matrixY);

        return { matrixX, matrixY };
    };
    // This is the sprite object of the Tetromino created from the Sprite module.
    if (matrixY + BLOCK_HEIGHT() > 14) {
        matrixY = 14 - BLOCK_HEIGHT();
    }
    const sprite = Sprite(
        ctx,
        convertMatrixToPx(matrixX, matrixY).x,
        convertMatrixToPx(matrixX, matrixY).y
    );
    console.log(sprite);
    // Set Sprite anchor point to bottom left corner
    // sprite.anchorPoint = (0, 0);

    // The sprite object is configured for the Tetromino sprite here.
    sprite
        .setSequence(sequences[getBlockId()])
        .setScale(1)
        .useSheet("../../src/res/tetrominos_w_rotation.png");

    const set = function (_letter, _matrixX, _matrixY, _rotation = 0) {
        _rotation = _rotation % sequences[`${_letter}0`].count;
        console.log("new Rotation: ", _rotation);
        const newSequence = sequences[`${_letter}${_rotation}`];
        sprite.setSequence(newSequence);
        rotation = _rotation;

        const { matrixX, matrixY } = getValidMatrixXY(_matrixX, _matrixY);
        setMatrixXY(matrixX, matrixY);

        // setMatrixXY(0, 0);
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

    const rotate = (dir) => {
        const { matrixX, matrixY } = getMatrixXY();
        // console.log("Trying to keep ", matrixX, matrixY);
        set(letter, matrixX, matrixY, rotation + dir + COUNT()); // added COUNT() to ensure no negative remainder
    };

    const SOFT_DROP_SPEED = 100;

    const hardDrop = () => {
        const { matrixX, matrixY } = getMatrixXY();
        // const { matrixX: _mX, matrixY: _mY } = getValidMatrixXY(matrixX, 0);
        let _mX = matrixX;
        let _mY = 0;
        while (isOverlappingMinos(_mX, _mY)) {
            _mY += 1;
        }
        isHardDrop = true;
        // TODO: Check if game over
        // setMatrixXY(_mX, _mY);
        tetrominoToMinos(_mX, _mY);
        // lastUpdate -= DEFAULT_SPEED;
    };

    const move = function (_action, _isKeyDown = 1) {
        if (_action != INVALID_KEY) {
            let { x, y } = sprite.getXY();
            let { matrixX, matrixY } = getMatrixXY();

            /* Move the player */
            switch (_action) {
                case MOVE_LEFT:
                    x -= MINO_WIDTH;
                    break;
                case MOVE_RIGHT:
                    x += MINO_WIDTH;
                    break;
                case ROTATE_LEFT:
                    rotate(-1);
                    return;
                case ROTATE_RIGHT:
                    rotate(1);
                    return;
                case SOFT_DROP:
                    speed = _isKeyDown ? SOFT_DROP_SPEED : DEFAULT_SPEED;
                    return;
                case HARD_DROP:
                    hardDrop();
                    return;
            }

            /* Set the new position if it is within the game area */
            if (isValidPosition(x, y)) {
                sprite.setXY(x, y);
            }
        }
    };

    const isValidPosition = (x, y) => {
        const { matrixX, matrixY } = getMatrixXY(x, y);
        console.log(matrixX, matrixY);
        return isValidMatrixPosition(matrixX, matrixY);
    };

    const isValidMatrixPosition = (matrixX, matrixY) => {
        const MATRIX_WIDTH = 10;
        const MATRIX_HEIGHT = 14;

        // console.log("fullyWIthinBox");
        const box = sprite.getBoundingBox();
        if (!box.fullyWithinBox(gameArea)) return false;
        if (isOverlappingMinos(matrixX, matrixY)) return false;
        // console.log("<0");
        if (matrixX < 0 || matrixY < 0) return false;
        if (matrixX + BLOCK_WIDTH() > MATRIX_WIDTH) return false;
        if (matrixY + BLOCK_HEIGHT() > MATRIX_HEIGHT) return false;
        return true;
    };

    const getLetter = () => letter;

    const hasMinoBelow = (matrixX, matrixY) => {
        for (let i = 0; i < BLOCK_WIDTH(); i++) {
            const _mX = matrixX + i;
            const _mY = matrixY;
            // console.log("hasMinoBelow", _mX, _mY, minosMatrix[_mY - 1][_mX]);
            const _minoBelow = minosMatrix[_mY - 1][_mX];
            if (_minoBelow != undefined && _minoBelow != "empty") return true;
        }
        return false;
    };

    /**
     * Checks if the current tetromino is overlapping with other tetrominos in the matrix.
     * @param {number} matrixX - The x-coordinate of the current tetromino in the matrix.
     * @param {number} matrixY - The y-coordinate of the current tetromino in the matrix.
     * @returns {boolean} - True if the tetromino is overlapping with other tetrominos, false otherwise.
     */
    const isOverlappingMinos = (matrixX, matrixY) => {
        for (let i = 0; i < BLOCK_WIDTH(); i++) {
            for (let j = 0; j < BLOCK_HEIGHT(); j++) {
                const _mX = matrixX + i;
                const _mY = matrixY + j;
                const _mino = minosMatrix[_mY][_mX];
                if (_mino != undefined && _mino != "empty") return true;
            }
        }
        return false;
    };

    let isHardDrop = false;
    let lastUpdate = 0;
    // This function updates the tetromino depending on its movement.
    // - `time` - The timestamp when this function is called
    const drop = (time) => {
        /* Update the player if the player is moving */
        let { x, y } = sprite.getXY();
        const { matrixX, matrixY } = getMatrixXY();
        if (lastUpdate == 0) lastUpdate = time;

        if (isHardDrop || time - lastUpdate >= speed) {
            isHardDrop = false;
            // console.log(matrixY)

            // if matrixY is 0, return true to fix position
            if (matrixY == 0) return true;
            if (hasMinoBelow(matrixX, matrixY)) return true;

            /* Update the player if the player is moving */
            y += MINO_HEIGHT;

            /* Set the new position if it is within the game area */
            if (isValidPosition(x, y)) {
                sprite.setXY(x, y);
            }
            lastUpdate = time;
            // return false;
        }
        return false;
    };

    const BOX = sprite.getBoundingBox();
    const xCoord = 50;
    const yCoord = 100;
    const CANVAS_WIDTH = 320;

    // const getColorIndicesForCoord = (x, y) => {
    //     // console.log(x, y, imageData);
    //     // const red = y * (width * 4) + x * 4;
    //     return imageData[3];
    // };

    const getColorIndicesForCoord = (_x, _y) => {
        // const red = _y * (CANVAS_WIDTH * 4) + _x * 4;
        const red = _y * (WIDTH() * 4) + _x * 4;
        return { r: red, g: red + 1, b: red + 2, a: red + 3 };
    };

    // const colorIndices = getColorIndicesForCoord(xCoord, yCoord, CANVAS_WIDTH);
    const getAlpha = (_imageData, _x, _y) => {
        console.log(_x, _y);
        const { r, g, b, a } = getColorIndicesForCoord(_x, _y);
        return _imageData[a];
    };

    // console.log(myImageData);

    // const [redIndex, greenIndex, blueIndex, alphaIndex] = colorIndices;

    /**
     * Converts the tetromino image data to minos matrix.
     * @param {ImageData} imageData - The image data of the player canvas.
     */
    const tetrominoToMinos = (_matrixX = null, _matrixY = null) => {
        const BOX = sprite.getBoundingBox();
        const imageData = ctx.getImageData(
            BOX.getLeft(),
            BOX.getTop(),
            WIDTH(),
            HEIGHT()
        ).data;

        if (_matrixX == null && _matrixY == null) {
            const { matrixX, matrixY } = getMatrixXY();
            _matrixX = matrixX;
            _matrixY = matrixY;
        }

        // console.log("Converting Tetromino to Minos");
        // const { matrixX, matrixY } = getMatrixXY();
        // console.log(matrixX, matrixY, BLOCK_WIDTH(), BLOCK_HEIGHT());
        // console.log(BLOCK_WIDTH(), BLOCK_HEIGHT());

        for (let i = 0; i < BLOCK_WIDTH(); i++) {
            for (let j = 0; j < BLOCK_HEIGHT(); j++) {
                const _mX = _matrixX + i;
                const _mY = _matrixY + j;
                const alpha = getAlpha(
                    imageData,
                    // _mX * MINO_WIDTH + MINO_WIDTH / 2,
                    i * MINO_WIDTH + MINO_WIDTH / 2,
                    // CANVAS_HEIGHT - _mY * MINO_HEIGHT - MINO_HEIGHT / 2
                    HEIGHT() - j * MINO_HEIGHT - MINO_HEIGHT / 2
                );
                console.log(i, j, alpha);
                if (alpha == 255) {
                    minosMatrix[_mY][_mX] = letter;
                }
            }
        }
    };

    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        getLetter: getLetter,
        getMatrixXY,
        move: move,
        tetrominoToMinos,
        // setColor: setColor,
        drop: drop,
        /* getAge: getAge, */
        getBoundingBox: sprite.getBoundingBox,
        randomize: randomize,
        draw: sprite.draw,
    };
};
