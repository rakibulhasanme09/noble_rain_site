const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json(categories);
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
    const { name } = req.body;

    if (!name || !name.trim()) {
        res.status(400);
        throw new Error('Category name is required');
    }

    const trimmedName = name.trim();
    const exists = await Category.findOne({ name: new RegExp(`^${trimmedName}$`, 'i') });
    if (exists) {
        res.status(400);
        throw new Error('A category with this name already exists');
    }

    const category = await Category.create({ name: trimmedName });
    res.status(201).json(category);
};

// @desc    Rename a category (cascades to products using the old name)
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
    const { name } = req.body;

    if (!name || !name.trim()) {
        res.status(400);
        throw new Error('Category name is required');
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    const trimmedName = name.trim();
    const exists = await Category.findOne({ _id: { $ne: category._id }, name: new RegExp(`^${trimmedName}$`, 'i') });
    if (exists) {
        res.status(400);
        throw new Error('A category with this name already exists');
    }

    const oldName = category.name;
    category.name = trimmedName;
    await category.save();

    if (oldName !== trimmedName) {
        await Product.updateMany({ category: oldName }, { $set: { category: trimmedName } });
    }

    res.json(category);
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    const productsUsingCategory = await Product.countDocuments({ category: category.name });
    if (productsUsingCategory > 0) {
        res.status(400);
        throw new Error(`Cannot delete: ${productsUsingCategory} product(s) still use this category. Reassign them first.`);
    }

    await category.deleteOne();
    res.json({ message: 'Category removed' });
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
