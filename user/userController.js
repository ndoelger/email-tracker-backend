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

console.log("it made it");

const getUrl = (req, res) => {
  const authUrl =
    `https://app.hubspot.com/oauth/authorize?` +
    `client_id=${encodeURIComponent(CLIENT_ID)}&` +
    `scope=${encodeURIComponent(SCOPES)}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}`; // Send authUrl back to the frontend

  res.json({ authUrl });
};

const getAccessToken = async (req, res) => {
  const accessParams = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    code: req.query.code,
  });

  const tokens = await exchangeForTokens(accessParams);

  res.redirect("http://localhost:3000/dashboard");
};

const exchangeForTokens = async (form) => {
  console.log(form.toString());
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

    // console.log("response", response)
    tokens = response.data;
    // console.log(tokens)

    accessToken = tokens.access_token;
    refreshToken = tokens.refresh_token;
    expires_in = tokens.expires_in;

    tokenCache.set(ACCESS_SECRET, accessToken, expires_in * 0.75);
    tokenCache.set(REFRESH_SECRET, refreshToken);

    await prisma.user.upsert({
      where: {
        refresh_token: refreshToken, // This is now a valid unique identifier
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
  const refreshParams = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    refresh_token: tokenCache.get(REFRESH_SECRET),
  });

  const tokens = await exchangeForTokens(refreshParams);

  res.redirect("http://localhost:3000/dashboard");
};

module.exports = {
  getUrl,
  getAccessToken,
  exchangeForTokens,
  refreshAccessToken,
};
