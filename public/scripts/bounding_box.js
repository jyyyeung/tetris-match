/**
 * Represents a bounding box on a canvas.
 *
 * This function defines the BoundingBox module.
 *
 * @constructor
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context. (A canvas context for using `isPathInPoint()`)
 * @param {number} top - The top coordinate of the bounding box.
 * @param {number} left - The left coordinate of the bounding box.
 * @param {number} bottom - The bottom coordinate of the bounding box.
 * @param {number} right - The right coordinate of the bounding box.
 */
const BoundingBox = function (ctx, top, left, bottom, right) {
    /**
     * Represents a path for drawing shapes on a canvas.
    
    * This is the path containing the bounding box.
    * It is initialized using the parameters of the function.
    *
    * `Path2D()` creates a new path that can be re-used by
    * the canvas context. This path is used to detect the
    * intersection of a point or a box against this
    * bounding box.
    * 
    * @type {Path2D}
     */
    const path = new Path2D();
    path.rect(left, top, right - left, bottom - top);

    /**
     * Returns the top coordinate of the bounding box.
     * @returns {number} The top coordinate.
     */
    const getTop = function () {
        // This function gets the top side of the bounding box.
        return top;
    };

    /**
     * Retrieves the left position of the bounding box.
     * @returns {number} The left position.
     */
    const getLeft = function () {
        // This function gets the left side of the bounding box.
        return left;
    };

    /**
     * Retrieves the bottom value of the bounding box.
     * @returns {number} The bottom value.
     */
    const getBottom = function () {
        // This function gets the bottom side of the bounding box.
        return bottom;
    };

    /**
     * Retrieves the right value.
     *
     * @returns {number} The right value.
     */
    const getRight = function () {
        // This function gets the right side of the bounding box.
        return right;
    };

    /**
     * Returns an object containing the coordinates of the bounding box points.
     * @returns {Object} An object with properties topLeft, topRight, bottomLeft, and bottomRight, each containing an array of coordinates [x, y].
     */
    const getPoints = function () {
        // This function gets the four corner points of the bounding box.
        return {
            topLeft: [left, top],
            topRight: [right, top],
            bottomLeft: [left, bottom],
            bottomRight: [right, bottom],
        };
    };

    /**
     * Checks if a given point is inside the bounding box.
     * @param {number} x - The x-coordinate of the point.
     * @param {number} y - The y-coordinate of the point.
     * @returns {boolean} - True if the point is inside the bounding box, false otherwise.
     */
    const isPointInBox = function (x, y) {
        // This function tests whether a point is in the bounding box.
        // - `x`, `y` - The (x, y) position to be tested
        return ctx.isPointInPath(path, x, y);
    };

    /**
     * Checks if this bounding box intersects with another bounding box.
     * @param {BoundingBox} box - The other bounding box to check against.
     * @returns {boolean} Returns true if the bounding boxes intersect, otherwise returns false.
     */
    const intersect = function (box) {
        // This function checks whether the two bounding boxes intersect.
        // - `box` - The other bounding box

        /* Check the points of the other box */
        let points = box.getPoints();
        for (const key in points) {
            if (isPointInBox(...points[key])) return true;
        }

        /* Check the points of this box */
        points = getPoints();
        for (const key in points) {
            if (box.isPointInBox(...points[key])) return true;
        }

        return false;
    };

    /**
     * Generates a random point within the bounding box.
     * @returns {{x: number, y: number}} The randomly generated point with x and y coordinates.
     */
    const randomPoint = function () {
        // This function generates a random point inside the bounding box.
        const x = left + Math.random() * (right - left);
        const y = top + Math.random() * (bottom - top);
        return { x, y };
    };

    // The methods are returned as an object here.
    return {
        getTop: getTop,
        getLeft: getLeft,
        getBottom: getBottom,
        getRight: getRight,
        getPoints: getPoints,
        isPointInBox: isPointInBox,
        intersect: intersect,
        randomPoint: randomPoint,
    };
};
