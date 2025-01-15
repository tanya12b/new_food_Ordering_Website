document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');
    const messageDiv = document.getElementById('message');
    const cancelEventDropdown = document.getElementById('cancelEvent');

    // Fetch events from the backend and populate the dropdowns
    fetch('/events')
        .then(response => response.json())
        .then(data => {
            const eventSelect = document.getElementById('event');
            data.forEach(event => {
                const option = document.createElement('option');
                option.value = event.name; // Store the name in value
                option.textContent = event.name; // Display the name
                eventSelect.appendChild(option);

                // Populate cancellation dropdown
                const cancelOption = document.createElement('option');
                cancelOption.value = event.name; // Store the name in value
                cancelOption.textContent = event.name; // Display the name
                cancelEventDropdown.appendChild(cancelOption);
            });
        })
        .catch(error => {
            console.error('Error fetching events:', error);
        });

    // Register event
    registrationForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const event = document.getElementById('event').value;

        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, event })
        })
        .then(response => response.json())
        .then(data => {
            messageDiv.textContent = data.message;
            registrationForm.reset(); // Clear the form
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    // Cancel registration
    document.getElementById('cancelBtn').addEventListener('click', () => {
        const eventToCancel = cancelEventDropdown.value;

        fetch('/cancel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ event: eventToCancel })
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('cancelMessage').textContent = data.message;
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
