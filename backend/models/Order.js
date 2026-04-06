const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 }
    }],
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'KES' },
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed', 'cancelled'], 
        default: 'pending' 
    },
    paymentReference: { type: String, unique: true },
    paymentStatus: { type: String, default: 'unpaid' },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        county: { type: String, required: true }
    },
    trackingStatus: {
        type: String,
        enum: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'],
        default: 'Processing'
    },
    trackingHistory: [{
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        note: { type: String }
    }],
    expectedDeliveryDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
