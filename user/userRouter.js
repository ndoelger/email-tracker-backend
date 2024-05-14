const express = require("express");
const router = express.Router();
const usersCtrl = require("./userController");

router.get("/", usersCtrl.getUrl);
router.get("/callback/refresh", usersCtrl.refreshAccessToken);
router.get("/callback", usersCtrl.getAccessToken);

module.exports = router;
