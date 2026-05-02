const { OAuth2Client } = require('google-auth-library');
const { env } = require('../config/env');

const client = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

/**
 * Generate the Google Auth URL.
 */
const getGoogleAuthUrl = () => {
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    prompt: 'consent'
  });
};

/**
 * Verify the Google code and get user info.
 */
const getGoogleUserInfo = async (code) => {
  try {
    console.log('🔄 Attempting token exchange with code...');
    console.log('📍 Using Redirect URI:', env.GOOGLE_REDIRECT_URI);
    
    // Explicitly passing credentials to getToken can sometimes resolve library-level caching issues
    const { tokens } = await client.getToken({
      code: code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_REDIRECT_URI
    });
    
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_CLIENT_ID,
    });

    return ticket.getPayload();
  } catch (err) {
    console.error('❌ Google Token Exchange Error Details:');
    if (err.response?.data) {
      console.error('Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Message:', err.message);
    }
    throw err;
  }
};

module.exports = {
  getGoogleAuthUrl,
  getGoogleUserInfo,
};
