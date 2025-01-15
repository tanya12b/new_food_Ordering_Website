// Register Form Submission
document.getElementById('registerForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch('http://localhost:8008/registerUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        alert(data.msg);

        if (response.ok) {
            // Redirect to login page
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error("Error during registration:", error);
        alert("An error occurred during registration. Please try again.");
    }
});

// Login Form Submission
document.getElementById('loginForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('http://localhost:8008/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        alert(data.msg);

        if (response.ok) {
            localStorage.setItem('token', data.token);
            document.getElementById('loginForm').reset();
            // Redirect to homepage
            window.location.href = 'homepage.html'; // Adjust the page as needed
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred during login. Please try again.");
    }
});

// Logout Functionality
async function logout() {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            alert("You are not logged in.");
            return;
        }

        const response = await fetch('http://localhost:8008/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            localStorage.removeItem('token'); // Clear token
            sessionStorage.clear(); // Clear session data
            // Redirect to login page
            window.location.href = 'login.html';
        } else {
            const data = await response.json();
            alert(data.msg || 'Logout failed. Please try again.');
        }
    } catch (error) {
        console.error("Error during logout:", error);
        alert("An error occurred while logging out.");
    }
}
