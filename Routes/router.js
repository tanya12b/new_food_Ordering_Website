const express = require('express');
const router = express.Router();
const reviewController = require('../Controllers/controller');

// Route to add a new review
router.post('/add', reviewController.addReview);

// Route to get all reviews
router.get('/', (req, res) => {
    try {
        const reviews = reviewController.getReviews();
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error in GET /api/reviews route:', error);
        res.status(500).json({ message: 'Error fetching reviews' });
    }
});

// Route to fetch product-specific data for autofill
router.get('/product/:productId', reviewController.getProductData);

module.exports = router;
