const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config({ path: '.env' });

async function initStock() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected.');
        const result = await Product.updateMany({}, { $set: { stock: 50 } });
        console.log(`Updated ${result.modifiedCount} products to have 50 stock.`);
        process.exit(0);
    } catch (err) {
        console.error('Error updating stock:', err);
        process.exit(1);
    }
}
initStock();
