const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const dotenv = require('dotenv');
const app = express();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const chatbotController = require('./Controllers/chatbotController');
app.use(cors());
app.use(express.json());
app.use(express.static("public")); 
dotenv.config({ path: './config/config.env' });
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
const wishlistRouter = require('./wishlist');


// Serve static files (optional)
app.use(express.static(path.join(__dirname, 'public')));



// wishlist 

const wishlistPath = path.join(__dirname, 'wishlist.json');



app.get('/wishlist', (req, res) => {
    try {
        const wishlist = JSON.parse(fs.readFileSync(wishlistPath, 'utf-8'));
        res.status(200).json(wishlist);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
});


app.post('/wishlist', (req, res) => {
    const { id, name, price } = req.body;

    if (!id || !name || !price) {
        return res.status(400).json({ message: 'Product ID, name, and price are required.' });
    }

    const wishlist = readFile(wishlistPath);
    wishlist.push({ id, name, price });
    writeFile(wishlistPath, wishlist);

    res.status(201).json({ message: 'Item added to wishlist.' });
});


app.delete('/wishlist/:id', (req, res) => {
    try {
        const { id } = req.params;
        const wishlist = JSON.parse(fs.readFileSync(wishlistPath, 'utf-8'));

        const updatedWishlist = wishlist.filter(item => item.id !== parseInt(id));
        fs.writeFileSync(wishlistPath, JSON.stringify(updatedWishlist, null, 2), 'utf-8');

        res.status(200).json({ message: 'Item removed from wishlist.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove item from wishlist' });
    }
});

app.put('/wishlist/:id', (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;

    if (!name && !price) {
        return res.status(400).json({ message: 'At least one field (name or price) must be provided for update.' });
    }

    try {
        const wishlist = JSON.parse(fs.readFileSync(wishlistPath, 'utf-8'));
        
        let itemFound = false;
        const updatedWishlist = wishlist.map(item => {
            if (item.id === parseInt(id)) {
                itemFound = true;
                return {
                    ...item,
                    name: name || item.name,
                    price: price || item.price
                };
            }
            return item;
        });

        if (!itemFound) {
            return res.status(404).json({ message: 'Item not found in wishlist.' });
        }

        fs.writeFileSync(wishlistPath, JSON.stringify(updatedWishlist, null, 2), 'utf-8');
        res.status(200).json({ message: 'Wishlist item updated successfully.', updatedItem: { id, name, price } });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update item in wishlist' });
    }
});



// payment 


const Razorpay = require('razorpay');
const CART_FILE = path.join(__dirname, 'cart.json');
const PRODUCTS_FILE = path.join(__dirname, 'product.json');
const MENU_FILE='./sakshi.json'

const reviewRoutes = require('./Routes/router');
const paymentRouter = require('./Routes/paymentRouter'); 


function readJSONFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data); 
    } catch (error) {
        console.error(`Error reading JSON file at ${filePath}:`, error);
        return null; 
    }
}
function writeJSONFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8'); 
    } catch (error) {
        console.error(`Error writing to file ${filePath}:`, error);
    }
}


app.get('/api/products/all', (req, res) => {
    fs.readFile(path.join(__dirname, 'newProducts.json'), 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading JSON file:", err.message); 
            return res.status(500).json({ message: "Error reading product data", error: err.message });
        }

        try {
            
            const products = JSON.parse(data);
            res.json(products);
        } catch (parseError) {
            console.error("Error parsing JSON:", parseError.message);
            return res.status(500).json({ message: "Error parsing product data", error: parseError.message });
        }
    });
});



// new wishlist 






app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/reviews', reviewRoutes);  
app.use('/api/payment', paymentRouter); 

require('dotenv').config({ path: './config/config.env' }); 

const { readBlogsFile, createBlogsFile } = require("./blogstore");
const { readLikesFile, writeLikesFile } = require("./likesstore");


// payment 

const port = 8008;
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET,
});

app.post('/api/payment/start', async (req, res) => {
    const { amount } = req.body;

    if (!amount) {
        return res.status(400).json({ success: false, message: "Amount is required" });
    }

    try {
        const options = {
            amount: amount * 100, 
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            paymentUrl: "https://razorpay.com/", 
        });
    } catch (err) {
        console.error("Error creating Razorpay order:", err);
        res.status(500).json({ success: false, message: "Failed to initiate payment" });
    }
});


// blogs 


let blogs = readBlogsFile();
let blog_id = blogs.length > 0 ? Math.max(...blogs.map((blog) => blog.id)) : 0;

const updateLikesData = (id, title, type, data) => {
  const likesData = readLikesFile();

  if (!likesData[id]) {
      likesData[id] = { id: id, title: title, likes: 0, shares: 0, comments: [], saves: []};
  }

  switch (type) {
      case 'like':
          likesData[id].likes += 1;
          break;
      case 'unlike':
          likesData[id].likes = Math.max(0, likesData[id].likes - 1); // Prevent negative likes
          break;
      case 'share':
          likesData[id].shares += 1;
          break;
      case 'comment':
          likesData[id].comments.push(data);
          break;
      case 'save':
          if (!likesData[id].saves.includes(data)) {
              likesData[id].saves.push(data);
          }
          break;
      case 'unsave':
          likesData[id].saves = likesData[id].saves.filter(user => user !== data); // Remove the user from saves
          break;
      default:
          break;
  }

  writeLikesFile(likesData);
};

app.post('/blogs/:id/like', (req, res) => {
    const { id } = req.params;
    const blog = blogs.find(b => b.id == id);
    if (!blog) {
        return res.status(404).json({ error: "Blog not found" });
    }
    updateLikesData(id, blog.title, 'like');
    const likesData = readLikesFile();
    res.json({ id, likes: likesData[id].likes });
});

app.post('/blogs/:id/unlike', (req, res) => {
  const { id } = req.params;
  const blog = blogs.find(b => b.id == id);
  if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
  }
  updateLikesData(id, blog.title, 'unlike');
  const likesData = readLikesFile();
  res.json({ id, likes: likesData[id].likes });
});
app.post('/blogs/:id/share', (req, res) => {
    const { id } = req.params;
    const blog = blogs.find(b => b.id == id);
    if (!blog) {
        return res.status(404).json({ error: "Blog not found" });
    }
    updateLikesData(id, blog.title, 'share');
    const likesData = readLikesFile();
    res.json({ id, shares: likesData[id].shares });
});
app.post('/blogs/:id/unsave', (req, res) => {
  const { id } = req.params;
  const { user } = req.body; // Assuming you want to track who unsaved the blog
  const blog = blogs.find(b => b.id == id);
  if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
  }
  updateLikesData(id, blog.title, 'unsave', user);
  const likesData = readLikesFile();
  res.json({ id, savedBy: likesData[id].saves });
});
app.post('/blogs/:id/comment', (req, res) => {
    const { id } = req.params;
    const { user, comment } = req.body;
    const blog = blogs.find(b => b.id == id);
    if (!blog) {
        return res.status(404).json({ error: "Blog not found" });
    }
    updateLikesData(id, blog.title, 'comment', { user, comment });
    const likesData = readLikesFile();
    res.json({ id, comments: likesData[id].comments });
});
app.post('/blogs/:id/save', (req, res) => {
    const { id } = req.params;
    const { user } = req.body;
    const blog = blogs.find(b => b.id == id);
    if (!blog) {
        return res.status(404).json({ error: "Blog not found" });
    }
    updateLikesData(id, blog.title, 'save', user);
    const likesData = readLikesFile();
    res.json({ id, savedBy: likesData[id].saves });
});

const users = [
  { username: "admin", role: "admin" },
  { username: "user", role: "user" },
];

function authorize(role) {
  return (req, res, next) => {
    const user = users.find((u) => u.username === req.headers.username);
    
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    if (user.role !== role) {
      return res.status(403).json({ error: "Forbidden: Access denied" });
    }

    req.user = user;
    next();
  };
}
app.post("/blogs", (req, res) => {
  const { title, chef, content, imageUrl } = req.body;

  if (!title || !chef || !content || !imageUrl) {
    return res.status(400).json({ error: "All fields are required" });
  }

  blog_id += 1;
  const newBlog = { id: blog_id, title, chef, content, imageUrl };
  blogs.push(newBlog);
  createBlogsFile(blogs);
  res.status(201).json(newBlog);
});


app.get("/blogs", (req, res) => {
  res.status(200).json(blogs);
});

app.get("/blogs/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const blog = blogs.find((b) => b.id === id);
  if (blog) {
    res.status(200).json(blog);
  } else {
    res.status(404).json({ error: "Blog not found" });
  }
});

app.put("/blogs/:id", authorize("admin"), (req, res) => {
  const { title, chef, content, imageUrl } = req.body;

  if (!title || !chef || !content || !imageUrl) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const id = parseInt(req.params.id);
  const blogIndex = blogs.findIndex((b) => b.id === id);

  if (blogIndex !== -1) {
    blogs[blogIndex] = { id, title, chef, content, imageUrl };
    createBlogsFile(blogs);
    res.status(200).json(blogs[blogIndex]);
  } else {
    res.status(404).json({ error: "Blog not found" });
  }
});
app.delete("/blogs/:id", authorize("admin"), (req, res) => {
  const id = parseInt(req.params.id);
  const blogIndex = blogs.findIndex((b) => b.id === id);

  if (blogIndex !== -1) {
    blogs.splice(blogIndex, 1);
    createBlogsFile(blogs);
    res.status(204).json();
  } else {
    res.status(404).json({ error: "Blog not found" });
  }
});
















 ///kashish
// File paths
const eventsFile = path.join(__dirname, 'data', 'events.json');
const registrationsFile = path.join(__dirname, 'data', 'registrations.json');

// Helper function to read JSON file
function readJSONFile(filePath) {
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
}

// Helper function to write to JSON file
function writeJSONFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Get events route
app.get('/events', (req, res) => {
  const events = readJSONFile(eventsFile);
  res.json(events);
});

// Register for an event route
app.post('/register', (req, res) => {
  const { name, email, event } = req.body;
  
  const registrations = readJSONFile(registrationsFile);
  registrations.push({ name, email, event });

  writeJSONFile(registrationsFile, registrations);

  res.json({ message: 'Registration successful!' });
});

// Cancel registration route
app.post('/cancel', (req, res) => {
  const { event } = req.body;

  let registrations = readJSONFile(registrationsFile);
  registrations = registrations.filter(reg => reg.event !== event);

  writeJSONFile(registrationsFile, registrations);

  res.json({ message: 'Registration cancelled successfully!' });
});
const admin = { username: 'admin', password: 'admin123' };

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Helper function to read JSON file
function readJSONFile(filePath) {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
}

// Helper function to write to JSON file
function writeJSONFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Basic authentication middleware for admin
function authenticateAdmin(req, res, next) {
    const { username, password } = req.body;
    if (username === admin.username && password === admin.password) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Admin only' });
    }
}

// Get all events
app.get('/events', (req, res) => {
    try {
        const events = readJSONFile(eventsFile);
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error reading events file' });
    }
});

// Add a new event (Admin only)
app.post('/admin/add-event', authenticateAdmin, (req, res) => {
    const { name, date } = req.body;

    if (!name || !date) {
        return res.status(400).json({ message: 'Event name and date are required' });
    }

    try {
        const events = readJSONFile(eventsFile);
        const newEvent = { id: events.length + 1, name, date };
        events.push(newEvent);
        writeJSONFile(eventsFile, events);

        res.json({ success: true, message: 'Event added successfully!', id: newEvent.id });
    } catch (error) {
        res.status(500).json({ message: 'Error saving event' });
    }
});

// Remove an event (Admin only)
app.delete('/admin/remove-event/:id', authenticateAdmin, (req, res) => {
    const eventId = parseInt(req.params.id, 10);

    try {
        const events = readJSONFile(eventsFile);
        const updatedEvents = events.filter(event => event.id !== eventId);

        if (events.length === updatedEvents.length) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        writeJSONFile(eventsFile, updatedEvents);
        res.json({ success: true, message: 'Event removed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing event' });
    }
});















// khushi 














// admin 














// Absolute path to the admin.json file
const adminFilePath = path.join(__dirname, 'admin.json');



const DEFAULT_ADMIN = {
    name: 'khushi',
    email: 'khushi@gmail.com',
    password: 'Khushi@1'  // A plain password, which will be hashed
};



// Middleware to parse JSON bodies
app.use(express.json());

// Register a new admin
app.post('/adminregister', async (req, res) => {
    const { name, email, password } = req.body;

    // Check if email is already taken (or check other conditions)
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).json({ msg: 'Email already registered' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new admin and add to the "database"
    const newUser = { name, email, password: hashedPassword };
    users.push(newUser);

    res.status(201).json({ msg: 'Admin registered successfully' });
});

// Admin login route
app.post('/adminlogin', async (req, res) => {
    const { email, password } = req.body;

    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if it's the default admin
    if (email === DEFAULT_ADMIN.email) {
        return res.status(200).json({ msg: 'Logged in successfully (default admin)', token: generateToken(user) });
    }

    // Generate JWT token
    const token = generateToken(user);
    res.status(200).json({ msg: 'Logged in successfully', token });
});

// Helper function to generate JWT token
function generateToken(user) {
    return jwt.sign(
        { email: user.email, name: user.name },
        'your_secret_key', // Secret key for JWT signing
        { expiresIn: '1h' } // Token expiration time
    );
}




// Middleware to check JWT token
function authenticateToken(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1]; // Token should be in the format 'Bearer <token>'
    
    if (!token) {
        return res.status(403).json({ msg: 'Access denied' });
    }

    jwt.verify(token, 'your_secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({ msg: 'Invalid or expired token' });
        }
        req.user = user; // Attach user data to the request object
        next(); // Proceed to the next middleware or route handler
    });
}

// Example of a protected route
app.get('/admin/dashboard', authenticateToken, (req, res) => {
    res.json({ msg: 'Welcome to the admin dashboard', user: req.user });
});







//users 




const { readFile, writeFile } = require('./File');
require('dotenv').config();


app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const usersFilePath = path.join(__dirname, 'users.json');
const secret_key = process.env.SECRET_KEY || "default_secret_key";

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: "Token Required or Invalid Format" });
    }

    const token = authHeader.split(' ')[1];
    try {
        req.user = jwt.verify(token, secret_key);
        next();
    } catch (error) {
        return res.status(401).json({ msg: "Invalid Token" });
    }
}

function validatePassword(password) {
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])/;
    const isValid = regex.test(password);
    console.log(`Password validation for "${password}":`, isValid);
    return isValid;
}


// Register a new user
app.post("/registerUser", (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!validatePassword(password)) {
            return res.status(400).json({ msg: "Password must contain at least one uppercase letter and one special character." });
        }

        const users_data = readFile(usersFilePath);
        const user_id = users_data.length === 0 ? 1 : users_data[users_data.length - 1].id + 1;

        const existingUser = users_data.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({ msg: "Email Already Exists" });
        }

        const hashedPassword = bcrypt.hashSync(password, 8);
        const newUser = {
            id: user_id,
            name,
            email,
            password: hashedPassword
        };

        users_data.push(newUser);
        writeFile(usersFilePath, users_data);

        return res.status(201).json({ msg: "User Registered Successfully" });
    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ msg: "An error occurred while registering the user", error });
    }
});

// User login
app.post("/login", (req, res) => {
    try {
        const { email, password } = req.body;

        const users_data = readFile(usersFilePath);
        const user = users_data.find(u => u.email === email);

        if (!user) {
            return res.status(400).json({ msg: "Incorrect Email" });
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.status(400).json({ msg: "Incorrect Password" });
        }

        const token = jwt.sign({ user_id: user.id, name: user.name }, secret_key, { expiresIn: '2h' });
        return res.status(200).json({ msg: "Login Successful", token });
    } catch (error) {
        return res.status(500).json({ msg: "An error occurred during login", error });
    }
});

// Logout endpoint

// Assuming your file operations are in file.js
app.post('/logout', verifyToken, (req, res) => {
    try {
        // Paths to all JSON files that need to be cleared
        const files = [
            { name: 'likes', path: path.join(__dirname, 'likes.json'), emptyStructure: [] },
            { name: 'cart', path: path.join(__dirname, 'cart.json'), emptyStructure: [] },
            { name: 'data', path: path.join(__dirname, 'data.json'), emptyStructure: {} },
            { name: 'blogs', path: path.join(__dirname, 'blogs.json'), emptyStructure: [] },
            { name: 'wishlist', path: path.join(__dirname, 'wishlist.json'), emptyStructure: [] }
        ];

        // Overwrite each file with its empty structure
        files.forEach(file => {
            writeFile(file.path, file.emptyStructure); // Write an empty structure
        });

        return res.status(200).json({ msg: "Logout successful. All user data has been cleared." });
    } catch (error) {
        console.error("Error during logout:", error);
        return res.status(500).json({ msg: "An error occurred while logging out", error });
    }
});


app.get('/api/cart', (req, res) => {
    try {
        const cart = readJSONFile(CART_FILE);
        const products = readJSONFile(PRODUCTS_FILE);
        const cartDetails = cart.items
            .map(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) {
                    console.error(`Product with ID ${item.productId} not found.`);
                    return null;
                }
                return { ...item, product };
            })
            .filter(item => item !== null);
        let totalPrice = cartDetails.reduce((total, item) => {
            return total + item.quantity * item.product.price;
        }, 0);
        let discountAmount = 0;
        if (totalPrice > 2000) {
            discountAmount = totalPrice * 0.10; 
        } else if (totalPrice > 1000) {
            discountAmount = totalPrice * 0.05;
        }

        const finalTotal = totalPrice - discountAmount;

        res.json({ items: cartDetails, totalPrice, discountAmount, finalTotal });
    } catch (error) {
        console.error('Error reading cart file:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
app.get('/api/cartread', (req, res) => {
    try {
      const cart = readJSONFile(CART_FILE); // Read data from CART_FILE
      const products = readJSONFile(PRODUCTS_FILE); 
  
      const cartDetails = cart.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          ...item,
          product: product || { id: item.productId, unavailable: true }, // Use nullish coalescing for cleaner syntax
        };
      })
      .filter(item => item !== null);
      let totalPrice = cartDetails.reduce((total, item) => {
          return total + item.quantity * item.product.price;
      }, 0);
      let discountAmount = 0;
      if (totalPrice > 2000) {
          discountAmount = totalPrice * 0.10; 
      } else if (totalPrice > 1000) {
          discountAmount = totalPrice * 0.05;
      }
      const finalTotal = totalPrice - discountAmount;
      res.json({ items: cartDetails, totalPrice, discountAmount, finalTotal });
    } catch (error) {
      console.error('Error reading cart file:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
app.post('/api/cart/add', (req, res) => {
    const { productId, quantity } = req.body;
    const productIdNumber = parseInt(productId);
    const products = readJSONFile(PRODUCTS_FILE);
    let cart = readJSONFile(CART_FILE);
    if (!cart || !cart.items) {
        cart = { items: [], totalPrice: 0 }; 
    }
    const product = products.find(p => p.id === productIdNumber);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    const itemIndex = cart.items.findIndex(item => item.productId === productIdNumber);

    if (itemIndex > -1) {
        cart.items[itemIndex].quantity += parseInt(quantity);
    } else {
        cart.items.push({ productId: productIdNumber, quantity: parseInt(quantity) });
    }
    cart.totalPrice = cart.items.reduce((total, item) => {
        const product = products.find(p => p.id === item.productId);
        return total + (product ? item.quantity * product.price : 0);
    }, 0);
    writeJSONFile(CART_FILE, cart);
    res.status(200).json({ message: 'Item added to cart', cart });
});

function readJSONFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading file:', err);
    return [];
  }
}
function writeJSONFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing file:', err);
  }
}
// Function to read all menu items
function readMenuData() {
  const menuData = readJSONFile(MENU_FILE);
  return menuData;
}

// Endpoint to add items to the cart
app.post('/api/cart/addkhana', (req, res) => {
  const { productId, quantity } = req.body;
  const productIdNumber = parseInt(productId);

  const products = readJSONFile(PRODUCTS_FILE);
  let cart = readJSONFile(CART_FILE);

  if (!cart || !cart.items) {
    cart = { items: [], totalPrice: 0 };
  }

  const product = products.find(p => p.id === productIdNumber);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const itemIndex = cart.items.findIndex(item => item.productId === productIdNumber);

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += parseInt(quantity);
  } else {
    cart.items.push({ productId: productIdNumber, quantity: parseInt(quantity) });
  }

  cart.totalPrice = cart.items.reduce((total, item) => {
    const product = products.find(p => p.id === item.productId);
    return total + (product ? item.quantity * product.price : 0);
  }, 0);

  writeJSONFile(CART_FILE, cart);
  res.status(200).json({ message: 'Item added to cart', cart });
});

app.put('/api/cart/update', (req, res) => {
    const { productId, quantity } = req.body;

    const cart = readJSONFile(CART_FILE);
    const products = readJSONFile(PRODUCTS_FILE);

    const itemIndex = cart.items.findIndex(item => item.productId === parseInt(productId));
    if (itemIndex > -1) {
        cart.items[itemIndex].quantity = parseInt(quantity);
    } else {
        return res.status(404).json({ message: 'Item not found in cart' });
    }
    cart.totalPrice = cart.items.reduce((total, item) => {
        const product = products.find(p => p.id === item.productId);
        return total + (product ? item.quantity * product.price : 0);
    }, 0);

    writeJSONFile(CART_FILE, cart);
    res.status(200).json({ message: 'Cart updated', cart });
});
app.delete('/api/cart/remove', (req, res) => {
    const { productId } = req.body;

    const cart = readJSONFile(CART_FILE);
    cart.items = cart.items.filter(item => item.productId !== parseInt(productId));

    const products = readJSONFile(PRODUCTS_FILE);
    cart.totalPrice = cart.items.reduce((total, item) => {
        const product = products.find(p => p.id === item.productId);
        return total + (product ? item.quantity * product.price : 0);
    }, 0);

    writeJSONFile(CART_FILE, cart);
    res.status(200).json({ message: 'Item removed from cart', cart });
});





app.post('/admin/add-menu-item', (req, res) => {
    const newItem = req.body;
    console.log('Received data:', newItem); // Debug log

    // Read existing menu items
    fs.readFile(PRODUCTS_FILE, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading menu file:', err);
            return res.status(500).json({ error: 'Failed to read menu data.' });
        }

        let menu = [];
        try {
            menu = JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
        }

        // Add the new item
        menu.push(newItem);

        // Write back to the file
        fs.writeFile(PRODUCTS_FILE, JSON.stringify(menu, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing to menu file:', writeErr);
                return res.status(500).json({ error: 'Failed to update menu.' });
            }

            res.status(200).json({ message: 'Menu item added successfully!' });
        });
    });
});


app.post('/admin/add-menu-item', (req, res) => {
    const newItem = req.body;
    console.log('Received data:', newItem); // Debug log

    // Convert the price field to an integer
    if (newItem.price) {
        newItem.price = parseInt(newItem.price, 10);
    }

    // Read existing menu items
    fs.readFile(MENU_FILE, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading menu file:', err);
            return res.status(500).json({ error: 'Failed to read menu data.' });
        }

        let menu = [];
        try {
            menu = JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
        }

        // Add the new item
        menu.push(newItem);
        
        // Write back to the file
        fs.writeFile(MENU_FILE, JSON.stringify(menu, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing to menu file:', writeErr);
                return res.status(500).json({ error: 'Failed to update menu.' });
            }

            res.status(200).json({ message: 'Menu item added successfully!' });
        });
    });
});

app.get('/api/product', (req, res) => {
    try {
        const products = readJSONFile(PRODUCTS_FILE);
        res.json(products);
    } catch (error) {
        console.error('Error reading products file:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('/api/newproduct', (req, res) => {
    try {
        const products = readJSONFile(MENU_FILE);
        res.json(products);
    } catch (error) {
        console.error('Error reading products file:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/product', (req, res) => {
    try {
        const products = readJSONFile(PRODUCTS_FILE);
        res.json(products);
    } catch (error) {
        console.error('Error reading products file:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/newproduct', (req, res) => {
    try {
        const products = readJSONFile(MENU_FILE);
        res.json(products);
    } catch (error) {
        console.error('Error reading products file:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});










// Rishika(chatbot)
app.get('/api/product', (req, res) => {
    try {
        const products = readJSONFile(PRODUCTS_FILE);
        res.json(products);
    } catch (error) {
        console.error('Error reading products file:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/newproduct', (req, res) => {
    try {
        const products = readJSONFile(MENU_FILE);
        res.json(products);
    } catch (error) {
        console.error('Error reading products file:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/chatbot/chat', chatbotController.handleChat);
app.get('/chatbotData.json', (req, res) => {
    
  res.sendFile(path.join(__dirname, 'data','chatbotData.json'));
});
app.get('/chatbot', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chatbot.html'));
  });
app.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});


