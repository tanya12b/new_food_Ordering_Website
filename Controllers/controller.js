const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'data', 'reviews.json');

// Simulated product database (replace with real database integration)
const productDatabase = {
    'p1': { name: 'Product 1', description: 'High-quality product 1' },
    'p2': { name: 'Product 2', description: 'Durable product 2' },
    'p3': { name: 'Product 3', description: 'Affordable product 3' },
};

// Ensure the reviews file exists
function ensureFileExists() {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '[]');
        }
    } catch (error) {
        console.error('Error ensuring file exists:', error);
    }
}

// Save reviews to the file
function saveReviews(reviews) {
    ensureFileExists();
    try {
        fs.writeFileSync(filePath, JSON.stringify(reviews, null, 2));
    } catch (error) {
        console.error('Error saving reviews:', error);
    }
}

// Retrieve all reviews from the file
function getReviews() {
    ensureFileExists();
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading reviews file:', error);
        return [];
    }
}

// Add a new review
function addReview(req, res) {
    const { productId, review, rating, username } = req.body;

    const newReview = {
        productId,
        review,
        rating: parseInt(rating),
        username,
        createdAt: new Date().toISOString(),
    };

    const reviews = getReviews();
    reviews.unshift(newReview);

    saveReviews(reviews);

    res.status(201).json({
        message: 'Review added successfully',
        review: newReview,
    });
}

// Fetch product-specific data for autofill
function getProductData(req, res) {
    const { productId } = req.params;

    const productData = productDatabase[productId];
    if (productData) {
        res.status(200).json({
            message: 'Product data fetched successfully',
            product: productData,
        });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
}

module.exports = {
    addReview,
    getReviews,
    getProductData,
};
