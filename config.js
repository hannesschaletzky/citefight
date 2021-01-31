// config.js
const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  TEST_VAR: process.env.TEST_VAR,
  SERVER_TWITTER_API_Key: process.env.SERVER_TWITTER_API_Key,
  SERVER_TWITTER_API_Secret: process.env.SERVER_TWITTER_API_Secret,
  SERVER_TWITTER_Access_Token: process.env.SERVER_TWITTER_Access_Token,
  SERVER_TWITTER_Access_Token_Secret: process.env.SERVER_TWITTER_Access_Token_Secret,

  SERVER_TWITTER_API_BEARER: process.env.SERVER_TWITTER_API_BEARER,

  SERVER_TWITTER_NONCE: process.env.SERVER_TWITTER_NONCE,
  SERVER_TWITTER_OAUTHV: process.env.SERVER_TWITTER_OAUTHV
};