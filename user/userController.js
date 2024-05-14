require("dotenv").config();
const axios = require("axios");
const tokenCache = require("../util/cache");
const prisma = require("../prisma/prismaClient");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
let SCOPES = process.env.SCOPES;

const getUrl = (req, res) => {
  console.log("FETCHING AUTHENTICATION FOR FRONTEND");
  const authUrl =
    `https://app.hubspot.com/oauth/authorize?` +
    `client_id=${encodeURIComponent(CLIENT_ID)}&` +
    `scope=${encodeURIComponent(SCOPES)}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

  res.json({ authUrl });
};

const getAccessToken = async (req, res) => {
  console.log("RECEIVED AUTHORIZATION CODE, NOW EXCHANGING FOR TOKENS");
  const accessParams = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    code: req.query.code,
  });

  const tokens = await exchangeForTokens(accessParams);

  console.log("RETURNING TO FRONTEND WITH TOKENS");

  res.redirect("http://localhost:3000/dashboard");
};

const exchangeForTokens = async (form) => {
  try {
    const response = await axios.post(
      "https://api.hubapi.com/oauth/v1/token",
      form.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log(response);

    console.log("TOKENS RECEIVED");

    tokens = response.data;

    accessToken = tokens.access_token;
    refreshToken = tokens.refresh_token;
    expires_in = tokens.expires_in;

    console.log("SETTING/RESETTING ACCESS AND REFRESH TOKENS IN BACKEND CACHE");

    tokenCache.set(ACCESS_SECRET, accessToken, expires_in * 0.75);
    tokenCache.set(REFRESH_SECRET, refreshToken);

    console.log("ADDING/UPDATING TOKENS IN DATABASE");

    await prisma.user.upsert({
      where: {
        refresh_token: refreshToken,
      },
      update: {
        access_token: accessToken,
      },
      create: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    });

    return tokens;
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error);
  }
};

const refreshAccessToken = async (req, res) => {
  console.log(
    "ACCESS TOKEN HAS EXPIRED, RETRIEVING A NEW CODE WITH THE REFRESH TOKEN"
  );
  const refreshParams = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    refresh_token: tokenCache.get(REFRESH_SECRET),
  });

  const tokens = await exchangeForTokens(refreshParams);

  console.log("RETURNING TO FRONTEND WITH NEW TOKENS");

  res.redirect("http://localhost:3000/dashboard");
};

module.exports = {
  getUrl,
  getAccessToken,
  exchangeForTokens,
  refreshAccessToken,
};
