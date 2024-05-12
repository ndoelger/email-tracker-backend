require("dotenv").config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
let SCOPES = process.env.SCOPES;
const PORT = 3001;

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const axios = require("axios");
const session = require("express-session");

const app = express();

let refreshToken = {};

const tokenCache = require("./cache");
const {
  getAuthorization,
  getAccessToken,
  exchangeForTokens,
} = require("./user/userController");

app.use(express.json());
app.use(cors());

app.use(express.static("public"));

app.use(
  session({
    secret: Math.random().toString(36).substring(2),
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/login", (req, res) => {
  const authUrl =
    "https://app.hubspot.com/oauth/authorize" +
    `?client_id=${encodeURIComponent(CLIENT_ID)}` + // app's client ID
    `&scope=${encodeURIComponent(SCOPES)}` + // scopes being requested by the app
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`; // where to send the user after the consent page

  res.redirect(authUrl);
});

app.get("/callback", async (req, res) => {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    code: req.query.code,
  });

  const tokens = await exchangeForTokens(req.sessionID, params);
  refreshToken[req.sessionID] = tokens.refresh_token;
  console.log(refreshToken);
  // Once the tokens have been retrieved, use them to make a query
  // to the HubSpot API
  res.redirect(`/`);
});

app.get("/", async (req, res) => {
  console.log(refreshToken);
  if (refreshToken[req.sessionID]) {
    res.redirect("/dashboard");
  } else {
    res.redirect("/login");
  }
});

app.get("/contacts", async (req, res) => {
  const accessToken = await getAccessToken(req.sessionID);
  console.log(accessToken);
  try {
    const response = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/contacts/?limit=10&properties=email,firstname,lastname,jobtitle,company`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const contacts = response.data.results.map((contact) => {
      return {
        id: contact.id,
        firstname: contact.properties.firstname || "N/A", // Safe access
        lastname: contact.properties.lastname || "N/A", // Safe access
        email: contact.properties.email || "N/A",
        // createdAt: dateCoverter(contact.createdAt),
        company: contact.properties.company || "N/A",
        jobtitle: contact.properties.jobtitle || "N/A",
      };
    });
    if (response.data.paging) contacts.after = response.data.paging.next.after;

    res.json(contacts); // Send contacts array as JSON response
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error);
    res.status(500).json({ error: "Failed to fetch contacts" }); // Send error response
  }
});

app.listen(PORT, () => console.log(`Listening on PORT:${PORT}`));
