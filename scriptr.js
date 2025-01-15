document.addEventListener('DOMContentLoaded', () => {
    const stars = document.querySelectorAll('#stars i');
    let rating = 0;

    // Handle star rating selection
    stars.forEach(star => {
        star.addEventListener('click', () => {
            rating = parseInt(star.getAttribute('data-index'));
            updateStars(stars, rating); // Update star icons
            document.getElementById('rating').value = rating; // Store the rating in hidden input
        });
    });

    // Update star icons
    function updateStars(stars, rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('far');
                star.classList.add('fas');
            } else {
                star.classList.remove('fas');
                star.classList.add('far');
            }
        });
    }

    // Form submission
    const reviewForm = document.getElementById('reviewForm');
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const review = document.getElementById('review').value;

        if (rating === 0) {
            alert('Please select a rating!');
            return;
        }

        // Submit the review to the backend
        fetch('http://localhost:8008/api/reviews/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                review,
                rating
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Review submitted:', data);
            fetchReviews(); // Reload reviews after submission
            reviewForm.reset(); // Reset form
            updateStars(stars, 0); // Reset stars
        })
        .catch(error => console.error('Error submitting review:', error));
    });

    // Fetch and display reviews
    function fetchReviews() {
        fetch('http://localhost:8008/api/reviews')
            .then(response => response.json())
            .then(reviews => {
                const reviewsContainer = document.getElementById('reviewsContainer');
                reviewsContainer.innerHTML = reviews.map(review => {
                    const stars = generateStars(review.rating); // Generate stars for each review
                    return `
                        <div class="review">
                            <h3>${review.username}</h3>
                            <p>${stars}</p> <!-- Display stars here -->
                            <p>${review.review}</p>
                        </div>
                    `;
                }).join('');
            })
            .catch(error => console.error('Error fetching reviews:', error));
    }

    // Function to generate star rating for displaying reviews
    function generateStars(rating) {
        let stars = '';
        for (let i = 0; i < 5; i++) {
            if (i < rating) {
                stars += `<i class="fas fa-star" style="color: gold;"></i>`;  // Filled star
            } else {
                stars += `<i class="far fa-star" style="color: black;"></i>`;  // Empty star
            }
        }
        return stars;
    }

    fetchReviews(); // Load reviews initially
});
