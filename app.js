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

const { getAccessToken, exchangeForTokens } = require("./user/userController");

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
  console.log("Hey");
  const authUrl =
    `https://app.hubspot.com/oauth/authorize?` +
    `client_id=${encodeURIComponent(CLIENT_ID)}&` +
    `scope=${encodeURIComponent(SCOPES)}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}`; // Send authUrl back to the frontend

  res.json({ authUrl });
});

app.get("/callback", async (req, res) => {
  console.log(
    "HUBSPOT GAVE ME BACK MY TOKEN, I AM HANDLING IT NOW IN THE CALLBACK"
  );

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
  res.redirect("http://localhost:3000/done");
});

app.get("/", async (req, res) => {
  // if (refreshToken[req.sessionID]) {
  //   res.redirect("http://localhost:3000/dashboard");
  // } else {
  console.log("hey");
  res.redirect("/login");
  // }
});

app.get("/dashboard", async (req, res) => {
  const accessToken = tokenCache.get("accessToken");
  try {
    const response = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/contacts/?properties=email,firstname,lastname,jobtitle,company`,
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
        firstname: contact.properties.firstname, // Assuming 'firstname' is correctly populated
        lastname: contact.properties.lastname, // Assuming 'firstname' is correctly populated
        email: contact.properties.email,
        // createdAt: dateCoverter(contact.createdAt),
        company: contact.properties.company,
        jobtitle: contact.properties.jobtitle,
      };
    });
    // if (response.data.paging) contacts.after = response.data.paging.next.after;
    res.json(contacts);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error);
    res.status(500).json({ error: "Failed to fetch contacts" }); // Send error response  }
  }
});

app.listen(PORT, () => console.log(`Listening on PORT:${PORT}`));
