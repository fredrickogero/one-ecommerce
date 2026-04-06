const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');

// @route   GET api/analytics/summary
// @desc    Get total revenue, orders, users, and products
router.get('/summary', async (req, res) => {
    try {
        const totalRevenueResult = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

        const totalOrders = await Order.countDocuments({ paymentStatus: 'paid' });
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();

        res.json({
            totalRevenue,
            totalOrders,
            totalUsers,
            totalProducts
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/analytics/category-sales
// @desc    Get sales distribution by category
router.get('/category-sales', async (req, res) => {
    try {
        const salesByCategory = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $unwind: '$products' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.product',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $group: {
                    _id: '$productInfo.category',
                    revenue: { $sum: { $multiply: ['$productInfo.price', '$products.quantity'] } },
                    count: { $sum: '$products.quantity' }
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            { $unwind: '$categoryInfo' },
            {
                $project: {
                    _id: 0,
                    category: '$categoryInfo.name',
                    revenue: 1,
                    count: 1
                }
            }
        ]);

        res.json(salesByCategory);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/analytics/sales-history
// @desc    Get daily revenue for the last 30 days
router.get('/sales-history', async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const salesHistory = await Order.aggregate([
            { 
                $match: { 
                    paymentStatus: 'paid',
                    createdAt: { $gte: thirtyDaysAgo }
                } 
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(salesHistory);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/analytics/recent-orders
// @desc    Get the most recent 10 orders
router.get('/recent-orders', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
