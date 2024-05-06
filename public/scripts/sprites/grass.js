// This function defines the grass module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the grass
// - `y` - The initial y position of the grass
const Grass = function(ctx, x, y) {

    // This is the sprite sequences of the grass
    const sequence = {
        x: 0, y:  0, width: 200, height: 210, count: 3, timing: 200, loop: true
    };

    // This is the sprite object of the grass created from the Sprite module.
    const sprite = Sprite(ctx, x, y);

    let lastUpdate = 0;
    let index = 0;

    // The sprite object is configured for the grass sprite here.
    sprite.setSequence(sequence)
          .setScale(1)
          .useSheet("../../src/res/grass_sprite.png");

          const update = function (time) {
            if (lastUpdate == 0) lastUpdate = time;
   
            // XXX: Move to the next sprite when the timing is right
            if (sequence.timing && time - lastUpdate >= sequence.timing) {
                // Draw the sprite
                index++;
                if (index >= sequence.count) {
                    // Repeat the animation from the first sprite only if sequence.loop is true
                    if (sequence.loop) index = 0;
                    else index--;
                }
   
                lastUpdate = time;
            }
   
            return this;
        };

    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        getBoundingBox: sprite.getBoundingBox,
        draw: sprite.draw,
        update: update
    };
};
