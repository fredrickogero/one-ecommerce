const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
}, { timestamps: true });

// One review per user per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Helper: recalculate product ratings after a review is saved or removed
async function recalcProductRatings(productId) {
    const Product = mongoose.model('Product');
    const result = await mongoose.model('Review').aggregate([
        { $match: { product: productId } },
        { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    if (result.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            'ratings.average': Math.round(result[0].avg * 10) / 10,
            'ratings.count':   result[0].count
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
            'ratings.average': 0,
            'ratings.count':   0
        });
    }
}

ReviewSchema.post('save', async function () {
    await recalcProductRatings(this.product);
});

ReviewSchema.post('findOneAndDelete', async function (doc) {
    if (doc) await recalcProductRatings(doc.product);
});

module.exports = mongoose.model('Review', ReviewSchema);
