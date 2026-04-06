const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'KES' }, // Default Kenyan Shillings
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    images: [{ type: String}],

    condition: { 
        type: String, 
        enum: ['new', 'used'], 
        default: 'new' 
    }, // Important for Jiji-style marketplace
    stock: { type: Number, default: 0 },
    variants: [{
        color: String,
        size: String,
        priceDelta: Number
    }],
    location: {
        city: String,
        county: String
    },
    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
