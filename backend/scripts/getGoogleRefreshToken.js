// One-time setup script: run this once, log in as GOOGLE_SENDER_EMAIL in the
// browser tab that opens, approve access, then paste the ?code= value back
// here. Prints a refresh_token to paste into backend/.env as
// GOOGLE_REFRESH_TOKEN. Never share that value once printed - it grants
// ongoing access to send mail and create files as that Google account.
//
// Usage:
//   node scripts/getGoogleRefreshToken.js
const dotenv = require('dotenv');
const readline = require('readline');
const { google } = require('googleapis');

dotenv.config();

const SCOPES = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/spreadsheets',
];

const run = async () => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: SCOPES,
    });

    console.log('\n1. Open this URL and sign in as your sending Gmail account:\n');
    console.log(authUrl);
    console.log('\n2. After approving, Google will redirect to your GOOGLE_REDIRECT_URI with a ?code=... in the URL.');
    console.log('   (The page itself may show an error since nothing is listening there yet - that is fine, just copy the code from the address bar.)\n');

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Paste the code here: ', async (code) => {
        rl.close();
        try {
            const { tokens } = await oauth2Client.getToken(code.trim());
            if (!tokens.refresh_token) {
                console.error('\nNo refresh_token returned. This usually means you already authorized this app before - revoke access at https://myaccount.google.com/permissions and try again.');
                process.exit(1);
            }
            console.log('\nSuccess! Add this line to backend/.env:\n');
            console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
            process.exit(0);
        } catch (error) {
            console.error('\nFailed to exchange code for tokens:', error.message);
            process.exit(1);
        }
    });
};

run();
