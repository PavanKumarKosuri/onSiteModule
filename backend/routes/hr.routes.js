// backend\routes\hr.routes.js
const express = require("express");
const router = express.Router();
const hrController = require("../controllers/hr.controller");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/hrimport/upload-excel", hrController.uploadExcel);
router.get("/hrimport/get-all-hrdata", hrController.getAllHrData);
router.put("/hrimport/update-hr/:id", hrController.updateHrData);
router.delete("/hrimport/delete-hr/:id", hrController.deleteHrData);
router.post("/hrimport/add-hr", hrController.addHrData);
router.get("/hrimport/get-unique-key", hrController.getUniqueKey);
router.get("/hrimport/get-last-entries", hrController.getLastEntries);
router.get(
  "/validate-hr/:city/:companyName/:uniqueKey",
  hrController.validateHr
);
router.post(
  "/eligibleEmployees/upload",
  upload.single("file"),
  hrController.eligibleEmployees
);

module.exports = router;
