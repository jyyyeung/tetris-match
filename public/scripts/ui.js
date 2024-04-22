const HOME_LOGIN = 0;
const HOME_REGISTER = 1;
const HOME_HOWTOPLAY = 2;
const HOME_PROFILE = 3;

const HomePage = (function () {
    let sidePanelStatus = -1;

    const hideSidePanel = function () {
        sidePanelStatus = HOME_HIDDEN;
        $("#home-panel").css("width", "100vw");
        $("#home-side-panel").css("width", "0vw");
        $("#home-side-panel").hide();
        $("#title").css("font-size", "500%");
    }

    const renderSidePanel = function(status) { // 0 - login, 1 - register, 2 - how to play, 3 - profile
        $("#home-panel").css("width", "50vw");
        $("#home-side-panel").css("width", "50vw");
        $("#home-side-panel").show();
        $("#title").css("font-size", "400%");
        const contents = [$("#signin-form"), $("#register-form"), $("#how-to-play"), $("#user-panel")]
        contents.forEach((element)=> element.hide());
        contents[status].show();
        sidePanelStatus = status;
    }

    const buttonFunc = function (status) {
        if (sidePanelStatus != status) { renderSidePanel(status); }
        else { hideSidePanel(); }
    }

    const initialize = function () {
        $(".before-login").show();
        $(".after-login").hide();
        $("#home-side-panel").hide();

        $("#register-button").click(function () { buttonFunc(HOME_REGISTER) });
        $("#login-button").click(function () { buttonFunc(HOME_LOGIN) });
        $("#howtoplay-button").click(function () {
            if (sidePanelStatus != HOME_HOWTOPLAY) { renderSidePanel(HOME_HOWTOPLAY); }
            else if (!Authentication.getUser()) { hideSidePanel(); }
        });
        $("#profile-button").click(function () { buttonFunc(HOME_PROFILE) });
    }
    return { initialize, renderSidePanel};
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
                    console.log("signed in")
                    UserPanel.update(Authentication.getUser());
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

    return { initialize, show, hide };
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
                hide();
                SignInForm.show();
                HomePage.initialize();
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

    return { initialize, show, hide, update };
})();

const OnlineUsersPanel = (function () {
    // This function initializes the UI
    const initialize = function () { };

    // This function updates the online users panel
    const update = function (onlineUsers) {
        const onlineUsersArea = $("#online-users-area");

        // Clear the online users area
        onlineUsersArea.empty();

        // Get the current user
        const currentUser = Authentication.getUser();

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

    return { initialize, update, addUser, removeUser };
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
        const datetime = new Date(message.datetime);
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
        chatArea.scrollTop(chatArea[0].scrollHeight);
    };

    return { initialize, update, addMessage };
})();

const GameArea = (function() {
    const initialize = function() {
        //$("#game-container").hide();
    }
    return {initialize};
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
    const components = [HomePage, SignInForm, UserPanel, OnlineUsersPanel, ChatPanel, GameArea];

    // This function initializes the UI
    const initialize = function () {
        // Initialize the components
        for (const component of components) {
            component.initialize();
        }
    };

    const renderSidePanel = function (status) {
        HomePage.renderSidePanel(status);
    }

    return { getUserDisplay, initialize, renderSidePanel};
})();
