const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        await Category.deleteMany({});

        // 1. Create a Seller & Admin
        const admin = new User({
            name: 'Fredrick Otieno',
            email: 'fredrickotieno0461@gmail.com',
            phone: '0700000000',
            password: 'FredKangaJaneiro001',
            role: 'admin',
            address: { city: 'Nairobi', county: 'Nairobi' }
        });
        await admin.save();

        const seller = new User({
            name: 'Joe Otieno',
            email: "joeotieno@gmail.com",
            phone: '0712345678',
            password: 'password123',
            role: 'seller',
            address: { city: 'Nairobi', county: 'Nairobi' }
        });
        await seller.save();

        // 2. Create Categories
        const electronics = await new Category({ name: 'Electronics', description: 'Phones, Laptops, and more' }).save();
        const fashion = await new Category({ name: 'Fashion', description: 'Clothing and accessories' }).save();

        // 3. Create Products
        const products = [
            {
                name: 'iPhone 15 Pro Max',
                description: 'Latest iPhone in excellent condition, 256GB storage.',
                price: 155000,
                category: electronics._id,
                seller: admin._id,
                condition: 'new',
                location: { city: 'Westlands', county: 'Nairobi' },
                images: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=500'],
                ratings: { average: 4.8, count: 12 }
            },
            {
                name: 'Used MacBook Air M1',
                description: 'Lightly used, perfect for students. 8GB RAM, 256GB SSD.',
                price: 85000,
                category: electronics._id,
                seller: seller._id,
                condition: 'used',
                location: { city: 'Mombasa Road', county: 'Nairobi' },
                images: ['https://images.unsplash.com/photo-1611186871348-b1ec696e5237?auto=format&fit=crop&q=80&w=500'],
                ratings: { average: 4.5, count: 5 }
            },
            {
                name: 'Traditional Kenyan Masaai Shuka',
                description: 'High quality, authentic Masaai shuka. Perfect for gifts.',
                price: 1200,
                category: fashion._id,
                seller: seller._id,
                condition: 'new',
                location: { city: 'Maasai Market', county: 'Nairobi' },
                images: ['https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=500'],
                ratings: { average: 5.0, count: 8 }
            }
        ];

        await Product.insertMany(products);
        console.log('Database seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedData();
