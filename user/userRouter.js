const express = require("express");
const router = express.Router();
const usersCtrl = require("./userController");


router.get("/login", usersCtrl.getAuthorization);
router.get("/oauth-callback", usersCtrl.getAccessToken);

module.exports = router;
