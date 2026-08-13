const SiteSettings = require('../models/SiteSettings');

const getOrCreateSettings = async () => {
    let settings = await SiteSettings.findOne({});
    if (!settings) {
        settings = await SiteSettings.create({});
    }
    return settings;
};

// @desc    Get shipping/return policy text
// @route   GET /api/settings/policies
// @access  Public
const getPolicies = async (req, res) => {
    const settings = await getOrCreateSettings();
    res.json({
        shippingPolicy: settings.shippingPolicy,
        returnPolicy: settings.returnPolicy,
    });
};

// @desc    Update shipping/return policy text
// @route   PUT /api/settings/policies
// @access  Private/Admin
const updatePolicies = async (req, res) => {
    const { shippingPolicy, returnPolicy } = req.body;
    const settings = await getOrCreateSettings();

    if (shippingPolicy !== undefined) settings.shippingPolicy = shippingPolicy;
    if (returnPolicy !== undefined) settings.returnPolicy = returnPolicy;

    const updated = await settings.save();
    res.json({
        shippingPolicy: updated.shippingPolicy,
        returnPolicy: updated.returnPolicy,
    });
};

module.exports = { getPolicies, updatePolicies };
