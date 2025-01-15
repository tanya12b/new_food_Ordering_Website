const express = require('express');
const router = express.Router();
const fsPromises = require('fs').promises;
const path = require('path');

// Correct file paths for wishlist and cart
const wishlistFilePath = path.join(__dirname, '..', 'wishlist.json');
const cartFilePath = path.join(__dirname, '..', 'cart.json');

// Log the resolved paths to ensure they are correct
console.log("Resolved wishlist file path:", wishlistFilePath);
console.log("Resolved cart file path:", cartFilePath);

// Ensure files exist and are formatted correctly
async function ensureFileExists(filePath, defaultData = []) {
    try {
        const fileExists = await fsPromises.access(filePath, fs.constants.F_OK).then(() => true).catch(() => false);
        if (!fileExists) {
            await writeJSONFile(filePath, defaultData);
            console.log(`${filePath} created with default data.`);
        }
    } catch (error) {
        console.error(`Error checking file existence for ${filePath}:`, error);
    }
}

// Function to read the file and ensure it's an array
async function readJSONFile(filePath) {
    await ensureFileExists(filePath);
    try {
        const data = await fsPromises.readFile(filePath, 'utf8');
        const parsedData = JSON.parse(data);
        // If the parsed data is not an array, default to an empty array
        return Array.isArray(parsedData) ? parsedData : [];
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        throw new Error(`Failed to read ${filePath}`);
    }
}

// Function to write to the file
async function writeJSONFile(filePath, data) {
    try {
        await fsPromises.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error writing to ${filePath}:`, error);
        throw new Error(`Failed to write to ${filePath}`);
    }
}

// Function to remove from wishlist
async function removeFromWishlist(productId) {
    const wishlistData = await readJSONFile(wishlistFilePath);
    const updatedWishlist = wishlistData.filter(item => item.id !== productId);
    await writeJSONFile(wishlistFilePath, updatedWishlist);
}

// Function to add to cart
async function addToCart(productId) {
    const cartData = await readJSONFile(cartFilePath);
    // Make sure cartData is an array before calling push
    if (!Array.isArray(cartData)) {
        throw new Error('Cart data is not an array');
    }
    const newCartItem = { id: productId, quantity: 1 }; // Add additional fields as needed
    cartData.push(newCartItem);
    await writeJSONFile(cartFilePath, cartData);
}


router.post('/wishlist', async (req, res) => {
    const { id, name, price, image } = req.body;

    try {
        const wishlist = await readJSONFile(wishlistFilePath);
        wishlist.push({ id, name, price, image });  // Ensure image is added

        // Save updated wishlist
        await writeJSONFile(wishlistFilePath, wishlist);
        res.status(201).json({ message: 'Product added to wishlist' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update wishlist' });
    }
});
router.get('/wishlist/:id', (req, res) => {
    const productId = req.params.id;
    const product = wishlist.find(item => item.id == productId); // Assuming 'wishlist' is your array of products
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});



// Route to remove item from wishlist
router.delete('/wishlist/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await removeFromWishlist(Number(id));  // Remove the product by ID
        res.status(200).json({ message: `Product with ID ${id} removed from wishlist` });
    } catch (err) {
        console.error('Error removing product from wishlist:', err);
        res.status(500).json({ error: 'Failed to remove product from wishlist' });
    }
});

// Route to add item from wishlist to cart
router.post('/move-to-cart', async (req, res) => {
    const { id, name, price, image } = req.body;
    try {
        // First remove the item from wishlist
        await removeFromWishlist(id);

        // Add to the cart
        await addToCart(id);

        res.status(200).json({ message: 'Product moved to cart' });
    } catch (err) {
        console.error('Error moving product to cart:', err);
        res.status(500).json({ error: 'Failed to move product to cart' });
    }
});

module.exports = router;
