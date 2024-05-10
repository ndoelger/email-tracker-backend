require("dotenv").config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const SCOPES = process.env.SCOPES;
const PORT = 3001;

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

app.get("/install", function (req, res) {
  console.log(CLIENT_ID);
  const authURL = `https://app.hubspot.com/oauth/authorize?client_id=${encodeURIComponent(
    CLIENT_ID
  )}&scope=${encodeURIComponent([
    "crm.objects.contacts.read",
  ])}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

  console.log(authURL);
  res.redirect(authURL);
});

app.listen(PORT, () => console.log(`Listening on PORT:${PORT}`));
