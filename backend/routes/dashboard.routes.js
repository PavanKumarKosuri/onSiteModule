const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");

router.get("/users/filter", dashboardController.filterUsers);
router.post("/generateqr", dashboardController.generateQr);
router.get("/users/dashboard-data", dashboardController.fetchDashboardData);
router.get("/users/city-options", dashboardController.getCityOptions);
router.get("/users/company-name-options", dashboardController.getCompanyNameOptions);
router.get("/verify-employee", dashboardController.verifyEmployee);

module.exports = router;
