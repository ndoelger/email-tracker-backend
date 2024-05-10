require("dotenv").config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const SCOPES = process.env.SCOPES;

const authURL = `https://app.hubspot.com/oauth/authorize
  ?client_id=${encodeURIComponent(CLIENT_ID)}
  &scope=${SCOPES} 
  &redirect_uri=${REDIRECT_URI}`;
