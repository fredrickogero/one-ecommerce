const Order = require('../models/Order');

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('products.product', 'name price images')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching user orders', error: err.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('products.product', 'name price images');

        if (order) {
            // Check if user is admin or the order belongs to the user
            if (req.user.role === 'admin' || order.user._id.toString() === req.user._id.toString()) {
                res.json(order);
            } else {
                res.status(403).json({ message: 'Not authorized to view this order' });
            }
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error fetching order', error: err.message });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'id name')
            .populate('products.product', 'name price')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching orders', error: err.message });
    }
};

// @desc    Update order tracking status
// @route   PUT /api/orders/:id/tracking
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { trackingStatus, note } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            order.trackingStatus = trackingStatus;
            order.trackingHistory.push({
                status: trackingStatus,
                note: note || `Status updated to ${trackingStatus}`
            });

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error updating order status', error: err.message });
    }
};

module.exports = {
    getUserOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus
};
