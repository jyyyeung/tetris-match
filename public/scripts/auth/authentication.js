const Authentication = (function () {
    /**
     * Represents the current signed-in user.
     * @type {Object|null}
     */
    let user = null;

    /**
     * Retrieves the current user.
     * @returns {Object} The current user.
     */
    const getUser = function () {
        return user;
    };

    /**
     * Sign in a user with the provided username and password.
     *
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @param {function} onSuccess - The callback function to be executed on successful sign in.
     * @param {function} onError - The callback function to be executed on sign in error in this form `onError(error)`.
     */
    const signin = function (username, password, onSuccess, onError) {
        // Preparing the user data
        const user_data = { username, password };

        // Sending the AJAX request to the server
        fetch("/signin", {
            method: "POST",
            body: JSON.stringify(user_data),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((json) => {
                // H. Handling the success response from the server
                if (json.status == "success") {
                    user = json.user;
                    console.log(user);
                    onSuccess();
                } else if (onError) onError(json.error);
            })
            // Processing any error returned by the server
            .catch((err) => console.log("Error!", err));
    };

    /**
     * Validates the user's authentication status by sending an AJAX request to the server.
     *
     * @param {Function} onSuccess - The callback function to be executed when the authentication is successful.
     * @param {Function} onError - The callback function to be executed when an error occurs during authentication in this form `onError(error)`.
     */
    const validate = function (onSuccess, onError) {
        // Sending the AJAX request to the server
        fetch("/validate", {
            method: "GET",
        })
            .then((res) => res.json())
            .then((json) => {
                // Handling the success response from the server
                if (json.status == "success") {
                    user = json.user;
                    console.log(user);
                    onSuccess();
                } else if (onError) onError(json.error);
            })
            // Processing any error returned by the server
            .catch((err) => console.log("Error!", err));
    };

    /**
     * Signs out the user by making a GET request to "/signout" endpoint.
     * @param {Function} onSuccess - The callback function to be executed on successful signout in this form `onSuccess()`.
     * @param {Function} [onError] - The callback function to be executed if an error occurs during signout in this form `onError(error)`.
     */
    const signout = function (onSuccess, onError) {
        fetch("/signout", { method: "GET" })
            .then((res) => res.json())
            .then((json) => {
                if (json.status == "success") {
                    user = null;
                    onSuccess();
                } else if (onError) onError(json.error);
            })
            .catch((err) => console.log("Error!", err));
    };

    return { getUser, signin, validate, signout };
})();
