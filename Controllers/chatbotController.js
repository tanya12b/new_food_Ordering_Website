const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '..', 'data', 'chatbotData.json');

// Load chatbot data
function loadChatbotData() {
    try {
        const data = fs.readFileSync(dataPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading chatbot data:', error);
        return [];
    }
}

// Handle user query
function handleChat(req, res) {
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ message: "Query is required" });
    }

    const chatbotData = loadChatbotData();

    // Find related questions based on keywords
    const relatedQuestions = chatbotData.filter(item => 
        item.keywords.some(keyword => query.toLowerCase().includes(keyword))
    );

    if (relatedQuestions.length > 0) {
        res.status(200).json({ relatedQuestions });
    } else {
        res.status(200).json({ message: "Sorry, I couldn't find an answer. Please try asking differently." });
    }
}

module.exports = {
    handleChat
};