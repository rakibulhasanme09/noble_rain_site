const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const adminExists = await User.findOne({ email: 'admin@noblerain.com' });

        if (adminExists) {
            console.log('Admin user already exists!');
            process.exit();
        }

        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@noblerain.com',
            password: 'password123',
            isAdmin: true,
        });

        await adminUser.save();
        console.log('Admin user created successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding admin user:', error);
        process.exit(1);
    }
};

seedAdmin();
