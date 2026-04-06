const Review = require('../models/Review');
const Product = require('../models/Product');

// GET /api/reviews/:productId — public
const getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/reviews/:productId — protected (any logged-in user)
const addReview = async (req, res) => {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check product exists
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Check duplicate
    const existing = await Review.findOne({ product: req.params.productId, user: req.user._id });
    if (existing) return res.status(400).json({ message: "You've already reviewed this product" });

    try {
        const review = await Review.create({
            product: req.params.productId,
            user:    req.user._id,
            rating:  Number(rating),
            comment: comment || ''
        });
        const populated = await review.populate('user', 'name');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/reviews/:id — protected + admin
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        res.json({ message: 'Review deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getProductReviews, addReview, deleteReview };
