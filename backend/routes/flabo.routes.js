const express = require("express");
const router = express.Router();
const flaboController = require("../controllers/flabo.controller");

router.post("/flabo/register", flaboController.registerFlabo);
router.get("/flabos-reports", flaboController.getFlaboReports);
router.post("/flabos-reports", flaboController.createFlaboReport);
router.put("/flabos-reports/:id", flaboController.updateFlaboReport);
router.delete("/flabos-reports/:id", flaboController.deleteFlaboReport);

module.exports = router;
