const express = require('express');
const router = express.Router();
const chatbotController = require('../Controllers/chatbotController');

// Chatbot route
router.post('/chat', chatbotController.handleChat);

module.exports = router;