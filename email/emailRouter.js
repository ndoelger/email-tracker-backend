const express = require("express");
const router = express.Router();
const emailCtrl = require("./emailController");

router.get("/", emailCtrl.getEmails);
router.post("/add", emailCtrl.addEmail);
router.delete("/:id", emailCtrl.deleteEmail);
router.patch("/:id", emailCtrl.editEmail);


module.exports = router;
