require("dotenv").config();
const axios = require("axios");
const tokenCache = require("../cache");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
let SCOPES = process.env.SCOPES;

const exchangeForTokens = async (id, form) => {
  try {
    const response = await axios.post(
      "https://api.hubapi.com/oauth/v1/token",
      form.toString(), // Converts the parameters to URL-encoded string
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    tokens = response.data;

    accessToken = tokens.access_token;
    refreshToken = tokens.refresh_token;
    expires_in = tokens.expires_in;

    tokenCache.set(id, accessToken, Math.round(tokens.expires_in * 0.75));

    return tokens;
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error);
  }
};

// const refreshAccessToken = async (userId) => {
//   const refreshTokenProof = {
//     grant_type: "refresh_token",
//     client_id: CLIENT_ID,
//     client_secret: CLIENT_SECRET,
//     redirect_uri: REDIRECT_URI,
//     refresh_token: refreshTokenStore[userId],
//   };
//   return await exchangeForTokens(userId, refreshTokenProof);
// };

const getAccessToken = async (userId) => {
  return tokenCache.get(userId);
};

// const isAuthorized = (userId) => {
//   return refreshTokenStore[userId] ? true : false;
// };

module.exports = {
  getAccessToken,
  exchangeForTokens,
  // refreshAccessToken,
  // isAuthorized,
};
