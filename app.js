require("dotenv").config();

const PORT = 3001;

const express = require("express");
const cors = require("cors");

const app = express();

const userRouter = require("./user/userRouter");
const emailRouter = require("./email/emailRouter");

// PARSES JSON BODIES
app.use(express.json());
// LETS LOCALHOST:3000 TALK TO 3001
app.use(cors());

// APP ROUTES
app.use("/login", userRouter);
app.use("/email", emailRouter);

app.listen(PORT, () => console.log(`Listening on PORT:${PORT}`));
