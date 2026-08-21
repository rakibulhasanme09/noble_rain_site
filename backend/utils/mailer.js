const { google } = require('googleapis');
const MailComposer = require('nodemailer/lib/mail-composer');
const { getGoogleOAuth2Client } = require('./googleClient');

// Sent via the Gmail API (users.messages.send) rather than raw SMTP, since
// our OAuth grant only has the narrow `gmail.send` scope - SMTP's XOAUTH2
// requires the much broader `https://mail.google.com/` scope instead.
// MailComposer builds the RFC 822 MIME message (headers/html/attachments);
// the Gmail API just wants that as base64url in `raw`.
const buildRawMessage = ({ to, subject, html, attachments }) => new Promise((resolve, reject) => {
    const mail = new MailComposer({
        from: `Noble Rain <${process.env.GOOGLE_SENDER_EMAIL}>`,
        to,
        subject,
        html,
        attachments,
    });
    mail.compile().build((err, message) => {
        if (err) return reject(err);
        resolve(message.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''));
    });
});

// @param {{to: string, subject: string, html: string, attachments?: Array}} options
const sendMail = async ({ to, subject, html, attachments }) => {
    if (!process.env.GOOGLE_REFRESH_TOKEN) {
        console.warn(`Skipping email to ${to} ("${subject}") - GOOGLE_REFRESH_TOKEN not configured. Run scripts/getGoogleRefreshToken.js to set it up.`);
        return;
    }

    const auth = getGoogleOAuth2Client();
    const gmail = google.gmail({ version: 'v1', auth });
    const raw = await buildRawMessage({ to, subject, html, attachments });

    await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw },
    });
};

module.exports = { sendMail };
