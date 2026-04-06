const express = require('express');
const router = express.Router();
const axios = require('axios');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Initialize Transaction
router.post('/initialize', protect, async (req, res) => {
    try {
        const { amount, email, items, customerName, customerPhone, shippingAddress } = req.body;
        
        // 1. Pre-checkout validation: Check stock for all items
        for (const item of items) {
            const product = await Product.findById(item._id);
            if (!product) return res.status(404).json({ message: `Product ${item.name} not found` });
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}. Only ${product.stock} left.` });
            }
        }

        // Amount should be in kobo (cent) for Paystack, so multiply by 100
        const paystackAmount = amount * 100;

        const response = await axios.post('https://api.paystack.co/transaction/initialize', {
            email,
            amount: paystackAmount,
            callback_url: `${req.headers.origin}/verify-payment`
        }, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.status) {
            // Create a pending order
            const order = new Order({
                user: req.user._id,
                products: items.map(item => ({ product: item._id, quantity: item.quantity })),
                totalAmount: amount,
                paymentReference: response.data.data.reference,
                status: 'pending',
                customerName,
                customerPhone,
                shippingAddress,
                trackingHistory: [{ status: 'Processing', note: 'Order placed successfully' }]
            });
            await order.save();

            res.json(response.data.data);
        } else {
            res.status(400).json({ message: 'Paystack initialization failed' });
        }
    } catch (err) {
        console.error('Paystack Init Error:', err.response?.data || err.message);
        res.status(500).json({ message: 'Payment initialization error', error: err.message });
    }
});

// Verify Transaction
router.get('/verify/:reference', protect, async (req, res) => {
    try {
        const { reference } = req.params;
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
            }
        });

        if (response.data.status && response.data.data.status === 'success') {
            const order = await Order.findOneAndUpdate(
                { paymentReference: reference },
                { status: 'completed', paymentStatus: 'paid' },
                { new: true }
            );

            // Deduct stock for all purchased items
            if (order && order.products) {
                for (const item of order.products) {
                    await Product.findByIdAndUpdate(item.product, {
                        $inc: { stock: -item.quantity }
                    });
                }
            }

            res.json({ status: 'success', order });
        } else {
            res.status(400).json({ status: 'failed', message: 'Payment verification failed' });
        }
    } catch (err) {
        console.error('Paystack Verify Error:', err.response?.data || err.message);
        res.status(500).json({ message: 'Payment verification error' });
    }
});

module.exports = router;
