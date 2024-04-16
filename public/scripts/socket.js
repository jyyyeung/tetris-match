/**
 * Socket module for handling socket communication with the server.
 * @module Socket
 */
const Socket = (function () {
    // This stores the current Socket.IO socket
    let socket = null;

    /**
     * Gets the socket from the module
     * @returns {Socket} The socket object.
     */
    const getSocket = function () {
        return socket;
    };

    //
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
            socket.emit("get messages");
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

    return { getSocket, connect, disconnect, postMessage };
})();
