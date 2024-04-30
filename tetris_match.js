const express = require("express");

const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");
const { isEmpty, containWordCharsOnly } = require("./utils");

// Create the Express app
const app = express();

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

// Use the session middleware to maintain sessions
const gameSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 300000 },
});
app.use(gameSession);

// Handle the /register endpoint
app.post("/register", (req, res) => {
    // Get the JSON data from the body
    const { username, avatar, name, password } = req.body;
    console.log({ username, avatar, name, password });

    // Reading the users.json file

    const users = JSON.parse(fs.readFileSync("data/users.json"));
    console.log(users);

    // Checking for the user data correctness
    let isDataValid = false;
    const dataList = [username, avatar, name, password];
    const strings = ["username", "avatar", "name", "password"];
    let s = "";
    let isEmpty = false;
    for (let i = 0; i < dataList.length; ++i) {
        if (!dataList[i]) {
            isEmpty = true;
            s += strings[i] + ", ";
        }
    }
    s = s.slice(0, s.length - 2);

    let emptyErrorMsg = `${s} cannot be empty!`;
    emptyErrorMsg =
        emptyErrorMsg.charAt(0).toUpperCase() + emptyErrorMsg.slice(1);

    if (isEmpty) {
        res.json({ status: "error", error: emptyErrorMsg });
        return;
    }

    if (!containWordCharsOnly(username))
        errorMsg = "username should only contain Word Characters Only. ";
    else if (username in users)
        errorMsg = "Invalid username, a user already exist with this username";
    else isDataValid = true;

    if (!isDataValid) {
        res.json({ status: "error", error: errorMsg });
        return;
    }

    // Adding the new user account
    const hash = bcrypt.hashSync(password, 10);
    users[username] = {
        avatar: avatar,
        name: name,
        password: hash,
    };

    // Saving the users.json file
    fs.writeFileSync("data/users.json", JSON.stringify(users, null, " "));

    // Sending a success response to the browser
    res.json({ status: "success" });
});

// Handle the /signin endpoint
app.post("/signin", (req, res) => {
    // Get the JSON data from the body
    const { username, password } = req.body;

    // Reading the users.json file
    const users = JSON.parse(fs.readFileSync("data/users.json"));

    // Checking for username/password
    let isDataValid = false;
    if (!username) errorMsg = "Username cannot be empty";
    else if (!password) errorMsg = "Password cannot be empty";
    else if (!(username in users)) errorMsg = "Invalid Credentials";
    else if (!bcrypt.compareSync(password, users[username].password))
        errorMsg = "Invalid Credentials";
    else isDataValid = true;

    if (!isDataValid) {
        res.json({ status: "error", error: errorMsg });
        return;
    }

    const user = users[username];

    const user_data = {
        username,
        avatar: user.avatar,
        name: user.name,
    };
    req.session.user = user_data;

    // Sending a success response with the user account
    res.json({
        status: "success",
        user: user_data,
    });
});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {
    // Getting req.session.user
    const user = req.session.user;
    if (!user) {
        res.json({ status: "error", error: "Session user not defined. " });
        return;
    }

    // Sending a success response with the user account
    res.json({
        status: "success",
        user,
    });
});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {
    // Deleting req.session.user
    req.session.user = null;

    // Sending a success response
    res.json({ status: "success" });
});

const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer(app);
const io = new Server(httpServer);
const onlineUsers = {};

io.use((socket, next) => {
    gameSession(socket.request, {}, next);
});

const randomId = () => Math.floor(100000 + Math.random() * 900000);

const roomReady = {};
// const publicMatch = [];
const publicMatchTimeMode = [];
const publicMatchSurvivalMode = [];
const TIME_MODE = 1;
const SURVIVAL_MODE = 2;
const roomMode = {};
const gameUID = {};
const roomPlayers = {};
// Use a web server to listen at port 8000
httpServer.listen(8000, () => {
    console.log("Tetris Match server has started...");
    io.on("connection", (socket) => {
        // Add a new user to the online user list
        const user = socket.request.session.user;

        if (user) {
            // User signed in
            onlineUsers[user.username] = user;
            // Broadcast to Browsers: Add a signed-in user to the online user list
            io.emit("add user", JSON.stringify(user));

            // When browser wants to Get the chatroom messages
            socket.on("get messages", () => {
                // Send the chatroom messages to the browser
                const chatroom = fs.readFileSync("data/chatroom.json", "utf-8");

                io.emit("messages", chatroom);
            });

            // Browser to Server: When user post a new message in the chatroom
            socket.on("post message", (content) => {
                const message = {
                    user,
                    datetime: new Date(),
                    content,
                };
                // Add the message to the chatroom JSON file
                const chatroom = JSON.parse(
                    fs.readFileSync("data/chatroom.json")
                );
                chatroom.push(message);
                fs.writeFileSync(
                    "data/chatroom.json",
                    JSON.stringify(chatroom, null, " ")
                );

                // Broadcast the new message to everyone
                io.emit("add message", JSON.stringify(message));
            });

            // Browser to Server: when a user start typing
            socket.on("show typing", () => {
                // Broadcast the typing status to everyone
                io.emit("show typing", JSON.stringify(user));
            });

            // When user Signs out
            socket.on("disconnect", () => {
                // Remove the user from the online user list
                delete onlineUsers[user.username];

                // Broadcast to Browsers: Remove a disconnected user from the online user list
                io.emit("remove user", JSON.stringify(user));
            });

            let room = null;

            /**
             * Creates a new room for the Tetris match.
             *
             * @param {string} _mode - The mode of the Tetris match.
             * @returns {string} The ID of the created room.
             */
            const createRoom = (_mode) => {
                // Create room
                const _room = randomId();
                // Check if Room already Exist
                while (io.sockets.adapter.rooms.has(_room)) {
                    _room = randomId();
                }
                io.to(socket.id).emit("room created", _room, _mode);

                if (!roomMode[_room]) roomMode[_room] = _mode;
                socket.join(_room);
                roomPlayers[_room] = user.username;
                console.log("Joined room: ", _room);
                room = _room;
                return _room;
            };

            /**
             * Joins a room and performs necessary checks before joining.
             * @param {number} _room - The room number to join.
             */
            const joinRoom = (_room) => {
                _room = parseInt(_room);
                const thisRoom = io.sockets.adapter.rooms.get(_room);
                if (_room == null || !thisRoom) {
                    io.to(socket.id).emit("room not found");
                    return;
                }
                if (thisRoom.size > 2) {
                    io.to(socket.id).emit("room full");
                    return;
                }

                console.log("Joining room: ", _room);
                console.log("Room players: ", roomPlayers[_room]);
                console.log(onlineUsers);
                io.to(_room).emit("set opponent", JSON.stringify(user));
                socket.join(_room);
                socket.join("joined room", _room, roomMode[_room]);
                room = _room;

                if (thisRoom.size === 2) {
                    roomReady[room] = 0;

                    console.log("two people");
                    opponent = roomPlayers[room];
                    // console.log(
                    //     "Opponent: ",
                    //     opponent,
                    //     onlineUsers[opponent],
                    //     JSON.stringify(onlineUsers[opponent])
                    // );
                    io.to(socket.id).emit(
                        "set opponent",
                        JSON.stringify(onlineUsers[opponent])
                    );

                    io.to(room).emit("on your marks", roomMode[_room]);

                    gameUID[room] = room + "-" + Date.now();
                    delete roomPlayers[_room];
                }
            };

            socket.on("public match", (_mode) => {
                if (
                    _mode === SURVIVAL_MODE &&
                    publicMatchSurvivalMode.length === 0
                ) {
                    const roomId = createRoom(SURVIVAL_MODE);

                    publicMatchSurvivalMode.push(roomId);
                    io.to(socket.id).emit("waiting for opponent");
                    return;
                }
                if (_mode === TIME_MODE && publicMatchTimeMode.length === 0) {
                    const roomId = createRoom(TIME_MODE);
                    // publicMatch.push(socket.id);
                    publicMatchTimeMode.push(roomId);

                    io.to(socket.id).emit("waiting for opponent");
                    return;
                }

                if (_mode === TIME_MODE) room = publicMatchTimeMode.shift();
                else if (_mode === SURVIVAL_MODE)
                    room = publicMatchSurvivalMode.shift();
                joinRoom(room);
            });

            socket.on("leave room", () => {
                if (room == null) return;
                socket.leave(room);
                console.log("Leaving room: ", room);
                room = null;
            });

            socket.on("create room", (_mode) => {
                createRoom(_mode);
            });

            socket.on("join room", (_room) => {
                if (_room == null) createRoom();
                // Join the room
                else joinRoom(_room);
            });

            // let room_ready = 0;

            socket.on("ready to start", () => {
                roomReady[room]++;
                if (roomReady[room] === 2) {
                    io.to(room).emit("start game");
                }
            });
            socket.on("init game", (firstTetromino, tetrominos) => {
                // Broadcast the game start time to everyone
                socket.broadcast
                    .to(room)
                    .emit("init game", firstTetromino, tetrominos);
            });

            socket.on("push next tetromino", (letter) => {
                // Broadcast the next tetromino to everyone
                socket.broadcast.to(room).emit("push next tetromino", letter);
            });

            socket.on("update score", (score) => {
                // Update the user's score
                // user.score = score;

                console.log("Sending update score to everyone");
                // Broadcast the updated score to everyone
                socket.broadcast.to(room).emit("update score", score);
            });

            socket.on("key down", (key) => {
                // Broadcast the key down event to everyone
                socket.broadcast.to(room).emit("key down", key);
            });

            socket.on("key up", (key) => {
                // Broadcast the key up event to everyone
                socket.broadcast.to(room).emit("key up", key);
            });

            socket.on("game over", () => {
                // Broadcast the game over event to everyone
                socket.broadcast.to(room).emit("game over");
            });

            socket.on("get users", () => {
                // Send the online users to the browser
                io.emit("users", JSON.stringify(onlineUsers));
            });

            socket.on("get scoreboard", () => {
                const scoreboard = JSON.parse(
                    fs.readFileSync("data/scoreboard.json", "utf-8")
                );
                io.emit("scoreboard", JSON.stringify(scoreboard));
            });

            socket.on("set game stats", (_stats) => {
                const games = JSON.parse(
                    fs.readFileSync("data/games.json", "utf-8")
                );
                if (!games[gameUID[room]])
                    games[gameUID[room]] = {
                        player1: {
                            username: user.username,
                            ...onlineUsers[user.username],
                            stats: _stats,
                        },
                        // player2: {},
                        mode: roomMode[room],
                        datetime: new Date(),
                    };
                else {
                    games[gameUID[room]].player2 = {
                        username: user.username,
                        ...onlineUsers[user.username],
                        stats: _stats,
                    };
                }

                // socket.to(room).emit("opponent stats", _stats);

                fs.writeFileSync(
                    "data/games.json",
                    JSON.stringify(games, null, " ")
                );

                // const scoreboard = JSON.parse(
                //     fs.readFileSync("data/scoreboard.json")
                // );
                // if (_stats.username in scoreboard) {
                //     scoreboard[_stats.username].wins += _stats.wins;
                //     scoreboard[_stats.username].losses += _stats.losses;
                // } else {
                //     scoreboard[_stats.username] = {
                //         wins: _stats.wins,
                //         losses: _stats.losses,
                //     };
                // }
                // fs.writeFileSync(
                //     "data/scoreboard.json",
                //     JSON.stringify(scoreboard, null, " ")
                // );
            });
        }
    });
});
