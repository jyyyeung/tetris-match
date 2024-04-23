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

function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

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
    const dataList = [username,avatar,name,password];
    const strings = ["username","avatar","name","password"];
    let s = "";
    let isEmpty = false;
    for (let i = 0; i < dataList.length; ++i) {
        if (!dataList[i]) {
            isEmpty = true;
            s += strings[i] + ", ";
        }
    }
    s = s.slice(0, s.length-2);

    let emptyErrorMsg = `${s} cannot be empty!`
    emptyErrorMsg = emptyErrorMsg.charAt(0).toUpperCase() + emptyErrorMsg.slice(1)

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
    if (!(username)) errorMsg = "Username cannot be empty";
    else if (!(password)) errorMsg = "Password cannot be empty";
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
        }

        socket.on("get users", () => {
            // Send the online users to the browser
            io.emit("users", JSON.stringify(onlineUsers));
        });
    });
});
