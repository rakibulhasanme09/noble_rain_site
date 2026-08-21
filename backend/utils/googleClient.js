const { google } = require('googleapis');

// Shared OAuth2 client, authenticated as GOOGLE_SENDER_EMAIL via a long-lived
// refresh token (see scripts/getGoogleRefreshToken.js). Reused by the mailer
// (Gmail send) and the Sheets/Drive report generator.
const getGoogleOAuth2Client = () => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    if (process.env.GOOGLE_REFRESH_TOKEN) {
        oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    }

    return oauth2Client;
};

module.exports = { getGoogleOAuth2Client };
