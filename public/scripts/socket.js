/**
 * Socket module for handling socket communication with the server.
 * @module Socket
 */
const Socket = (function () {
    // This stores the current Socket.IO socket
    let socket = null;
    let opponentGameArea = null;
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
            opponentGameArea.gameOver();
            gameInProgress = false;
        });

        socket.on("update score", (score) => {
            // console.log("Opponent Score: ", score);
            opponentGameArea.setScore(score);
        });

        socket.on("on your marks", () => {
            if (gameInProgress) return;
            console.log("on your marks");
            // Start the game
            opponentGameArea = Game.initialize();
        });

        socket.on("init game", (firstTetromino, tetrominos) => {
            if (gameInProgress) return;
            console.log("init game", firstTetromino, tetrominos);
            opponentGameArea.initGame(
                // gameStartTime,
                firstTetromino,
                tetrominos
            );
        });
    };

    /**
     * Disconnects the socket from the server
     */
    const disconnect = function () {
        socket.disconnect();
        socket = null;
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

    const joinRoom = function (_room) {
        // if (socket && socket.connected) {
        console.log("request to join room");
        socket.emit("join room", _room);
        room = _room;
        // }
    };

    const leaveRoom = function (_room) {
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

    // const holdTetromino = function (tetromino) {
    //     if (socket && socket.connected) {
    //         socket.emit("hold tetromino", tetromino);
    //     }
    // };

    const gameOver = function () {
        if (socket && socket.connected) {
            socket.emit("game over");
        }
    };

    const updateScore = function (score) {
        console.log("update score", score);
        if (socket && socket.connected) {
            socket.emit("update score", score);
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
            console.log("My game area", currentTetromino, tetrominos);
            socket.emit(
                "init game",
                // gameStartTime,
                currentTetromino,
                tetrominos
            );
        }
    };

    const readyToStart = function () {
        if (socket && socket.connected) {
            socket.emit("ready to start");
        }
    };

    return {
        getSocket,
        connect,
        disconnect,
        postMessage,
        joinRoom,
        leaveRoom,
        gameOver,
        updateScore,
        keyDown,
        keyUp,
        initGame,
        readyToStart,
        pushNextTetromino,
    };
})();
