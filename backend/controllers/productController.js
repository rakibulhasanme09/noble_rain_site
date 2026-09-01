const Product = require('../models/Product');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// costPrice is wholesale cost, not something anonymous shoppers or customers
// should see on the public storefront - only admins get it back.
const sanitizeProduct = (product, isAdmin) => {
    if (isAdmin) return product;
    const { costPrice, ...rest } = product.toObject ? product.toObject() : product;
    return rest;
};

const SORT_OPTIONS = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { rating: -1 },
    newest: { createdAt: -1 },
};

// @desc    Fetch products, optionally filtered by keyword/category/price/
//          sale/stock and sorted; paginated when pageNumber is supplied
//          (existing callers that don't pass pageNumber keep getting a
//          plain array back).
// @route   GET /api/products?keyword=&category=&minPrice=&maxPrice=&onSale=&inStock=&sort=&pageNumber=&pageSize=
// @access  Public
const getProducts = async (req, res) => {
    const keyword = req.query.keyword
        ? {
              $or: [
                  { name: { $regex: escapeRegex(req.query.keyword), $options: 'i' } },
                  { description: { $regex: escapeRegex(req.query.keyword), $options: 'i' } },
                  { brand: { $regex: escapeRegex(req.query.keyword), $options: 'i' } },
                  { category: { $regex: escapeRegex(req.query.keyword), $options: 'i' } },
              ],
          }
        : {};

    const category = req.query.category && req.query.category !== 'All'
        ? { category: { $regex: `^${escapeRegex(req.query.category)}$`, $options: 'i' } }
        : {};

    const price = {};
    if (req.query.minPrice) price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) price.$lte = Number(req.query.maxPrice);

    const onSale = req.query.onSale === 'true' ? { discountPercentage: { $gt: 0 } } : {};
    const inStock = req.query.inStock === 'true' ? { countInStock: { $gt: 0 } } : {};
    const topSeller = req.query.topSeller === 'true' ? { isTopSeller: true } : {};

    const filter = { ...keyword, ...category, ...(Object.keys(price).length ? { price } : {}), ...onSale, ...inStock, ...topSeller };
    const sort = SORT_OPTIONS[req.query.sort] || SORT_OPTIONS.newest;
    const isAdmin = !!(req.user && req.user.isAdmin);

    if (req.query.pageNumber) {
        const pageSize = Math.min(Number(req.query.pageSize) || 12, 48);
        const page = Math.max(Number(req.query.pageNumber) || 1, 1);

        const count = await Product.countDocuments(filter);
        const products = await Product.find(filter).sort(sort).limit(pageSize).skip(pageSize * (page - 1));

        return res.json({ products: products.map((p) => sanitizeProduct(p, isAdmin)), page, pages: Math.ceil(count / pageSize), count });
    }

    const products = await Product.find(filter).sort(sort);
    res.json(products.map((p) => sanitizeProduct(p, isAdmin)));
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        res.json(sanitizeProduct(product, req.user && req.user.isAdmin));
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    const { name, costPrice, price, discountPercentage, description, image, images, brand, category, countInStock, weight, isTopSeller } = req.body;

    const imageList = (images && images.length > 0) ? images : (image ? [image] : []);

    if (!name || imageList.length === 0 || !category) {
        res.status(400);
        throw new Error('Name, at least one image, and category are required');
    }

    const product = new Product({
        name,
        costPrice: costPrice || 0,
        price: price || 0,
        discountPercentage: discountPercentage || 0,
        user: req.user._id,
        images: imageList,
        brand: brand || '',
        category,
        countInStock: countInStock || 0,
        weight: weight || 0.5,
        description: description || '',
        isTopSeller: !!isTopSeller,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    const { name, costPrice, price, discountPercentage, description, image, images, brand, category, countInStock, weight, isTopSeller } = req.body;

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
        if (isTopSeller !== undefined) product.isTopSeller = !!isTopSeller;

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
