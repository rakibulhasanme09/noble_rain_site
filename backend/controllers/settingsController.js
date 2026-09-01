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

// @desc    Get homepage settings (hero video)
// @route   GET /api/settings/homepage
// @access  Public
const getHomepageSettings = async (req, res) => {
    const settings = await getOrCreateSettings();
    res.json({ heroVideo: settings.heroVideo });
};

// @desc    Update homepage settings (hero video)
// @route   PUT /api/settings/homepage
// @access  Private/Admin
const updateHomepageSettings = async (req, res) => {
    const { heroVideo } = req.body;
    const settings = await getOrCreateSettings();

    if (heroVideo !== undefined) settings.heroVideo = heroVideo;

    const updated = await settings.save();
    res.json({ heroVideo: updated.heroVideo });
};

module.exports = { getPolicies, updatePolicies, getHomepageSettings, updateHomepageSettings };
