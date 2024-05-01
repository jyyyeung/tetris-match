let previousSpawned = null;
/**
 * Spawns a random tetromino on the game area.
 *
 * @param {CanvasRenderingContext2D} player_context - The rendering context of the player.
 * @param {HTMLElement} gameArea - The game area element.
 * @param {Array<Array<number>>} player_matrix - The matrix representing the player's tetromino.
 * @returns {Tetromino} - The spawned tetromino.
 */
function spawnRandomTetromino(player_context, gameArea, player_matrix) {
    const letters = ["I", "J", "L", "O", "S", "T", "Z"];
    if (previousSpawned != null) {
        // Try to avoid two consecuitive tetrominos of the same type
        letters.splice(letters.indexOf(previousSpawned), 1);
    }
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    const tetromino = new Tetromino(
        player_context,
        gameArea,
        player_matrix,
        randomLetter
    );
    previousSpawned = randomLetter;
    return tetromino;
}
/**
 * Represents a Tetromino object.
 * @constructor
 * @param {CanvasRenderingContext2D} ctx - The rendering context of the canvas.
 * @param {BoundingBox} gameArea - The game area where the Tetromino is placed.
 * @param {Array<Array<number>>} _minosMatrix - The matrix representing the minos in the game area.
 * @param {number} matrixX - The x-coordinate of the Tetromino in the game matrix.
 * @param {number} matrixY - The y-coordinate of the Tetromino in the game matrix.
 * @param {string} letter - The letter representing the type of Tetromino.
 */
const Tetromino = function (
    ctx,
    gameArea,
    _minosMatrix,
    letter,
    matrixX = 3,
    matrixY = 12
) {
    const sequences = {
        // J: { x: 32, y: 96, width: 64, height: 96 }, // Piece J
        J0: {
            x: 32,
            y: 0,
            width: 64,
            height: 96,
            count: 4,
            minos: [
                [1, 0],
                [1, 0],
                [1, 1],
            ],
        }, // Piece J
        J1: {
            x: 144,
            y: 16,
            width: 96,
            height: 64,
            count: 4,
            minos: [
                [0, 0, 1],
                [1, 1, 1],
            ],
        }, // Piece J
        J2: {
            x: 288,
            y: 0,
            width: 64,
            height: 96,
            count: 4,
            minos: [
                [1, 1],
                [0, 1],
                [0, 1],
            ],
        }, // Piece J
        J3: {
            x: 400,
            y: 16,
            width: 96,
            height: 64,
            count: 4,
            minos: [
                [1, 1, 1],
                [1, 0, 0],
            ],
        }, // Piece J
        // L: { x: 288, y: 0, width: 64, height: 96 }, // Piece L
        L0: {
            x: 32,
            y: 96,
            width: 64,
            height: 96,
            count: 4,
            minos: [
                [1, 1],
                [1, 0],
                [1, 0],
            ],
        }, // Piece L
        L1: {
            x: 144,
            y: 112,
            width: 96,
            height: 64,
            count: 4,
            minos: [
                [1, 0, 0],
                [1, 1, 1],
            ],
        }, // Piece L
        L2: {
            x: 288,
            y: 96,
            width: 64,
            height: 96,
            count: 4,
            minos: [
                [0, 1],
                [0, 1],
                [1, 1],
            ],
        }, // Piece L
        L3: {
            x: 400,
            y: 112,
            width: 96,
            height: 64,
            count: 4,
            minos: [
                [1, 1, 1],
                [0, 0, 1],
            ],
        }, // Piece L
        // S: { x: 160, y: 0, width: 64, height: 96 }, // Piece S
        S0: {
            x: 32,
            y: 192,
            width: 64,
            height: 96,
            count: 2,
            minos: [
                [0, 1],
                [1, 1],
                [1, 0],
            ],
        }, // Piece S
        S1: {
            x: 144,
            y: 208,
            width: 96,
            height: 64,
            count: 2,
            minos: [
                [1, 1, 0],
                [0, 1, 1],
            ],
        }, // Piece S
        // Z: { x: 416, y: 0, width: 64, height: 96 }, // Piece Z
        Z0: {
            x: 32,
            y: 288,
            width: 64,
            height: 96,
            count: 2,
            minos: [
                [1, 0],
                [1, 1],
                [0, 1],
            ],
        }, // Piece Z
        Z1: {
            x: 144,
            y: 304,
            width: 96,
            height: 64,
            count: 2,
            minos: [
                [0, 1, 1],
                [1, 1, 0],
            ],
        }, // Piece Z
        // O: { x: 32, y: 20, width: 64, height: 64 }, // Piece O
        O0: {
            x: 32,
            y: 404,
            width: 64,
            height: 64,
            count: 1,
            minos: [
                [1, 1],
                [1, 1],
            ],
        }, // Piece O

        // I: { x: 256, y: 128, width: 128, height: 32 }, // Piece I
        I0: {
            x: 0,
            y: 512,
            width: 128,
            height: 32,
            count: 2,
            minos: [[1, 1, 1, 1]],
        },
        I1: {
            x: 160,
            y: 480,
            width: 32,
            height: 128,
            count: 2,
            minos: [[1], [1], [1], [1]],
        }, // Piece I

        T0: {
            x: 0,
            y: 640,
            width: 96,
            height: 64,
            count: 4,
            minos: [
                [1, 1, 1],
                [0, 1, 0],
            ],
        }, // Piece T
        T1: {
            x: 112,
            y: 624,
            width: 64,
            height: 96,
            count: 4,
            minos: [
                [1, 0],
                [1, 1],
                [1, 0],
            ],
        }, // Piece T
        T2: {
            x: 192,
            y: 640,
            width: 96,
            height: 64,
            count: 4,
            minos: [
                [0, 1, 0],
                [1, 1, 1],
            ],
        }, // Piece T
        T3: {
            x: 304,
            y: 624,
            width: 64,
            height: 96,
            count: 4,
            minos: [
                [0, 1],
                [1, 1],
                [0, 1],
            ],
        }, // Piece T
    };
    let minosMatrix = _minosMatrix;

    /**
     * The width of a tetromino block.
     * @type {number}
     */
    const MINO_WIDTH = 32;
    /**
     * The height of a tetromino block.
     * @type {number}
     */
    const MINO_HEIGHT = 32;
    /**
     * The height of the canvas.
     * @type {number}
     */
    const CANVAS_HEIGHT = 448;
    /**
     * The default speed of the tetromino.
     * @type {number}
     */
    const DEFAULT_SPEED = 1000;
    /**
     * The current speed of the tetromino.
     * @type {number}
     */
    let speed = DEFAULT_SPEED;

    /**
     * The rotation of the tetromino.
     * @type {number}
     */
    let rotation = 0;

    /**
     * Returns the block ID for the current tetromino rotation.
     * @returns {string} The block ID.
     */
    const getBlockId = () =>
        letter + (rotation % sequences[`${letter}0`].count);

    // console.log(getBlockId());

    /**
     * The count of the current tetromino sequence.
     * @type {Function}
     * @returns {number} The count of the current tetromino sequence.
     */
    const COUNT = () => sequences[getBlockId()].count;
    /**
     * The width of the tetromino block.
     * @type {Function}
     * @returns {number} The width of the tetromino block.
     */
    const WIDTH = () => sequences[getBlockId()].width;
    /**
     * The height of the tetromino block.
     * @type {Function}
     * @returns {number} The height of the tetromino block.
     */
    const HEIGHT = () => sequences[getBlockId()].height;
    /**
     * The width of a single block in the tetromino.
     * @constant {number}
     */
    const BLOCK_WIDTH = () => WIDTH() / MINO_WIDTH;
    /**
     * The height of a single block in the tetromino, calculated based on the overall height of the tetromino.
     * @constant {number}
     */
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
    function getMatrixXY(_x = null, _y = null) {
        if (_x == null && _y == null) {
            _x = sprite.getXY().x;
            _y = sprite.getXY().y;
        }

        const { matrixX, matrixY } = convertPxToMatrix(_x, _y);
        return { matrixX, matrixY };
    }

    /**
     * Sets the matrix coordinates of the tetromino and updates its position on the sprite.
     *
     * @param {number} _matrixX - The new matrix X coordinate.
     * @param {number} _matrixY - The new matrix Y coordinate.
     */
    function setMatrixXY(_matrixX, _matrixY) {
        const { matrixX, matrixY } = getValidMatrixXY(_matrixX, _matrixY);
        const { x, y } = convertMatrixToPx(matrixX, matrixY);
        // console.log(x, y, " is the converted values");
        sprite.setXY(x, y);
        // console.log("Set xy to be", sprite.getXY());
    }

    /**
     * Returns the valid matrix coordinates for a given matrix position.
     * @param {number} _matrixX - The x-coordinate of the matrix position.
     * @param {number} _matrixY - The y-coordinate of the matrix position.
     * @returns {Object} - An object containing the valid matrix coordinates.
     */
    function getValidMatrixXY(_matrixX, _matrixY) {
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
        console.log({ mLeft, mRight, mTop, mBottom });

        if (mLeft < 0) matrixX = 0;
        else if (mRight >= 10) matrixX = 10 - BLOCK_WIDTH();
        if (mBottom < 0) matrixY = 0;
        // If movement, do not allow, if stacking, game over
        else if (mTop >= 14) matrixY = 14 - BLOCK_HEIGHT();

        console.log("Returning cleaned up matrixXY:", matrixX, matrixY);

        return { matrixX, matrixY };
    }
    // This is the sprite object of the Tetromino created from the Sprite module.
    if (matrixY + BLOCK_HEIGHT() > 14) {
        matrixY = 14 - BLOCK_HEIGHT();
    }
    // console.table(_minosMatrix);
    const sprite = new Sprite(
        ctx,
        convertMatrixToPx(matrixX, matrixY).x,
        convertMatrixToPx(matrixX, matrixY).y
    );
    // console.log(sprite);
    // Set Sprite anchor point to bottom left corner
    // sprite.anchorPoint = (0, 0);

    // The sprite object is configured for the Tetromino sprite here.
    sprite
        .setSequence(sequences[getBlockId()])
        .setScale(1)
        .useSheet("../../src/res/tetrominos_w_rotation.png");

    /**
     * Sets the properties of the tetromino.
     *
     * @param {string} _letter - The letter representing the tetromino.
     * @param {number} _matrixX - The x-coordinate of the tetromino in the matrix.
     * @param {number} _matrixY - The y-coordinate of the tetromino in the matrix.
     * @param {number} [_rotation=0] - The rotation of the tetromino (default is 0).
     */
    function set(_letter, _matrixX, _matrixY, _rotation = 0) {
        _rotation = _rotation % sequences[`${_letter}0`].count;
        rotation = _rotation;
        console.log("new Rotation: ", _rotation);
        const newSequence = sequences[`${_letter}${_rotation}`];
        sprite.setSequence(newSequence);

        const { matrixX, matrixY } = getValidMatrixXY(_matrixX, _matrixY);
        setMatrixXY(matrixX, matrixY);

        // setMatrixXY(0, 0);
        /* birthTime = performance.now(); */
    }

    /**
     * Rotates the tetromino in the specified direction.
     *
     * @param {number} dir - The direction to rotate the tetromino. Positive values rotate clockwise, negative values rotate counterclockwise.
     */
    function rotate(dir) {
        const { matrixX, matrixY } = getMatrixXY();
        // console.log("Trying to keep ", matrixX, matrixY);
        set(letter, matrixX, matrixY, rotation + dir + COUNT()); // added COUNT() to ensure no negative remainder
    }

    const SOFT_DROP_SPEED = 100;

    /**
     * Drops the tetromino to the lowest possible position.
     * @returns {void}
     */
    function hardDrop() {
        console.log("--- START HARD_DROP() ---");
        const { matrixX, matrixY } = getMatrixXY();
        // const { matrixX: _mX, matrixY: _mY } = getValidMatrixXY(matrixX, 0);
        let _mX = matrixX;
        let _mY = matrixY;
        while (_mY > 0 && !isOverlappingMinos(_mX, _mY - 1)) {
            console.log("Hard Drop: No Overlapping Minos", _mX, _mY);
            _mY -= 1;
            isHardDrop = true;
        }
        console.table(minosMatrix);
        const noCollision = tetrominoToMinos(_mX, _mY);
        if (!noCollision) {
            // Show game over
            console.log("Game Over");
            Game.gameOver(true, true);
            // reset matrix
            var arr = [];
            for (let i = 0; i < d2; i++) {
                arr.push(new Array(d1));
            }
            minosMatrix = arr;
            isHardDrop = false;
            return;
        }
        // lastUpdate -= DEFAULT_SPEED;
        console.log("--- END HARD_DROP() ---");
    }

    /**
     * Moves the tetromino based on the given action.
     * @param {number} _action - The action to perform. Should be one of the action constants.
     * @param {number} [_isKeyDown=1] - Indicates whether the key is currently being held down.
     */
    function move(_action, _isKeyDown = 1) {
        if (_action != INVALID_KEY) {
            let { x, y } = sprite.getXY();
            let { matrixX, matrixY } = getMatrixXY();

            // console.table(minosMatrix);
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
                    console.log("Tetromino: Hard Drop");
                    hardDrop();
                    return;
            }

            /* Set the new position if it is within the game area */
            if (isValidPosition(x, y)) {
                sprite.setXY(x, y);
            }
        }
    }

    /**
     * Checks if the given position is valid within the tetromino matrix.
     *
     * @param {number} x - The x-coordinate of the position.
     * @param {number} y - The y-coordinate of the position.
     * @returns {boolean} - True if the position is valid, false otherwise.
     */
    function isValidPosition(x, y) {
        const { matrixX, matrixY } = getMatrixXY(x, y);
        // console.log(matrixX, matrixY);
        return isValidMatrixPosition(matrixX, matrixY);
    }

    /**
     * Checks if the given matrix position is valid within the game area.
     * @param {number} matrixX - The x-coordinate of the matrix position.
     * @param {number} matrixY - The y-coordinate of the matrix position.
     * @returns {boolean} - Returns true if the matrix position is valid, otherwise false.
     */
    function isValidMatrixPosition(matrixX, matrixY) {
        const MATRIX_WIDTH = 10;
        const MATRIX_HEIGHT = 14;

        // console.log("fullyWIthinBox");
        const box = sprite.getBoundingBox();
        if (!box.fullyWithinBox(gameArea)) return false;
        if (isOverlappingMinos(matrixX, matrixY)) return false;
        // console.log("<0");
        if (matrixX < 0 || matrixY < 0) return false;
        if (matrixX + BLOCK_WIDTH() > MATRIX_WIDTH) return false;
        // if (matrixY + BLOCK_HEIGHT() > MATRIX_HEIGHT) return false;
        return true;
    }

    /**
     * Retrieves the letter associated with the tetromino.
     * @returns {string} The letter associated with the tetromino.
     */
    const getLetter = () => letter;

    /**
     * Checks if the current tetromino is overlapping with other tetrominos in the matrix.
     * @param {number} matrixX - The x-coordinate of the current tetromino in the matrix.
     * @param {number} matrixY - The y-coordinate of the current tetromino in the matrix.
     * @returns {boolean} - True if the tetromino is overlapping with other tetrominos, false otherwise.
     */
    const isOverlappingMinos = (matrixX, matrixY) => {
        // console.log("--- START IS_OVERLAPPING_MINOS() ---", matrixX, matrixY);
        const BOX = sprite.getBoundingBox();
        const imageData = ctx.getImageData(
            BOX.getLeft(),
            BOX.getTop(),
            WIDTH(),
            HEIGHT()
        ).data;
        for (let _w = 0; _w < BLOCK_WIDTH(); _w++) {
            for (let _h = 0; _h < BLOCK_HEIGHT(); _h++) {
                if (!sequences[getBlockId()].minos[_h][_w]) continue;

                const _mX = matrixX + _w;
                const _mY = matrixY + _h;
                // if (_mY >= 14) continue;
                // console.log({ _mY }, { _mX }, { minosMatrix });
                const _mino = minosMatrix[_mY][_mX];

                const alpha = getAlpha(imageData, _mX, _mY);
                // if (alpha == 0) continue;

                if (_mino != undefined) {
                    // console.log(
                    //     "I am not transparent and there is someone below me",
                    //     { _mX },
                    //     { _mY },
                    //     { _mino },
                    //     { alpha }
                    // );
                    return true;
                }
            }
        }
        // console.log("--- END IS_OVERLAPPING_MINOS() ---");
        return false;
    };

    let isHardDrop = false;
    let lastUpdate = 0;

    /**
     * Drops the tetromino down by one row.
     * @param {number} time - The timestamp when this function is called
     * @returns {boolean} hitBottom - True if the tetromino's position is fixed, false otherwise.
     */
    const drop = (time) => {
        /* Update the player if the player is moving */
        let { x, y } = sprite.getXY();
        const { matrixX, matrixY } = getMatrixXY();
        if (lastUpdate == 0) lastUpdate = time;

        if (isHardDrop || time - lastUpdate >= speed) {
            isHardDrop = false;
            // console.log(matrixY)

            // if matrixY is 0, return true to fix position
            if (matrixY == 0) {
                console.log("--- DROP(): MatrixY == 0 ---", matrixX, matrixY);
                return true;
            }

            if (isOverlappingMinos(matrixX, matrixY - 1)) {
                console.log(
                    "--- DROP(): Overlapping Minos ---",
                    matrixX,
                    matrixY
                );
                return true;
            }
            /* Update the player if the player is moving */
            y += MINO_HEIGHT;

            /* Set the new position if it is within the game area */
            if (isValidPosition(x, y)) {
                // console.log("is valid posiition");
                sprite.setXY(x, y);
            }
            lastUpdate = time;
            return false;
        }
        return false;
    };

    /**
     * Returns the color indices for the specified coordinates.
     *
     * @param {number} _x - The x-coordinate.
     * @param {number} _y - The y-coordinate.
     * @returns {Object} An object containing the color indices for red, green, blue, and alpha channels.
     */
    const getColorIndicesForCoord = (_x, _y) => {
        // const red = _y * (CANVAS_WIDTH * 4) + _x * 4;
        const red = _y * (WIDTH() * 4) + _x * 4;
        return { r: red, g: red + 1, b: red + 2, a: red + 3 };
    };

    /**
     * Retrieves the alpha value of a pixel in the given image data at the specified coordinates.
     *
     * @param {ImageData} _imageData - The image data containing the pixel information.
     * @param {number} _x - The x-coordinate of the pixel.
     * @param {number} _y - The y-coordinate of the pixel.
     * @returns {number} The alpha value of the pixel.
     */
    const getAlpha = (_imageData, _x, _y) => {
        // console.log(_x, _y);
        const { r, g, b, a } = getColorIndicesForCoord(_x, _y);
        return _imageData[a];
    };

    /**
     * Converts the tetromino image data to minos matrix.
     * @param {ImageData} imageData - The image data of the player canvas.
     */
    const tetrominoToMinos = (_matrixX = null, _matrixY = null) => {
        // console.log("--- START TETROMINO_TO_MINOS() ---");
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

        let noCollision = true;
        for (let _w = 0; _w < BLOCK_WIDTH(); _w++) {
            for (let _h = 0; _h < BLOCK_HEIGHT(); _h++) {
                if (!sequences[getBlockId()].minos[_h][_w]) continue;
                const _mX = _matrixX + _w;
                const _mY = _matrixY + _h;
                const alpha = getAlpha(
                    imageData,
                    // _mX * MINO_WIDTH + MINO_WIDTH / 2,
                    _w * MINO_WIDTH + MINO_WIDTH / 2,
                    // CANVAS_HEIGHT - _mY * MINO_HEIGHT - MINO_HEIGHT / 2
                    HEIGHT() - _h * MINO_HEIGHT - MINO_HEIGHT / 2
                );
                console.log(_w, _h, alpha);
                if (alpha == 255 && !minosMatrix[_mY][_mX]) {
                    minosMatrix[_mY][_mX] = letter;
                } else if (alpha == 255 && minosMatrix[_mY][_mX]) {
                    console.log(
                        "Collision Detected at",
                        _mX,
                        _mY,
                        "with",
                        minosMatrix[_mY][_mX]
                    );
                    noCollision = false;
                }
            }
        }
        console.table(minosMatrix);
        // console.table(minosMatrix);
        // console.log("--- END TETROMINO_TO_MINOS() ---");
        return noCollision;
    };

    /**
     * Checks if a tetromino can spawn at the current position.
     * @returns {boolean} Returns true if the tetromino can spawn, false otherwise.
     */
    const canSpawn = () => isValidMatrixPosition(3, 12);

    const updateMinosMatrix = (_matrix) => {
        minosMatrix = _matrix;
    };

    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        getLetter,
        getMatrixXY,
        move,
        tetrominoToMinos,
        isValidMatrixPosition,
        drop,
        getBoundingBox: sprite.getBoundingBox,
        draw: sprite.draw,
        canSpawn,
        minosMatrix: _minosMatrix,
        updateMinosMatrix,
    };
};
