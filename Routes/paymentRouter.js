const express = require('express');
const paymentRouter = express.Router();  // Fixed to use Router()
const paymentController = require('../Controllers/paymentController');

// Render product page
paymentRouter.get('/', paymentController.renderProductPage);

// Create Razorpay order
paymentRouter.post('/createOrder', paymentController.createOrder);

// Handle payment success
paymentRouter.post('/payment-success', paymentController.paymentSuccess);

// Handle payment failure
paymentRouter.post('/payment-failure', paymentController.paymentFailure);

module.exports = paymentRouter;
