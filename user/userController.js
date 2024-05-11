require("dotenv").config();
const axios = require("axios")

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
let SCOPES = process.env.SCOPES;

const getAuthorization = (req, res) => {
  const authURL = `https://app.hubspot.com/oauth/authorize?client_id=${encodeURIComponent(
    CLIENT_ID
  )}&scope=${encodeURIComponent(SCOPES)}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}`;
  res.redirect(authURL);
};

const getAccessToken = async (req, res) => {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    code: req.query.code,
  });

  try {
    const response = await axios.post(
      "https://api.hubapi.com/oauth/v1/token",
      params.toString(), // Converts the parameters to URL-encoded string
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    tokens = response.data;

    accessToken = tokens.access_token;
    refreshToken = tokens.refresh_token;

    res.json(accessToken);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error);
    res.status(500).send("Failed to retrieve access token");
  }
};

module.exports = {
  getAuthorization,
  getAccessToken,
};
