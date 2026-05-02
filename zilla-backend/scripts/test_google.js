const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

async function test() {
  console.log('ID:', process.env.GOOGLE_CLIENT_ID);
  console.log('Secret:', process.env.GOOGLE_CLIENT_SECRET);
  console.log('Redirect:', process.env.GOOGLE_REDIRECT_URI);
  
  try {
    // This will fail because 'test' is not a valid code, 
    // but if it says 'invalid_grant' it means the client is valid.
    // If it says 'invalid_client', it means the credentials are bad.
    await client.getToken('test_code');
  } catch (err) {
    console.log('Error Data:', err.response?.data);
  }
}

test();
