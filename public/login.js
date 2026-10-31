
// Handle the login form submission
document
    .getElementById('loginForm')
    .addEventListener('submit', async (event) => {

        event.preventDefault();

        const username =
            document.getElementById('username').value;

        const password =
            document.getElementById('password').value;

        const message =
            document.getElementById('loginMessage');

        message.textContent = 'Logging in...';

        try {
            // Send login credentials to the server
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const result = await response.json();

            // Handle unsuccessful login
            if (!response.ok) {
                message.textContent =
                    result.error || 'Login failed.';
                return;
            }

            // Redirect after successful login
            window.location.href = '/';

        } catch (error) {
            message.textContent =
                'Unable to connect to the server.';
        }
    });
