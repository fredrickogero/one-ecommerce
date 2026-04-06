const Product = require('../models/Product');

// Create Product
exports.createProduct = async (req, res) => {
    try {
        console.log('User:', req.user);
        console.log('Body:', req.body);
        console.log('Files:', req.files);
        
        let images = [];
        if (req.files) {
            images = req.files.map(file => `/uploads/products/${file.filename}`);
        }

        const product = new Product({
            ...req.body,
            location: {
                city: req.body.city || req.body['location[city]'] || 'Nairobi',
                county: req.body.county || req.body['location[county]'] || 'Nairobi'
            },
            seller: req.user.id,
            images: images
        });
        await product.save();
        const populatedProduct = await Product.findById(product._id).populate('category', 'name').populate('seller', 'name');
        res.status(201).json(populatedProduct);
    } catch (err) {
        console.error('Product Save Error Detail:', err);
        res.status(500).json({ 
            message: 'Server error during save', 
            error: err.message,
            stack: err.stack,
            validationErrors: err.errors
        });
    }
};

// Get All Products with Filters
exports.getProducts = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, county, condition, search } = req.query;
        let query = {};

        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (county) query['location.county'] = county;
        if (condition) query.condition = condition;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        console.log('Query:', query);
        const products = await Product.find(query)
            .populate('category', 'name')
            .populate('seller', 'name')
            .sort({ createdAt: -1 });
            
        console.log(`Found ${products.length} products`);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get Single Product
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            .populate('seller', 'name email phone');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
// Update Product
exports.updateProduct = async (req, res) => {
    try {
        console.log('Update Body:', req.body);
        console.log('Update Files:', req.files);
        
        let updateData = { ...req.body };
        
        if (req.body.city || req.body['location[city]']) {
            updateData.location = {
                city: req.body.city || req.body['location[city]'],
                county: req.body.county || req.body['location[county]']
            };
        }

        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
            updateData.images = newImages;
        }

        const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('category', 'name').populate('seller', 'name');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        console.error('Product Update Error Detail:', err);
        res.status(500).json({ 
            message: 'Server error during update', 
            error: err.message,
            stack: err.stack,
            validationErrors: err.errors
        });
    }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
