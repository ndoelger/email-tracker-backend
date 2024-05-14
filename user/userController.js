require("dotenv").config();
const axios = require("axios");
const tokenCache = require("../util/cache");
const prisma = require("../prisma/prismaClient");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const ID_SECRET = process.env.ID_SECRET;
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

    console.log("TOKENS RECEIVED");

    const tokens = response.data;

    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;
    const expires_in = tokens.expires_in;

    console.log("SETTING/RESETTING ACCESS AND REFRESH TOKENS IN BACKEND CACHE");

    tokenCache.set(ACCESS_SECRET, accessToken, expires_in * 0.75);
    tokenCache.set(REFRESH_SECRET, refreshToken);

    console.log("ADDING/UPDATING TOKENS IN DATABASE");

    const userInfo = await axios.get(
      `https://api.hubapi.com/oauth/v1/refresh-tokens/${refreshToken}`
    );

    const userData = {
      hub_domain: userInfo.data.hub_domain,
      hub_id: userInfo.data.hub_id,
    };

    tokenCache.set(ID_SECRET, userData.hub_id);


    await prisma.user.upsert({
      where: { hub_id: userData.hub_id },
      update: {
        hub_domain: userData.hub_domain,
        hub_id: userData.hub_id,
      },
      create: {
        hub_domain: userData.hub_domain,
        hub_id: userData.hub_id,
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
