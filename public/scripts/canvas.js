$(function () {
    /* Get the canvas and 2D context */
    console.log("canvas.js")
    const opponent_cv = $("canvas").get(0);
    const opponent_context = opponent_cv.getContext("2d");
    const player_cv = $("canvas").get(1);
    const player_context = player_cv.getContext("2d");

    const icons = {
        O: "url(../src/res/icon-sprite.png) 0 0",
        Z: "url(../src/res/icon-sprite.png) 128px 0",
        S: "url(../src/res/icon-sprite.png) 384px 0",
        L: "url(../src/res/icon-sprite.png) 256px 0",
        J: "url(../src/res/icon-sprite.png) 0 96px",
        T: "url(../src/res/icon-sprite.png) 384px 96px",
        I: "url(../src/res/icon-sprite.png) 256px 96px",
    }
    /* Create the sounds */
    /* const sounds = {
        background: new Audio("background.mp3"),
        collect: new Audio("collect.mp3"),
        gameover: new Audio("gameover.mp3"),
    }; */

    const totalGameTime = 20; // Total game time in seconds
    const gemMaxAge = 3000; // The maximum age of the gems in milliseconds
    let gameStartTime = 0; // The timestamp when the game starts
    let collectedGems = 0; // The number of gems collected in the game

    const MATRIX_WIDTH = 10;
    const MATRIX_HEIGHT = 14;

    // TODO: Create game sprites

    /* Create the game area */
    //const gameArea = BoundingBox(context, 165, 60, 420, 800);

    /* Create the sprites in the game */
    // const player = Player(context, 427, 240, gameArea); // The player
    // const gem = Gem(context, 427, 350, "green"); // The gem

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

    function drawGrid(ctx) {
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
    }
    drawGrid(opponent_context);
    drawGrid(player_context);

    function setNextIcon(bool, index, block) { // bool - true if player, false if opponent. index max 3. block - char (OSLZJTI)
        if (bool) $("#player-next").children().eq(index).css("background",icons[block])
        else $("#opponent-next").children().eq(index).css("background",icons[block])
    }

    function setScore(bool, score) { // bool - true if player, false if opponent
        if (bool) $("#player-score").text(score);
        else $("#opponent-score").text(score);
    }

    function setHoldIcon(bool, block) { // bool - true if player, false if opponent. block - char (OSLZJTI)
        if (bool) $("#player-hold").children().css("background",icons[block])
        else $("#opponent-hold").children().css("background",icons[block])
    }

    const test_matrix = makeArray(MATRIX_WIDTH, MATRIX_HEIGHT);
    test_matrix[0][0] = 1;
    test_matrix[3][5] = 2;
    test_matrix[8][8] = 5;
    
    function renderMatrix(matrix, ctx) {
        const colors = ["empty","red","yellow","green","lightBlue","pink","darkBlue","purple", "grey"];
        for (let y = 0; y < MATRIX_HEIGHT; y++) {
            for (let x = 0; x < MATRIX_WIDTH; x++) {
                const n = matrix[y][x];
                if (n) {
                    console.log(n);
                    renderSingle(ctx, x, y, colors[n])
                }               
            }
        }
    }

    function renderSingle(ctx, x, y, color) {
        Tetromino(ctx, 16+32*x, 432-32*y, color).draw();
    }

    setNextIcon(true, 0, 'I');
    setNextIcon(false, 1, 'Z');
    setScore(true, 123);
    setScore(false, 456);
    setHoldIcon(true, 'O');
    setHoldIcon(false, 'T');

    const test = Tetromino(player_context,16,16,"green"); // This line is for loading the images
    setTimeout(function() {
        renderMatrix(test_matrix, player_context);
    }, 100)

    
    /* setTimeout(function() {
        renderSingle(player_context, 0, 0, "red");
        renderSingle(player_context, 9, 0, "yellow");
        renderSingle(player_context, 0, 13, "lightBlue");
        renderSingle(player_context, 9, 13, "pink");
    }, 100) */
    
    //updateNext();


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
            // TODO: Handle othe rmovements
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
