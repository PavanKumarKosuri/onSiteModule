const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vendor.controller");

router.get("/vendors-reports", vendorController.getVendorReports);
router.post("/vendors-reports", vendorController.addVendorReport);
router.put("/vendors-reports/:id", vendorController.updateVendorReport);
router.delete("/vendors-reports/:id", vendorController.deleteVendorReport);

module.exports = router;
