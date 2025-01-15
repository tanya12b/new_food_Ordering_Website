// const fs = require("fs");
// const path = require("path");

// const LIKES_FILE = path.join(__dirname, "likes.json");

// // Helper function to read the likes file
// const readLikesFile = () => {
//     if (!fs.existsSync(LIKES_FILE)) {
//         fs.writeFileSync(LIKES_FILE, JSON.stringify({}));
//     }
//     return JSON.parse(fs.readFileSync(LIKES_FILE, "utf-8"));
// };

// // Helper function to write to the likes file
// const writeLikesFile = (data) => {
//     fs.writeFileSync(LIKES_FILE, JSON.stringify(data, null, 2));
// };

// module.exports = { readLikesFile, writeLikesFile };

// likesstore.js
const fs = require("fs");
const path = require("path");

const likesFilePath = path.join(__dirname, "likes.json");

// Function to read the likes data from likes.json
const readLikesFile = () => {
    try {
        const data = fs.readFileSync(likesFilePath);
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading likes file:", error);
        return {};
    }
};

// Function to write the likes data to likes.json
const writeLikesFile = (data) => {
    try {
        fs.writeFileSync(likesFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing to likes file:", error);
    }
};

module.exports = {
    readLikesFile,
    writeLikesFile,
};
