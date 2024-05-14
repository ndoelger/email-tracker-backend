require("dotenv").config();

const PORT = 3001;

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const axios = require("axios");
const session = require("express-session");

const app = express();

const tokenCache = require("./util/cache");

const userRouter = require("./user/userRouter");
const emailRouter = require("./email/emailRouter");

app.use(express.json());
app.use(cors());

app.use(express.static("public"));

app.use("/login", userRouter);
app.use("/email", emailRouter);

app.listen(PORT, () => console.log(`Listening on PORT:${PORT}`));
