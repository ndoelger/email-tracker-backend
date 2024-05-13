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

const userRouter = require("./user/userRouter")
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

app.use("/login", userRouter)





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
      `https://api.hubapi.com/marketing/v3/emails`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const emails = response.data.results.map((email) => {
      console.log(email)
      return {
        id: email.id,
        subject: email.subject,
        preview: email.content.widgets.preview_text.body.value,
        email: email.name,
        // createdAt: dateCoverter(contact.createdAt),
      };
    });
    // if (response.data.paging) contacts.after = response.data.paging.next.after;
    res.json(emails);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error);
    res.status(500).json({ error: "Failed to fetch contacts" }); // Send error response  }
  }
});

app.listen(PORT, () => console.log(`Listening on PORT:${PORT}`));
