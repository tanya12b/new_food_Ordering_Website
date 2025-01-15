
const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');
    });
}

if (close) {
    close.addEventListener('click', () => {
        nav.classList.remove('active');
    });
}

// Fetch and Display Blog Posts
document.addEventListener("DOMContentLoaded", function() {
    const blogContainer = document.getElementById("blog");

    fetch("http://localhost:8008/blogs")
        .then(response => response.json())
        .then(blogs => {
            blogContainer.innerHTML = blogs.map((blog) => `
                <div class="blog-box" id="blog-${blog.id}">
                    <div class="blog-img">
                        <img src="${blog.imageUrl || 'image/default.png'}" alt="Blog Image">
                    </div>
                    <div class="blog-details">
                        <h4>${blog.title} by ${blog.chef}</h4>
                        <p>${blog.content}</p>
                        <div class="blog-actions">
                            <button id="like-${blog.id}" class="action-btn like-btn" onclick="toggleLike(${blog.id})">
                                <i class="fas fa-heart"></i> Like
                            </button>
                            <button id="share-${blog.id}" class="action-btn" onclick="shareBlog(${blog.id})">
                                <i class="fas fa-share-alt"></i> Share
                            </button>
                            <button id="comment-${blog.id}" class="action-btn" onclick="commentBlog(${blog.id})">
                                <i class="fas fa-comment-dots"></i> Comment
                            </button>
                            <button id="save-${blog.id}" class="action-btn" onclick="saveBlog(${blog.id})">
                                <i class="fas fa-bookmark"></i> Save
                            </button>
                        </div>
                        <div id="comments-${blog.id}" class="comments-section">
                            <!-- Comments will be injected here -->
                        </div>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error("Error fetching blogs:", error);
            blogContainer.innerHTML = "<p>Failed to load blog posts.</p>";
        });
});

// Like/Unlike Functionality
const toggleLike = (id) => {
    const likeButton = document.getElementById(`like-${id}`);
    const isLiked = likeButton.classList.toggle('liked'); // Toggle the 'liked' class

    if (isLiked) {
        likeButton.innerHTML = '<i class="fas fa-heart"></i> Liked'; // Change button text when liked
        alert(`Blog liked!`); // Alert message when liked
        // Save to likes.json
        fetch(`http://localhost:8008/blogs/${id}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
    } else {
        likeButton.innerHTML = '<i class="fas fa-heart"></i> Like'; // Change button text when unliked
        alert(`Blog unliked!`); // Alert message when unliked
        // Send request to unlike the blog
        fetch(`http://localhost:8008/blogs/${id}/unlike`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
    }
};


// Comment Functionality
const commentBlog = (id) => {
    const comment = prompt("Enter your comment:");
    const user = "user"; // Replace with actual user information if available

    if (comment) {
        fetch(`http://localhost:8008/blogs/${id}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, comment })
        })
            .then(response => response.json())
            .then(data => {
                const commentsSection = document.getElementById(`comments-${id}`);
                commentsSection.innerHTML += `<p><strong>${user}:</strong> ${comment}</p>`;
            })
            .catch(error => console.error('Error adding comment:', error));
    }
};

// Share Functionality
const shareBlog = (id) => {
    const shareModal = document.getElementById("share-modal");
    const shareLinkElement = document.getElementById("share-link");

    // Assuming you have a way to construct the blog URL
    const shareUrl = `http://localhost:8008/blogs/${id}`; // Update to the correct blog URL
    shareLinkElement.textContent = shareUrl; // Set the share link text
    shareModal.style.display = "flex"; // Show the share modal
};

// Copy the link to the clipboard
function copyLink() {
    const shareLink = document.getElementById("share-link").textContent;
    navigator.clipboard.writeText(shareLink).then(() => {
        alert("Blog link copied to clipboard!");
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}


// Share on different platforms
function shareOnWhatsApp() {
    const link = document.getElementById("share-link").textContent;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(link)}`, '_blank');
}

function shareOnFacebook() {
    const link = document.getElementById("share-link").textContent;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`, '_blank');
}

function shareOnTwitter() {
    const link = document.getElementById("share-link").textContent;
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(link)}`, '_blank');
}

function shareOnGmail() {
    const link = document.getElementById("share-link").textContent;
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=&su=Check out this blog!&body=${encodeURIComponent(link)}`, '_blank');
}

function shareOnInstagram() {
    alert("Instagram sharing is not directly supported. Please copy the link to share it.");
}

// Close the share modal
function closeShareModal() {
    const shareModal = document.getElementById("share-modal");
    shareModal.style.display = "none"; // Hide the share modal
}

const saveBlog = (id) => {
    const saveButton = document.getElementById(`save-${id}`);
    const isSaved = saveButton.classList.toggle('saved'); // Toggle the 'saved' class

    if (isSaved) {
        saveButton.innerHTML = '<i class="fas fa-bookmark"></i> Saved'; // Update button text to 'Saved'
        alert(`Blog saved!`); // Show alert for saving
        // Save to likes.json
        fetch(`http://localhost:8008/blogs/${id}/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
    } else {
        saveButton.innerHTML = '<i class="fas fa-bookmark"></i> Save'; // Update button text to 'Save'
        alert(`Blog unsaved!`); // Show alert for unsaving
        // Send request to unsave the blog
        fetch(`http://localhost:8008/blogs/${id}/unsave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
