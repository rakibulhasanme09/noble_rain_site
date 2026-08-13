const mongoose = require('mongoose');
const Order = require('./models/Order');
const Product = require('./models/Product');
require('dotenv').config();

async function testStock() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // get a product
    const product = await Product.findOne();
    if (!product) {
        console.log("No product found");
        process.exit(1);
    }
    console.log(`Initial stock for ${product.name}: ${product.countInStock}`);
    
    const initialStock = product.countInStock;

    // Simulate placing an order directly via controller? No, let's just use axios to hit the backend API
    try {
        const response = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderItems: [{
                    product: product._id,
                    name: product.name,
                    image: product.image,
                    price: product.price,
                    qty: 1
                }],
                shippingAddress: { address: "123", city: "abc", postalCode: "123", country: "BD" },
                paymentMethod: "COD",
                itemsPrice: product.price,
                shippingPrice: 0,
                totalPrice: product.price,
                guestName: "Test Guest",
                guestEmail: "test@test.com",
                guestPhone: "1234"
            })
        });
        const data = await response.json();
        
        console.log(`Order created with ID: ${data._id}`);
        
        // Fetch product again
        const updatedProduct = await Product.findById(product._id);
        console.log(`Updated stock for ${updatedProduct.name}: ${updatedProduct.countInStock}`);
        
        if (updatedProduct.countInStock === initialStock - 1) {
            console.log("SUCCESS: Stock was decremented by 1.");
        } else {
            console.log("FAILURE: Stock was NOT decremented.");
        }
        
        // Now test cancellation
        console.log("Testing cancellation...");
        
        // We need admin token to cancel? No, the API is protected.
        // Let's look at orderRoutes.js
        
    } catch (err) {
        console.error(err.response ? err.response.data : err.message);
    }
    
    process.exit(0);
}

testStock();
