$(function () {
    /* Get the canvas and 2D context */
    const cv = $("canvas").get(0);
    const context = cv.getContext("2d");

    /* Create the sounds */
    const sounds = {
        background: new Audio("background.mp3"),
        collect: new Audio("collect.mp3"),
        gameover: new Audio("gameover.mp3"),
    };

    const totalGameTime = 20; // Total game time in seconds
    const gemMaxAge = 3000; // The maximum age of the gems in milliseconds
    let gameStartTime = 0; // The timestamp when the game starts
    let collectedGems = 0; // The number of gems collected in the game

    // TODO: Create game sprites

    /* Create the game area */
    const gameArea = BoundingBox(context, 165, 60, 420, 800);

    /* Create the sprites in the game */
    // const player = Player(context, 427, 240, gameArea); // The player
    // const gem = Gem(context, 427, 350, "green"); // The gem

    // Create the fires
    gameAreaPoints = gameArea.getPoints();
    // const fires = [
    //     Fire(context, gameAreaPoints.topLeft[0], gameAreaPoints.topLeft[1]),
    //     Fire(context, gameAreaPoints.topRight[0], gameAreaPoints.topRight[1]),
    //     Fire(
    //         context,
    //         gameAreaPoints.bottomLeft[0],
    //         gameAreaPoints.bottomLeft[1]
    //     ),
    //     Fire(
    //         context,
    //         gameAreaPoints.bottomRight[0],
    //         gameAreaPoints.bottomRight[1]
    //     ),
    // ];

    /* The main processing of the game */
    function doFrame(now) {
        if (gameStartTime == 0) gameStartTime = now;

        // /* Update the time remaining */
        // const gameTimeSoFar = now - gameStartTime;
        // const timeRemaining = Math.ceil(
        //     (totalGameTime * 1000 - gameTimeSoFar) / 1000
        // );
        // $("#time-remaining").text(timeRemaining);

        // /* Handle the game over situation here */
        // if (timeRemaining == 0) {
        //     $("#final-gems").text(collectedGems);
        //     sounds.background.pause();
        //     sounds.collect.pause();
        //     sounds.gameover.play();
        //     $("#game-over").show();
        //     return;
        // }

        // /* Update the sprites */
        // gem.update(now);
        // player.update(now);
        // fires.forEach((fire) => {
        //     fire.update(now);
        // });

        // /* Randomize the gem and collect the gem here */
        // if (gem.getAge(now) >= gemMaxAge) {
        //     gem.randomize(gameArea);
        // }

        // playerBox = player.getBoundingBox();
        // gemLoc = gem.getXY();
        // if (playerBox.isPointInBox(gemLoc.x, gemLoc.y)) {
        //     // Player touched gem
        //     sounds.collect.currentTime = 0;
        //     sounds.collect.play();
        //     collectedGems++;
        //     gem.randomize(gameArea);
        // }

        // /* Clear the screen */
        // context.clearRect(0, 0, cv.width, cv.height);

        // /* Draw the sprites */
        // gem.draw();
        // player.draw();
        // fires.forEach((fire) => {
        //     fire.draw();
        // });

        /* Process the next frame */
        requestAnimationFrame(doFrame);
    }

    /* Handle the start of the game */
    $("#game-start").on("click", function () {
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
            if (action < 0) return;
            // TODO: Handle other movements

            if (action == MOVE_LEFT) return console.log("keydown: move left");
            if (action == MOVE_RIGHT) return console.log("keydown: move right");
            if (action == ROTATE_LEFT)
                return console.log("keydown: rotate left");
            if (action == ROTATE_RIGHT)
                return console.log("keydown: rotate right");
            if (action == SOFT_DROP) return console.log("keydown: soft drop");
            if (action == HARD_DROP) return console.log("keydown: hard drop");
            if (action == HOLD) return console.log("keydown: hold");
            if (action == CHEAT_MODE) return console.log("keydown: cheat mode");
        });

        // Handle keyup of controls
        $(document).on("keyup", function (event) {
            action = action_from_key(event.keyCode);
            // Invalid Action
            if (action < 0) return;
            // TODO: Handle other movements
            if (action == MOVE_LEFT) return console.log("keyup: move left");
            if (action == MOVE_RIGHT) return console.log("keyup: move right");
            if (action == ROTATE_LEFT) return console.log("keyup: rotate left");
            if (action == ROTATE_RIGHT)
                return console.log("keyup: rotate right");
            if (action == SOFT_DROP) return console.log("keyup: soft drop");
            if (action == HARD_DROP) return console.log("keyup: hard drop");
            if (action == HOLD) return console.log("keyup: hold");
            if (action == CHEAT_MODE) return console.log("keyup: cheat mode");
        });

        /* Start the game */
        requestAnimationFrame(doFrame);
    });
});
