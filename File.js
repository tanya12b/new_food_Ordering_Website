const fs = require('fs');
const path = require('path');

// Generic readFile
function readFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            return []; // Return empty array if file doesn't exist
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return [];
    }
}

// Generic writeFile
function writeFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error writing file ${filePath}:`, error);
    }
}

// Blog-specific functions
const blogsFilePath = path.join(__dirname, 'blogs.json');

const readBlogsFile = () => readFile(blogsFilePath);

const createBlogsFile = (blogs) => writeFile(blogsFilePath, blogs);

module.exports = {
    readFile,
    writeFile,
    readBlogsFile,
    createBlogsFile,
};
