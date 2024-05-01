/**
 * Socket module for handling socket communication with the server.
 * @module Socket
 */
const Socket = (function () {
    // This stores the current Socket.IO socket
    let socket = null;
    /**
     * Represents the opponent's game area.
     * @type {HTMLElement}
     */
    let opponentGameArea = null;

    /**
     * Represents the room the player is in.
     * @type {string}
     * @default null
     */
    let room = null;
    let mode = 0;

    /**
     * Gets the socket from the module
     * @returns {Socket} The socket object.
     */
    const getSocket = function () {
        return socket;
    };

    let gameInProgress = false;

    let num_users_online = 0;

    /**
     * This function connects the server and initializes the socket
     */
    const connect = function () {
        socket = io();

        // Wait for the socket to connect successfully
        socket.on("connect", () => {
            // Get the online user list
            socket.emit("get users");
            socket.emit("get scoreboard");
            // Get the chatroom messages
            // socket.emit("get messages");
        });

        socket.on("user best score", (_bestScore) => {
            _bestScore = JSON.parse(_bestScore);
            console.log("best score", _bestScore);

            UserPanel.updatePersonalBestScore(1, _bestScore["1"]);
            UserPanel.updatePersonalBestScore(2, _bestScore["2"]);
        });

        // Set up the users event
        socket.on("users", (onlineUsers) => {
            onlineUsers = JSON.parse(onlineUsers);

            console.log(
                "online users",
                Object.keys(onlineUsers).length,
                onlineUsers
            );
            num_users_online = Object.keys(onlineUsers).length;

            UserPanel.updateNumberOfUsers(Object.keys(onlineUsers).length);

            // Show the online users
            OnlineUsersPanel.update(onlineUsers);
        });

        // Set up the add user event
        socket.on("add user", (user) => {
            user = JSON.parse(user);

            UserPanel.updateNumberOfUsers(++num_users_online);

            // Add the online user
            OnlineUsersPanel.addUser(user);
        });

        // Set up the remove user event
        socket.on("remove user", (user) => {
            user = JSON.parse(user);

            UserPanel.updateNumberOfUsers(--num_users_online);

            // Remove the online user
            OnlineUsersPanel.removeUser(user);
        });

        // Set up the messages event
        socket.on("messages", (chatroom) => {
            chatroom = JSON.parse(chatroom);

            // Show the chatroom messages
            ChatPanel.update(chatroom);
        });

        // Set up the add message event
        socket.on("add message", (message) => {
            message = JSON.parse(message);

            // Add the message to the chatroom
            ChatPanel.addMessage(message);
        });

        socket.on("start game", () => {
            // opponent = JSON.parse(opponent);
            Game.startGame();
            MatchPage.stopTimer();
            gameInProgress = true;

            console.log("start game");
        });

        socket.on("push next tetromino", (letter) => {
            opponentGameArea.pushNextTetromino(letter);
        });

        socket.on("key down", (key) => {
            opponentGameArea.translateAction(key, true);
        });

        socket.on("key up", (key) => {
            opponentGameArea.translateAction(key, false);
        });

        socket.on("game over", () => {
            // Game.gameOver();
            Game.gameOver();
            gameInProgress = false;
        });

        socket.on("set opponent", (opponent) => {
            console.log("set opponent", { opponent });
            opponent = JSON.parse(opponent);
            Game.setOpponent(opponent);
        });

        socket.on("on your marks", (_roomMode) => {
            if (gameInProgress) return;

            console.log("on your marks");
            // Finalize room mode for both players before game starts
            mode = _roomMode;
            // Start the game
            opponentGameArea = Game.initGame(mode);
        });

        socket.on("init game", (firstTetromino, tetrominos) => {
            if (gameInProgress) return;
            console.log("init game", firstTetromino, tetrominos);
            opponentGameArea.initGame(firstTetromino, tetrominos);
        });

        socket.on("room created", (_room, _mode) => {
            console.log("room created", _room, _mode);
            room = _room;
            mode = _mode;
            MatchPage.roomCreated(_room, _mode);
        });

        socket.on("joined room", (_room, _mode) => {
            console.log("joined room", _room, _mode);
            room = _room;
            mode = _mode;
            MatchPage.joinedRoom(_room, _mode);
        });

        socket.on("room full", () => {
            console.log("room full");
            MatchPage.roomFull();
        });

        socket.on("room not found", () => {
            MatchPage.roomNotFound();
        });

        socket.on("waiting for opponent", () => {
            MatchPage.waitingForOpponent();
        });

        socket.on("scoreboard", (scoreboard) => {
            console.log("receive players");
            Scoreboard.update(scoreboard);
        });

        socket.on("add cheat row", () => {
            Game.addCheatRow();
        });
    };

    /**
     * Disconnects the socket from the server
     */
    const disconnect = function () {
        socket.disconnect();
        socket = null;
    };

    const setGameStats = (stats) => {
        if (socket && socket.connected) {
            socket.emit("set game stats", stats, room, mode);
        }
    };

    /**
     * Sends a POST message event through the socket connection to the server.
     * @param {any} content - The content of the message to be sent.
     */
    const postMessage = function (content) {
        if (socket && socket.connected) {
            socket.emit("post message", content);
        }
    };

    const createRoom = function (_mode) {
        if (socket && socket.connected) {
            socket.emit("create room", _mode);
        }
    };

    const joinRoom = function (_room = null) {
        if (room != null) return false;
        console.log("request to join room: ", _room);
        socket.emit("join room", _room);
        // room = _room;
        return true;
    };

    const publicMatch = function (_mode) {
        console.log("public match", { room }, { _mode });
        if (room != null) return false;
        socket.emit("public match", _mode);
    };

    const leaveRoom = function (_room) {
        if (_room == null) _room = room;
        console.log("leave room", _room);
        if (socket && socket.connected) {
            socket.emit("leave room", _room);
            gameInProgress = false;
            room = null;
            mode = 0;
        }
    };

    const pushNextTetromino = function (letter) {
        if (socket && socket.connected) {
            socket.emit("push next tetromino", letter);
        }
    };

    const gameOver = function () {
        if (socket && socket.connected) {
            socket.emit("game over");
            gameInProgress = false;
        }
    };

    const keyDown = function (key) {
        if (socket && socket.connected) {
            socket.emit("key down", key);
        }
    };

    const keyUp = function (key) {
        if (socket && socket.connected) {
            socket.emit("key up", key);
        }
    };

    const initGame = function (currentTetromino, tetrominos) {
        if (socket && socket.connected) {
            if (gameInProgress) return;
            // console.log("My game area", currentTetromino, tetrominos);
            socket.emit("init game", currentTetromino, tetrominos);
        }
    };

    const readyToStart = function () {
        if (socket && socket.connected) {
            socket.emit("ready to start");
        }
    };

    const getCurrentRoom = function () {
        if (socket && socket.connected) {
            return room;
        }
    };

    const setScoreBoard = function () {
        if (socket && socket.connected) {
            socket.emit("get scoreboard");
        } else {
            console.log("not scoreboard");
        }
    };

    const setGameOver = function (isGameOver) {
        gameInProgress = !isGameOver;
        console.log("game over", { gameInProgress });
        return;
    };

    const addCheatRow = function () {
        if (socket && socket.connected) {
            socket.emit("add cheat row");
        }
    };

    return {
        getSocket,
        connect,
        setGameOver,
        disconnect,
        postMessage,
        joinRoom,
        leaveRoom,
        gameOver,
        keyDown,
        keyUp,
        initGame,
        readyToStart,
        pushNextTetromino,
        setGameStats,
        publicMatch,
        setScoreBoard,
        createRoom,
        addCheatRow,
    };
})();
