const express = require("express");
const router = express.Router();
const ltController = require("../controllers/lt.controller");

router.post("/lt/login", ltController.login);
router.post("/change-password/lt", ltController.changePassword);

module.exports = router;
