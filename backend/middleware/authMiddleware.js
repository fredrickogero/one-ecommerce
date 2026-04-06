const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Handle fallback admin ID
            if (decoded.id === 'admin-fallback-id') {
                req.user = { id: 'admin-fallback-id', name: 'System Admin', email: process.env.ADMIN_EMAIL, role: 'admin' };
                return next();
            }

            // Attach user to request, but also check if logout was forced
            const user = await User.findById(decoded.id).select('-password');
            if (!user) return res.status(401).json({ message: 'User no longer exists' });

            if (user.lastLogoutAt && (decoded.iat * 1000 < user.lastLogoutAt.getTime())) {
                return res.status(401).json({ message: 'Token invalid (user logged out)', error: 'logged_out' });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            console.log('Received Token:', token);
            console.log('Using Secret:', process.env.JWT_SECRET ? 'Defined' : 'Undefined');
            res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
