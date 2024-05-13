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

const userRouter = require("./user/userRouter");
const emailRouter = require("./email/emailRouter");

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

app.use("/login", userRouter);
app.use("/email", emailRouter);

app.listen(PORT, () => console.log(`Listening on PORT:${PORT}`));
