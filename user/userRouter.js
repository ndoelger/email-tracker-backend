const express = require("express");
const router = express.Router();
const usersCtrl = require("./userController");

router.get("/", usersCtrl.getUrl);
// FOR REFRESHING ACCESS TOKEN
router.get("/callback/refresh", usersCtrl.refreshAccessToken);
// CALLBACK FUNCTION
router.get("/callback", usersCtrl.getAccessToken);

module.exports = router;
