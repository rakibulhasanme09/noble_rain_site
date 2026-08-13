const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    costPrice: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    discountPercentage: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    weight: { type: Number, required: true, default: 0.5 },
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
}, { timestamps: true });

productSchema.pre('validate', function() {
    if (this.images && this.images.length > 0) {
        this.image = this.images[0];
    } else if (this.image) {
        this.images = [this.image];
    }
});

module.exports = mongoose.model('Product', productSchema);
