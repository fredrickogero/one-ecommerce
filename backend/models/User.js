const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true }, // Critical for Kenyan market
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['buyer', 'seller', 'admin', 'delivery'], 
        default: 'buyer' 
    },
    address: {
        street: String,
        city: String,
        county: String, // Kenyan specific
    },
    isVerified: { type: Boolean, default: false },
    lastLogoutAt: { type: Date, default: Date.now },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('User', UserSchema);
