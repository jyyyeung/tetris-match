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

    /**
     * Gets the socket from the module
     * @returns {Socket} The socket object.
     */
    const getSocket = function () {
        return socket;
    };

    let gameInProgress = false;

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

        // Set up the users event
        socket.on("users", (onlineUsers) => {
            onlineUsers = JSON.parse(onlineUsers);

            // Show the online users
            OnlineUsersPanel.update(onlineUsers);
        });

        // Set up the add user event
        socket.on("add user", (user) => {
            user = JSON.parse(user);

            // Add the online user
            OnlineUsersPanel.addUser(user);
        });

        // Set up the remove user event
        socket.on("remove user", (user) => {
            user = JSON.parse(user);

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

        socket.on("on your marks", () => {
            if (gameInProgress) return;

            console.log("on your marks");
            // Start the game
            opponentGameArea = Game.initGame();
        });

        socket.on("init game", (firstTetromino, tetrominos) => {
            if (gameInProgress) return;
            // console.log("init game", firstTetromino, tetrominos);
            opponentGameArea.initGame(firstTetromino, tetrominos);
        });

        socket.on("room created", (_room) => {
            console.log("room created", _room);
            room = _room;
            Match.roomCreated(_room);
        });

        socket.on("room full", () => {
            // TODO: Room Full
            console.log("room full");
            Match.roomFull();
        });

        socket.on("room not found", () => {
            Match.roomNotFound();
        });

        socket.on("waiting for opponent", () => {
            Match.waitingForOpponent();
        });

        socket.on("scoreboard", (scoreboard) => {
            console.log("receive players");
            Scoreboard.update(scoreboard);
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
            socket.emit("set game stats", stats);
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

    const joinRoom = function (_room = null) {
        if (room != null) return false;
        console.log("request to join room");
        socket.emit("join room", _room);
        room = _room;
        return true;
    };

    const publicMatch = function () {
        console.log("public match")
        if (room != null) return false;
        socket.emit("public match");
    };

    const leaveRoom = function (_room) {
        if (_room == null) _room = room;
        if (socket && socket.connected) {
            socket.emit("leave room", _room);
            room = null;
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
    }

    const setScoreBoard = function () {
        if (socket && socket.connected) {
            socket.emit("get scoreboard");
        }
        else {
            console.log("not scoreboard")
        }
    }

    return {
        getSocket,
        connect,
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
        setScoreBoard
    };


})();