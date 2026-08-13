const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const user = await mongoose.connection.db.collection('users').findOne({ email: 'rakibulhasan.me09@gmail.com' });
        if (user) {
            const result = await mongoose.connection.db.collection('orders').updateMany(
                { guestEmail: 'rakibulhasan.me09@gmail.com' },
                { $set: { user: user._id } }
            );
            console.log('Updated orders with user ID', user._id, 'Count:', result.modifiedCount);
        } else {
            console.log('User not found');
        }
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
});
