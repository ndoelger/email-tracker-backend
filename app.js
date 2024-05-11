require("dotenv").config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const SCOPES = process.env.SCOPES;
const PORT = 3001;

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const axios = require("axios");

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

app.get("/", (req, res) => {
  const authURL = `https://app.hubspot.com/oauth/authorize?client_id=${encodeURIComponent(
    CLIENT_ID
  )}&scope=${encodeURIComponent([
    "crm.objects.contacts.read",
  ])}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

  res.redirect(authURL);
});

// Callback
app.get("/oauth-callback", async (req, res) => {
  if (req.query.code) {
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

      res.send(response.data); // Sends the tokens as response
    } catch (error) {
      console.error("Error:", error.response.data); // More detailed error logging
      res.status(500).send("Failed to retrieve access token");
    }
  }
});

app.listen(PORT, () => console.log(`Listening on PORT:${PORT}`));
