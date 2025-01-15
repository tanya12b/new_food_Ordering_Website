const Razorpay = require("razorpay");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET,
});

exports.renderProductPage = (req, res) => {
    // Logic to render the product page (just a placeholder for now)
    res.send('Product Page');
};

exports.createOrder = async (req, res) => {
    const { amount } = req.body;

    if (!amount) {
        return res.status(400).json({ success: false, message: "Amount is required" });
    }

    try {
        const options = {
            amount: amount * 100, // Convert to smallest currency unit
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            paymentUrl: "https://razorpay.com/", // Can replace with your actual Razorpay payment page URL
        });
    } catch (err) {
        console.error("Error creating Razorpay order:", err);
        res.status(500).json({ success: false, message: "Failed to initiate payment" });
    }
};

exports.paymentSuccess = (req, res) => {
    // Handle payment success
    res.send("Payment Successful");
};

exports.paymentFailure = (req, res) => {
    // Handle payment failure
    res.send("Payment Failed");
};
