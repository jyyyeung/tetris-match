const Registration = (function () {
    /**
     * Sends a register request to the server.
     *
     * @param {string} username - The username for the sign-in.
     * @param {string} avatar - The avatar of the user.
     * @param {string} name - The name of the user.
     * @param {string} password - The password of the user.
     * @param {Function} onSuccess - Callback function to be called when the request in the form `onSuccess()` is successful.
     * @param {Function} onError - Callback function to be called when the request fails in this form `onError(error).
     */
    const register = function (
        username,
        avatar,
        name,
        password,
        onSuccess,
        onError
    ) {
        // Preparing the user data
        const user_data = { username, avatar, name, password };

        // Sending the AJAX request to the server
        // Send POST request using fetch()
        fetch("/register", {
            // The request is a POST request
            method: "POST",
            // The request body is the JSON data that you have prepared
            body: JSON.stringify(user_data),
            // The headers are correctly set (using application/json), and
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((json) => {
                // console.log(json);
                // J. Handling the success response from the server
                if (json.status == "success") onSuccess();
                // F. Processing any error returned by the server
                else if (onError) onError(json.error);
            })
            .catch((err) => console.log("Error!", err));
    };

    return { register };
})();
