const SiteSettings = require('../models/SiteSettings');

const getOrCreateSettings = async () => {
    let settings = await SiteSettings.findOne({});
    if (!settings) {
        settings = await SiteSettings.create({});
    }
    return settings;
};

// @desc    Get shipping/return/privacy/terms policy text
// @route   GET /api/settings/policies
// @access  Public
const getPolicies = async (req, res) => {
    const settings = await getOrCreateSettings();
    res.json({
        shippingPolicy: settings.shippingPolicy,
        returnPolicy: settings.returnPolicy,
        privacyPolicy: settings.privacyPolicy,
        termsOfService: settings.termsOfService,
    });
};

// @desc    Update shipping/return/privacy/terms policy text
// @route   PUT /api/settings/policies
// @access  Private/Admin
const updatePolicies = async (req, res) => {
    const { shippingPolicy, returnPolicy, privacyPolicy, termsOfService } = req.body;
    const settings = await getOrCreateSettings();

    if (shippingPolicy !== undefined) settings.shippingPolicy = shippingPolicy;
    if (returnPolicy !== undefined) settings.returnPolicy = returnPolicy;
    if (privacyPolicy !== undefined) settings.privacyPolicy = privacyPolicy;
    if (termsOfService !== undefined) settings.termsOfService = termsOfService;

    const updated = await settings.save();
    res.json({
        shippingPolicy: updated.shippingPolicy,
        returnPolicy: updated.returnPolicy,
        privacyPolicy: updated.privacyPolicy,
        termsOfService: updated.termsOfService,
    });
};

module.exports = { getPolicies, updatePolicies };
