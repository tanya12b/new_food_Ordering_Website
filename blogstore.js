const fs = require("fs");
const BLOGS_FILE = "./blogs.json";

const readBlogsFile = () => {
    if (!fs.existsSync(BLOGS_FILE)) {
        fs.writeFileSync(BLOGS_FILE, JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(BLOGS_FILE, "utf-8"));
};

const createBlogsFile = (blogs) => {
    fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2));
};

module.exports = { readBlogsFile, createBlogsFile };
