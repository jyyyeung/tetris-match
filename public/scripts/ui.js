const HOME_LOGIN = 0;
const HOME_REGISTER = 1;
const HOME_HOWTOPLAY = 2;
const HOME_PROFILE = 3;
const HOME_HIDDEN = 4;

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
        // 0 - login, 1 - register, 2 - how to play, 3 - profile
        $("#home-panel").css("width", "50vw");
        $("#home-side-panel").css("width", "50vw");
        $("#home-side-panel").show();
        $("#title").css("font-size", "400%");
        const contents = [
            $("#signin-form"),
            $("#register-form"),
            $("#how-to-play"),
            $("#user-panel"),
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
    };

    const show = function () {
        $(".before-login").show();
        $(".after-login").hide();
        $("#home-side-panel").hide();
        hideAllPages();
        $("#homepage").show();
    };

    return {
        initialize,
        renderSidePanel,
        show,
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
            if (phase == 3) Socket.leaveRoom();
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

    return {
        initialize,
        show,
        stopTimer,
        roomCreated,
        roomFull,
        roomNotFound,
        waitingForOpponent,
        hideAll,
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
                    HomePage.renderSidePanel(3);
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
    let currentPage = 1;
    // BUG: Reset Game Over screen after each match

    const initialize = function () {
        $("#gameover").hide();
        $("#gameover-rematch").hide();
        $("#scoreboard-page").hide();
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
            //TODO: rematch
        });

        $("#gameover-home-button").click(function () {
            Socket.leaveRoom();
            $("#homepage").show();
            $("#gameover").hide();
        });
    };
    const show = function () {
        currentPage = 1;
        $("#gameover").css("display", "flex");
        $("#gameover-title").css("animation-name", "gameover-title-animation");
        setTimeout(function () {
            $("#gameover-title").css("transform", "translateY(-300px)");
        }, 745);
        setTimeout(function () {
            $("#gameover-title").fadeOut();
        }, 800);
        setTimeout(function () {
            $(".gameover-text").css("display", "flex");
            $("#gameover-next").fadeIn();
        }, 1500);
        Socket.setScoreBoard();
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
    return {
        initialize,
        show,
        update,
    };
})();

const Scoreboard = (function () {
    const initialize = function () {};

    const update = function (players) {
        const playerArray = [];
        const playerObj = JSON.parse(players);
        for (id in playerObj) {
            playerArray.push(playerObj[id]);
        }
        console.log(playerArray);
        playerArray.sort((a, b) => b.score - a.score);

        $(".scoreboard-playerlist").empty();
        $(".scoreboard-scorelist").empty();

        $(".scoreboard-playerlist").append($("<div>Player</div>"));
        $(".scoreboard-scorelist").append($("<div>Score</div>"));
        for (let i = 0; i < 10; i++) {
            $(".scoreboard-playerlist").append(
                //$("<div class='row'><span class=\"user-avatar\"></span><div>" + playerArray[i].name + "</div></div>")
                $("<div>" + playerArray[i].name + "</div>")
            );
            //$("#scoreboard-playerlist .user-avatar").html(Avatar.getCode(playerArray[i].avatar));
            $(".scoreboard-scorelist").append(
                $("<div>" + playerArray[i].score + "</div>")
            );
        }
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
    const opponent_cv = $("canvas").get(1);
    const opponent_context = opponent_cv.getContext("2d", {
        willReadFrequently: true,
        alpha: true,
    });
    const player_cv = $("canvas").get(0);
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

    let player_gameArea = null;
    let opponent_gameArea = null;
    let opponent = null;

    const setOpponent = function (_opponent) {
        opponent = _opponent;
    };

    function initialize() {
        $("#countdown").hide();
        $("#gameover").hide();
        //$("#game-container").hide();
    }

    const initGame = function (_mode) {
        $("#homepage").hide();
        MatchPage.hideAll();
        $("#countdown").show();
        $("#join-private-game-page").hide();

        player_gameArea = GameArea(player_cv, player_context, true);
        opponent_gameArea = GameArea(opponent_cv, opponent_context, false);

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

    const setGameOver = () => {
        isGameOver = true;
        Socket.setGameOver(true);
    };
    const getGameOver = () => isGameOver;

    const gameOver = function (playerLost = false) {
        if (!playerLost) {
            player_gameArea.gameOver(false, playerLost);
            opponent_gameArea.gameOver(false, !playerLost);
        }
        // Show game statistics
        const playerStats = player_gameArea.getStats();
        const opponentStats = opponent_gameArea.getStats();
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
        console.log("GameOver.game over", { playerLost }, { gameOverData });

        Game.hide();

        // Reset all values
        // isGameOver = false;
        opponent = null;
        mode = 0;
        player_gameArea = null;
        opponent_gameArea = null;

        player_context.reset();
        opponent_context.reset();

        GameOver.show();
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
        setOpponent,
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
        for (const component of components) {
            component.initialize();
        }
    };

    const renderSidePanel = function (status) {
        HomePage.renderSidePanel(status);
    };

    return {
        getUserDisplay,
        initialize,
        renderSidePanel,
    };
})();
