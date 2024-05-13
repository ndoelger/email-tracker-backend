require("dotenv").config();
const axios = require("axios");
const tokenCache = require("../cache");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
let SCOPES = process.env.SCOPES;

const getUrl = (req, res) => {
  const authUrl =
    `https://app.hubspot.com/oauth/authorize?` +
    `client_id=${encodeURIComponent(CLIENT_ID)}&` +
    `scope=${encodeURIComponent(SCOPES)}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}`; // Send authUrl back to the frontend

  res.json({ authUrl });
};

const getAccessToken = async (req, res) => {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    code: req.query.code,
  });

  console.log(req.params);

  const tokens = await exchangeForTokens(req.sessionID, params);
  // refreshToken[req.sessionID] = tokens.refresh_token;
  // Once the tokens have been retrieved, use them to make a query
  // to the HubSpot API
  // res.json(tokens.access_token);
  res.redirect("http://localhost:3000/dashboard");
};

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

    tokenCache.set(
      "accessToken",
      accessToken,
      Math.round(tokens.expires_in * 0.75)
    ); // do you know if this works?

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

// const isAuthorized = (userId) => {
//   return refreshTokenStore[userId] ? true : false;
// };

module.exports = {
  getUrl,
  getAccessToken,
  exchangeForTokens,
  // refreshAccessToken,
  // isAuthorized,
};
