const HOME_LOGIN = 0;
const HOME_REGISTER = 1;
const HOME_HOWTOPLAY = 2;
const HOME_PROFILE = 3;
const HOME_SETTING = 4;
const HOME_HIDDEN = 5;

const TIME_MODE_DESCRIPTION =
    "Players obtain as many scores as possible in 2 minutes \n with predefined constant difficulty.";
const SURVIVAL_MODE_DESCRIPTION =
    "No time limit but the game gets more \n difficult as it continues.";
const DESCRIPTION_PLACEHOLDER = "\n\n";

function hideAllPages() {
    $("#container")
        .children()
        .each(function () {
            $(this).hide();
        });
}

function secondsToText(totalSeconds) {
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    return minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);
}

function milisecondsToText(totalMiliSeconds) {
    let totalSeconds = Math.floor(totalMiliSeconds / 1000);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    return minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);
}

let user = null;

const HomePage = (function () {
    let sidePanelStatus = -1;

    const hideSidePanel = function () {
        sidePanelStatus = HOME_HIDDEN;
        $("#home-panel").css("width", "100vw");
        $("#home-side-panel").css("width", "0vw");
        $("#home-side-panel").hide();
        $("#title").css("font-size", "500%");
    };

    const renderSidePanel = function (status) {
        // 0 - login, 1 - register, 2 - how to play, 3 - profile, 4 - setting
        $("#home-panel").css("width", "50vw");
        $("#home-side-panel").css("width", "50vw");
        $("#home-side-panel").show();
        $("#title").css("font-size", "400%");
        const contents = [
            $("#signin-form"),
            $("#register-form"),
            $("#how-to-play"),
            $("#user-panel"),
            $("#setting-page"),
            $("#match-page"),
        ];
        contents.forEach((element) => element.hide());
        contents[status].show();
        sidePanelStatus = status;
    };

    const buttonFunc = function (status) {
        console.log(sidePanelStatus);
        if (sidePanelStatus != status) {
            renderSidePanel(status);
        } else {
            hideSidePanel();
        }
    };

    const initialize = function () {
        $(".before-login").show();
        $(".after-login").hide();
        $("#home-side-panel").hide();
        hideAllPages();
        $("#homepage").show();

        $("#register-button").click(function () {
            buttonFunc(HOME_REGISTER);
        });
        $("#login-button").click(function () {
            buttonFunc(HOME_LOGIN);
        });
        $("#howtoplay-button").click(function () {
            if (sidePanelStatus != HOME_HOWTOPLAY) {
                renderSidePanel(HOME_HOWTOPLAY);
            } else if (!Authentication.getUser()) {
                hideSidePanel();
            }
        });
        $("#profile-button").click(function () {
            buttonFunc(HOME_PROFILE);
        });
        $("#match-button").click(function () {
            MatchPage.show();
            $("#homepage").hide();
        });
        $("#setting-button").click(function () {
            if (sidePanelStatus != HOME_SETTING) {
                renderSidePanel(HOME_SETTING);
            } else if (!Authentication.getUser()) {
                hideSidePanel();
            }
        });
        $("#bgm-volume").click(function () {
            UI.setBGMVolume($(this).val());
        });
        $("#sounds-volume").click(function () {
            UI.setSoundsVolume($(this).val());
        });
    };

    const show = function () {
        $(".before-login").show();
        $(".after-login").hide();
        $("#home-side-panel").hide();
        hideAllPages();
        $("#homepage").show();
        UI.playBGM();
    };

    const returnHome = function () {
        $("#homepage").show();
        renderSidePanel(HOME_PROFILE);
        //$("#home-side-panel").show();
        UI.playBGM();
    };

    return {
        initialize,
        renderSidePanel,
        show,
        returnHome,
    };
})();

const MatchPage = (function () {
    let phase = 1;
    let gameData = {
        isPublic: false,
        invitationCode: "",
        isGameModeTime: false,
    };
    let timerID = 0;
    const pageChange = function (newPhase) {

        /* 
        When phase is set to the following values, the corresponding page will be displayed when return button is clicked:
        3 - choose gamemode page
        2 - "Create private room", "Join private room", "Public Match"
        1 - home page
        */

        switch (newPhase) {
            case 0:
                $("#homepage").show();
                $("#match-page").hide();
                phase = 1;
                break;
            case 1:
                hideAll();
                $("#match-content-container").children().first().show();
                phase = newPhase;
                break;
            case 2:
                hideAll();
                $("#match-choose-gamemode").show();
                phase = newPhase;
                break;
        }
    };
    const initialize = function () {
        hideAll();
        $("#match-page")
            .children()
            .each(function () {
                $(this).hide();
            });
        $("#match-content-container").children().first().show();

        $("#create-private-game-button").click(function () {
            hideAll();
            phase = 2;
            gameData.isPublic = false;
            $("#match-choose-gamemode").show();
        });

        $("#join-private-game-button").click(function () {
            hideAll();
            phase = 2;
            gameData.isPublic = false;
            $("#join-private-game-page").show();
        });

        $("#public-match-button").click(function () {
            hideAll();
            phase = 2;
            gameData.isPublic = true;
            $("#match-choose-gamemode").show();
        });

        $("#match-page-return").click(function () {
            if (phase == 3) {
                console.log("leaving room");
                Socket.leaveRoom();
            }
            pageChange(phase - 1);
            if (timerID) {
                clearInterval(timerID);
                timerID = 0;
                $("#queue-timer").text("0:00");
            }
        });

        $("#time-mode-button").click(function () {
            hideAll();
            phase = 3;
            if (gameData.isPublic) {
                $("#public-match-page").show();
                timerID = timer();
                Socket.publicMatch(1);
            } else {
                Socket.createRoom(1);
                $("#create-private-game-page").show();
            }
        });

        $("#survival-mode-button").click(function () {
            hideAll();
            phase = 3;
            if (gameData.isPublic) {
                $("#public-match-page").show();
                timerID = timer();
                Socket.publicMatch(2);
            } else {
                Socket.createRoom(2);
                $("#create-private-game-page").show();
            }
        });

        $("#join-room-form").on("submit", (e) => {
            $("join-room-message").text("");
            // Do not submit the form
            e.preventDefault();
            const room = $("#join-room-id").val().trim();
            console.log("join room", room);
            const joinRoomSuccessful = Socket.joinRoom(room);
            if (joinRoomSuccessful) {
                $("#joined-room-id").text(room);
            } else {
                $("#join-room-message").text("You are already a Room.");
            }
        });

        $("#time-mode-button").on("mouseover", function () {
            $("#match-mode-description").text(TIME_MODE_DESCRIPTION);
        });

        $("#time-mode-button").on("mouseleave", function () {
            $("#match-mode-description").text(DESCRIPTION_PLACEHOLDER);
        });

        $("#survival-mode-button").on("mouseover", function () {
            $("#match-mode-description").text(SURVIVAL_MODE_DESCRIPTION);
        });

        $("#survival-mode-button").on("mouseleave", function () {
            $("#match-mode-description").text(DESCRIPTION_PLACEHOLDER);
        });
    };

    const timer = function () {
        $("#public-match-page").show();
        let totalSeconds = 0;
        return setInterval(() => {
            $("#queue-timer").text(secondsToText(totalSeconds));
            totalSeconds++;
        }, 1000);
    };

    const returnContinue = function() {
        if (phase == 3) {
            console.log("leaving room");
            Socket.leaveRoom();
        }
        pageChange(phase - 1);
        if (timerID) {
            clearInterval(timerID);
            timerID = 0;
            $("#queue-timer").text("0:00");
        }
    }

    const stopTimer = function () {
        clearInterval(timerID);
        timerID = 0;
        $("#queue-timer").text("0:00");
        $("#public-match-page").hide();
    };

    const roomCreated = function (room) {
        console.log("room created", room);
        $("#created-room-id").prop("value", room);
    };

    const roomNotFound = function () {
        $("#join-room-message").text("Room not found.");
    };

    const roomFull = function () {
        $("#join-room-message").text("Room is full.");
    };

    const waitingForOpponent = function () {
        $("#join-room-message").text("Waiting for opponent.");
    };

    const show = function () {
        $("#match-page").show();
        $("#match-page")
            .children()
            .each(function () {
                $(this).show();
            });
        $("#match-content-container").children().first().show();
    };

    const hideAll = function () {
        $("#match-content-container")
            .children()
            .each(function () {
                $(this).hide();
            });
    };

    const hide = function () {
        $("#match-page").hide();
    };

    const reset = function() {
        $("#create-private-game-page").hide();
        $("#join-room-id").text("");
        $("#join-room-message").text("");
        phase = 1;
    }

    return {
        initialize,
        show,
        stopTimer,
        roomCreated,
        roomFull,
        roomNotFound,
        waitingForOpponent,
        hideAll,
        hide,
        reset
    };
})();

const SignInForm = (function () {
    /**
     * Initializes the UI.
     */
    const initialize = function () {
        // Populate the avatar selection
        Avatar.populate($("#register-avatar"));

        // Hide it
        $("#signin-overlay").hide();

        // Submit event for the signin form
        $("#signin-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#signin-username").val().trim();
            const password = $("#signin-password").val().trim();

            // Send a signin request
            Authentication.signin(
                username,
                password,
                () => {
                    //hide();
                    console.log("signed in");
                    UserPanel.update(Authentication.getUser());
                    user = Authentication.getUser();
                    UserPanel.show();
                    $(".before-login").hide();
                    HomePage.renderSidePanel(HOME_PROFILE);
                    $(".after-login").show();

                    Socket.connect();
                },
                (error) => {
                    $("#signin-message").text(error);
                }
            );
        });

        // Submit event for the register form
        $("#register-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#register-username").val().trim();
            const avatar = $("#register-avatar").val();
            const name = $("#register-name").val().trim();
            const password = $("#register-password").val().trim();
            const confirmPassword = $("#register-confirm").val().trim();

            // Password and confirmation does not match
            if (password != confirmPassword) {
                $("#register-message").text("Passwords do not match.");
                return;
            }

            // Send a register request
            Registration.register(
                username,
                avatar,
                name,
                password,
                () => {
                    $("#register-form").get(0).reset();
                    $("#register-message").text("You can sign in now.");
                },
                (error) => {
                    $("#register-message").text(error);
                }
            );
        });
    };

    // This function shows the form
    const show = function () {
        $("#signin-overlay").fadeIn(500);
    };

    // This function hides the form
    const hide = function () {
        $("#signin-form").get(0).reset();
        $("#signin-message").text("");
        $("#register-message").text("");
        $("#signin-overlay").fadeOut(500);
    };

    return {
        initialize,
        show,
        hide,
    };
})();

const GameOver = (function () {
    const testData = {
        player1: {
            username: "tony",
            avatar: "Owl",
            name: "Tony Lee",
            stat: {
                score: "572",
                linesOfBlocks: "4",
                tetrisCount: "8",
                time: "114514",
            },
        },
        player2: {
            username: "john",
            avatar: "Hamster",
            name: "John Chan",
            stat: {
                score: "452",
                linesOfBlocks: "2",
                tetrisCount: "3",
                time: "100100",
            },
        },
        datetime: "2022-01-01T01:00:00.000Z",
        mode: "??",
    };

    const gameoverSound = new Audio("src/res/gameover.wav");

    let currentPage = 1;
    // BUG: Reset Game Over screen after each match

    const initialize = function () {
        $("#gameover").hide();
        $("#gameover-rematch").hide();
        $("#scoreboard-page").hide();
        $("#gameover-rematch-waiting").hide();
        update(testData);
        //show();
        $("#gameover-next").click(function () {
            $("#gameover").children().eq(currentPage++).fadeOut();
            setTimeout(function () {
                $("#gameover").children().eq(currentPage).fadeIn();
            }, 500);
            if (currentPage == 3) {
                $(this).hide();
            }
        });

        $("#rematch-button").click(function () {
            //rematch
            // Show waiting for opponent
            $("#gameover")
                .children()
                .each(function () {
                    $(this).hide();
                });
            $("#gameover-rematch-waiting").show();
            Socket.requestRematch();
            $("#game-container").hide();
            /* hide();
            MatchPage.show();
            MatchPage.waitingForOpponent(); */
        });

        $("#gameover-home-button").click(function () {
            Socket.postLeave();
            Socket.leaveRoom();
            HomePage.returnHome();
            $("#gameover").hide();
            reset();
        });

        $("#rematch-leave").click(function () {
            Socket.postLeave();
            Socket.leaveRoom();
            HomePage.returnHome();
            $("#gameover").hide();
            reset();
        });
    };

    const hideAllChildren = function () {
        $("#gameover")
            .children()
            .each(function () {
                $(this).hide();
            });
    };

    const setOpponentLeaveMsg = function () {
        console.log("opponent leave");
        $("#rematch-text").text("Opponent has left the room.");
    };

    const reset = function () {
        $("#gameover-rematch").hide();
        $("#scoreboard-page").hide();
        $("#gameover-rematch-waiting").hide();
        $("#rematch-text").text("Waiting for opponent's response...");
        $("#gameover-title").css("transform", "");
        $("#gameover-title").css("animation-name", "");
        $("#gameover-title").css("animation-duration", "5s");
        $("#gameover-title").show();
        $("#gameover-stat").hide();
    };

    const show = function () {
        let titleDuration = 8 * 1000;
        let titleStopTime = 745;
        let titleFadeOutTime = 55;
        let statShowTime = 700;
        let buffer = 100;

        currentPage = 1;

        gameoverSound.volume = UI.getSoundsVolume();
        gameoverSound.pause();
        gameoverSound.currentTime = 0;
        gameoverSound.play();

        $("#gameover").css("display", "flex");

        setTimeout(function () {
            $("#gameover-title").css(
                "animation-name",
                "gameover-title-animation"
            );
        }, 3000);
        setTimeout(function () {
            $("#gameover-title").css("transform", "translateY(-300px)");
        }, 5000 - buffer);
        setTimeout(function () {
            $("#gameover-title").fadeOut();
            $("#gameover-title").css("animation-name", "");
        }, titleDuration + titleStopTime + titleFadeOutTime);
        setTimeout(function () {
            //$(".gameover-text").css("display", "flex");
            $("#gameover-stat").show();
            $("#gameover-next").fadeIn();
        }, titleDuration + titleStopTime + titleFadeOutTime + statShowTime);
        // Socket.setScoreBoard(1, false);
    };

    const update = function (room) {
        const player = room["player1"];
        const opponent = room["player2"];
        $("#player-stat .user-avatar").html(Avatar.getCode(player.avatar));
        $("#player-stat .user-name").text(player.name);
        $("#opponent-stat .user-avatar").html(Avatar.getCode(opponent.avatar));
        $("#opponent-stat .user-name").text(opponent.name);

        const playerData = [];
        const opponentData = [];
        for (key in player.stat) {
            playerData.push(player.stat[key]);
        }
        for (key in opponent.stat) {
            opponentData.push(opponent.stat[key]);
        }

        for (let i = 0; i < 3; i++) {
            $("#player-stat")
                .children()
                .eq(i + 2)
                .text(playerData[i]);
        }
        for (let i = 0; i < 3; i++) {
            $("#opponent-stat")
                .children()
                .eq(i + 2)
                .text(opponentData[i]);
        }
        $("#player-stat")
            .children()
            .eq(5)
            .text(milisecondsToText(player.stat["time"]));
        $("#opponent-stat")
            .children()
            .eq(5)
            .text(milisecondsToText(opponent.stat["time"]));
    };

    const hide = function () {
        $("#gameover").hide();
        $("#gameover-rematch").hide();
        $("#scoreboard-page").hide();
    };
    return {
        initialize,
        show,
        update,
        hide,
        setOpponentLeaveMsg,
        reset,
    };
})();

const Scoreboard = (function () {
    const initialize = function () {};

    /**
     *Update the scoreboard with the given players
     * @param {Number} _mode 0 for game over scorboard, 1 for time mode, 2 for survival mode
     * @param {string} players JSON object of the scoreboard of this mode
     */
    const update = function (_mode, players) {
        const playerArray = [];
        const playerObj = JSON.parse(players);
        for (id in playerObj) {
            playerArray.push(playerObj[id]);
        }
        console.log("Got new scoreboard", { _mode }, { playerArray });
        playerArray.sort((a, b) => parseInt(b.score) - parseInt(a.score));
        switch (_mode) {
            case 0:
                _scoreboardId = "scoreboard-page";
                break;
            case 1:
                _scoreboardId = "time-mode-scoreboard";
                break;
            case 2:
                _scoreboardId = "survival-mode-scoreboard";
                break;
            default:
                break;
        }

        scoreboard_playerlist = $(`#${_scoreboardId} .scoreboard-playerlist`);
        scoreboard_scorelist = $(`#${_scoreboardId} .scoreboard-scorelist`);

        console.log({ scoreboard_playerlist }, { scoreboard_scorelist });

        scoreboard_playerlist.empty();
        scoreboard_scorelist.empty();

        scoreboard_playerlist.append($("<div>Player</div>"));
        scoreboard_scorelist.append($("<div>Score</div>"));
        for (let i = 0; i < 10; i++) {
            scoreboard_playerlist.append(
                //$("<div class='row'><span class=\"user-avatar\"></span><div>" + playerArray[i].name + "</div></div>")
                $("<div>" + playerArray[i].name + "</div>")
            );
            //$("#scoreboard-playerlist .user-avatar").html(Avatar.getCode(playerArray[i].avatar));
            scoreboard_scorelist.append(
                $("<div>" + playerArray[i].score + "</div>")
            );
        }
        console.log("update scoreboard done");
    };
    return {
        initialize,
        update,
    };
})();
/**
 * UserPanel represents the user interface for the user panel.
 * @namespace
 */
const UserPanel = (function () {
    // This function initializes the UI
    const initialize = function () {
        // Hide it
        $("#user-panel").hide();

        // Click event for the signout button
        $("#signout-button").on("click", () => {
            // Send a signout request
            Authentication.signout(() => {
                Socket.disconnect();
                user = null;
                //hide();
                //SignInForm.show();
                HomePage.show();
            });
        });
    };

    // This function shows the form with the user
    const show = function (user) {
        $("#user-panel").show();
    };

    // This function hides the form
    const hide = function () {
        $("#user-panel").hide();
    };

    const updateNumberOfUsers = function (num) {
        $("#num-of-users-online").text(num);
    };

    const updatePersonalBestScore = function (_mode, _score) {
        if (_mode == 1) $("#time-mode-score").text(_score);
        if (_mode == 2) $("#survival-mode-score").text(_score);
    };

    const updateScoreboardPosition = function (_mode, _position) {
        if (_mode == 1) $("#time-mode-position").text(_position);
        if (_mode == 2) $("#survival-mode-position").text(_position);
    };

    // This function updates the user panel
    const update = function (user) {
        if (user) {
            $("#user-panel .user-avatar").html(Avatar.getCode(user.avatar));
            $("#user-panel .user-name").text(user.name);
        } else {
            $("#user-panel .user-avatar").html("");
            $("#user-panel .user-name").text("");
        }
    };

    return {
        initialize,
        show,
        hide,
        update,
        updateNumberOfUsers,
        updatePersonalBestScore,
        updateScoreboardPosition,
    };
})();

const OnlineUsersPanel = (function () {
    // This function initializes the UI
    const initialize = function () {};

    // This function updates the online users panel
    const update = function (onlineUsers) {
        const onlineUsersArea = $("#online-users-area");

        // Clear the online users area
        onlineUsersArea.empty();

        // Get the current user
        const currentUser = Authentication.getUser();
        user = currentUser;

        // Add the user one-by-one
        for (const username in onlineUsers) {
            if (username != currentUser.username) {
                onlineUsersArea.append(
                    $("<div id='username-" + username + "'></div>").append(
                        UI.getUserDisplay(onlineUsers[username])
                    )
                );
            }
        }
    };

    // This function adds a user in the panel
    const addUser = function (user) {
        const onlineUsersArea = $("#online-users-area");

        // Find the user
        const userDiv = onlineUsersArea.find("#username-" + user.username);

        // Add the user
        if (userDiv.length == 0) {
            onlineUsersArea.append(
                $("<div id='username-" + user.username + "'></div>").append(
                    UI.getUserDisplay(user)
                )
            );
        }
    };

    // This function removes a user from the panel
    const removeUser = function (user) {
        const onlineUsersArea = $("#online-users-area");

        // Find the user
        const userDiv = onlineUsersArea.find("#username-" + user.username);

        // Remove the user
        if (userDiv.length > 0) userDiv.remove();
    };

    return {
        initialize,
        update,
        addUser,
        removeUser,
    };
})();

/**
 * Represents a chat panel that handles UI interactions and updates for a chatroom.
 * @namespace ChatPanel
 */
const ChatPanel = (function () {
    // This stores the chat area
    let chatArea = null;
    // This function initializes the UI
    const initialize = function () {
        // Set up the chat area
        chatArea = $("#chat-area");

        // Submit event for the input form
        $("#chat-input-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the message content
            const content = $("#chat-input").val().trim();

            // Post it
            Socket.postMessage(content);

            // Clear the message
            $("#chat-input").val("");
        });
    };

    // This function updates the chatroom area
    const update = function (chatroom) {
        // Clear the online users area
        chatArea.empty();

        // Add the chat message one-by-one
        for (const message of chatroom) {
            addMessage(message);
        }
    };

    // This function adds a new message at the end of the chatroom
    const addMessage = function (message) {
        /* const datetime = new Date(message.datetime);
        const datetimeString =
            datetime.toLocaleDateString() + " " + datetime.toLocaleTimeString();

        chatArea.append(
            $("<div class='chat-message-panel row'></div>")
                .append(UI.getUserDisplay(message.user))
                .append(
                    $("<div class='chat-message col'></div>")
                        .append(
                            $(
                                "<div class='chat-date'>" +
                                    datetimeString +
                                    "</div>"
                            )
                        )
                        .append(
                            $(
                                "<div class='chat-content'>" +
                                    message.content +
                                    "</div>"
                            )
                        )
                )
        );
        chatArea.scrollTop(chatArea[0].scrollHeight); */
    };

    return {
        initialize,
        update,
        addMessage,
    };
})();

// Socket.connect();
// Socket.joinRoom("room1");

// Game;
const Game = (function () {
    const grassland = [];
    const opponent_cv = $("canvas").get(2);
    const opponent_context = opponent_cv.getContext("2d", {
        willReadFrequently: true,
        alpha: true,
    });
    const player_cv = $("canvas").get(1);
    /**
     * The context for drawing on the player canvas.
     *
     * @type {CanvasRenderingContext2D}
     */
    const player_context = player_cv.getContext("2d", {
        willReadFrequently: true,
        alpha: true,
        // desynchronized: true,
    });
    let mode = 0;
    let level = 0;

    /**
     * Represents the player's game area.
     * @type {GameArea}
     */
    let player_gameArea = null;
    /**
     * Represents the opponent's game area.
     * @type {GameArea}
     */
    let opponent_gameArea = null;
    let opponent = null;

    const setLevel = (level) => {
        player_gameArea.setLevel(level);
        opponent_gameArea.setLevel(level);
    };

    const setOpponent = function (_opponent) {
        opponent = _opponent;
    };

    const getOpponent = function () {
        return opponent;
    };

    function initialize() {
        $("#countdown").hide();
        $("#gameover").hide();
        grassCV = $("#grassland").get(0);
        grassContext = grassCV.getContext("2d");
        var img = new Image();
        img.onload = function() {
            for (let i = 0; i < 2; ++i) {
            console.log("i = ", i);
            grassland.push(Grass(grassContext, 20+i*42, grassCV.height-27))
            }
            grassland.forEach((element)=>{element.draw();})
            console.log("grassland game init")
        };
        img.src = "../src/res/grassland_sprite.png";
        //$("#game-container").hide();
    }

    const doFrameGrassland = function(now) {
        grassland.forEach((element)=>{element.update(now);})
        grassContext.clearRect(0, 0, grassCV.width, grassCV.height);
        grassland.forEach((element)=>{element.draw();})

        const secondHand = $('.second-hand');
        const minsHand = $('.min-hand');
        const hourHand = $('.hour-hand');

        const t = new Date();
        const seconds = t.getSeconds();
        const secondsDegrees = ((seconds / 60) * 360) + 90;
        secondHand.css("transform",`rotate(${secondsDegrees}deg)`)
        const mins = t.getMinutes();
        const minsDegrees = ((mins / 60) * 360) + ((seconds/60)*6) + 90;
        minsHand.css("transform",`rotate(${minsDegrees}deg)`);
        const hour = t.getHours();
        const hourDegrees = ((hour / 12) * 360) + ((mins/60)*30) + 90;
        hourHand.css("transform",`rotate(${hourDegrees}deg)`);
    }



    const initGame = function (_mode) {
        $("#homepage").hide();
        UI.stopBGM();
        GameOver.reset();
        GameOver.hide();
        MatchPage.reset();
        MatchPage.hide();
        $("#countdown").show();
        $("#join-private-game-page").hide();

        player_gameArea = new GameArea(player_cv, player_context, true);
        opponent_gameArea = new GameArea(opponent_cv, opponent_context, false);

        isGameOver = false;

        mode = _mode;
        console.log(mode, _mode);

        console.log("ui.js initialize");
        // Initialize the game area
        player_gameArea.initialize(_mode);
        opponent_gameArea.initialize(_mode);
        return opponent_gameArea;
    };
    let isGameOver = false;

    const addCheatRow = (isForPlayer = true) => {
        console.log("Add cheat row");
        if (isForPlayer) player_gameArea.addCheatRow();
        else opponent_gameArea.addCheatRow();
    };

    const addPunishRow = (isForPlayer = true, hole) => {
        if (isForPlayer) player_gameArea.addPunishRow(hole);
        else opponent_gameArea.addPunishRow(hole);
    };

    const setGameOver = () => {
        isGameOver = true;
        // Socket.setGameOver(true);
    };
    const getGameOver = () => isGameOver;

    const gameOver = function (playerLost = false, sendGameOverSignal = false) {
        console.log("game over from ui.js called");
        // Note: Each browser should only call this function once
        // if (!opponent_gameArea || !player_gameArea) return;
        if (sendGameOverSignal) Socket.setGameOver(true);
        setGameOver();
        console.log("");

        opponent_gameArea.sendStats();
        player_gameArea.sendStats();

        // Show game statistics
        const playerStats = player_gameArea.getStats();
        const opponentStats = opponent_gameArea.getStats();
        Socket.getScoreBoard(mode, true);
        const gameOverData = {
            player1: {
                avatar: user.avatar,
                name: user.name,
                stat: playerStats,
            },
            player2: {
                avatar: opponent.avatar,
                name: opponent.name,
                stat: opponentStats,
            },
            mode: mode,
            datetime: new Date(),
        };
        GameOver.update(gameOverData);
        console.log("GameOver game over", { playerLost }, { gameOverData });
        Game.hide();
        // Reset all values
        // isGameOver = false;
        mode = 0;

        opponent_gameArea = null;
        player_gameArea = null;
        player_context.reset();
        opponent_context.reset();

        GameOver.show();
        console.log("UI.js:  Game ended ");
    };

    const startGame = function () {
        player_gameArea.startGame();
        opponent_gameArea.startGame();
    };

    const hide = function () {
        $("#game-container").hide();
    };

    return {
        initialize,
        startGame,
        initGame,
        gameOver,
        getGameOver,
        setGameOver,
        hide,
        addCheatRow,
        addPunishRow,
        setLevel,
        setOpponent,
        doFrameGrassland
    };
})();

/**
 * UI module for managing user interface components.
 * @module UI
 */
const UI = (function () {
    // This function gets the user display
    const getUserDisplay = function (user) {
        return $("<div class='field-content row shadow'></div>")
            .append(
                $(
                    "<span class='user-avatar'>" +
                        Avatar.getCode(user.avatar) +
                        "</span>"
                )
            )
            .append($("<span class='user-name'>" + user.name + "</span>"));
    };

    const bgm = new Audio("src/res/main-bgm.mp3");
    let soundsVolume = 0.2;
    let BGMVolume = 0.2;

    // The components of the UI are put here
    const components = [
        HomePage,
        SignInForm,
        UserPanel,
        OnlineUsersPanel,
        ChatPanel,
        Game,
        MatchPage,
        GameOver,
        // Match,
        Scoreboard,
    ];

    // This function initializes the UI
    const initialize = function () {
        // Initialize the components
        bgm.volume = BGMVolume;
        bgm.loop = true;
        bgm.play();

        $("button").click(function () {
            buttonClickSoundFunc();
        });
        $(".homepage-buttons").click(function () {
            buttonClickSoundFunc();
        });

        $(".match-buttons").click(function () {
            buttonClickSoundFunc();
        });

        for (const component of components) {
            component.initialize();
        }
    };

    const buttonClickSound = new Audio("src/res/click.wav");

    function buttonClickSoundFunc() {
        buttonClickSound.volume = UI.getSoundsVolume();
        buttonClickSound.pause();
        buttonClickSound.currentTime = 0;
        buttonClickSound.play();
    }

    const renderSidePanel = function (status) {
        HomePage.renderSidePanel(status);
    };

    const stopBGM = function () {
        bgm.pause();
    };

    const playBGM = function () {
        bgm.currentTime = 0;
        bgm.play();
    };

    const setBGMVolume = function (v) {
        let vv = 0;
        if (v > 0 && v < 1) {
            vv = v;
        } else {
            vv = v / 100;
        }
        bgm.volume = vv;
        BGMVolume = vv;
    };

    const setSoundsVolume = function (v) {
        let vv = 0;
        if (v > 0 && v < 1) {
            vv = v;
        } else {
            vv = v / 100;
        }
        soundsVolume = vv;
    };

    const getSoundsVolume = function () {
        return soundsVolume;
    };

    const getBGMVolume = function () {
        return BGMVolume;
    };

    return {
        getUserDisplay,
        initialize,
        renderSidePanel,
        stopBGM,
        playBGM,
        setBGMVolume,
        setSoundsVolume,
        getBGMVolume,
        getSoundsVolume,
    };
})();
