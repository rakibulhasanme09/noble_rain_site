// One-time migration: grandfather all existing users in as verified, since
// email/OTP verification is a new requirement and pre-existing accounts
// never went through it. Run once after deploying the OTP feature.
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const result = await User.updateMany(
            { isVerified: { $ne: true } },
            { $set: { isVerified: true } }
        );

        console.log(`Marked ${result.modifiedCount} existing user(s) as verified.`);
        process.exit();
    } catch (error) {
        console.error('Error migrating users:', error);
        process.exit(1);
    }
};

run();
