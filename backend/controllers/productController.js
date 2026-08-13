const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    const products = await Product.find({});
    res.json(products);
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    const { name, costPrice, price, discountPercentage, description, image, images, brand, category, countInStock, weight } = req.body;

    const imageList = (images && images.length > 0) ? images : (image ? [image] : []);

    if (!name || imageList.length === 0 || !brand || !category || !description) {
        res.status(400);
        throw new Error('Name, at least one image, brand, category, and description are required');
    }

    const product = new Product({
        name,
        costPrice: costPrice || 0,
        price: price || 0,
        discountPercentage: discountPercentage || 0,
        user: req.user._id,
        images: imageList,
        brand,
        category,
        countInStock: countInStock || 0,
        weight: weight || 0.5,
        description,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    const { name, costPrice, price, discountPercentage, description, image, images, brand, category, countInStock, weight } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name || product.name;
        if (costPrice !== undefined) product.costPrice = costPrice;
        if (price !== undefined) product.price = price;
        if (discountPercentage !== undefined) product.discountPercentage = discountPercentage;
        product.description = description || product.description;
        if (images && images.length > 0) {
            product.images = images;
        } else if (image) {
            product.images = [image];
        }
        product.brand = brand || product.brand;
        product.category = category || product.category;
        product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
        if (weight !== undefined) product.weight = weight;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
        res.status(400);
        throw new Error('Rating and comment are required');
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
        res.status(400);
        throw new Error('You have already reviewed this product');
    }

    const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, createProductReview };
