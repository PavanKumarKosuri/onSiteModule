const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.get("/user/:phoneNumber", userController.getUserId);
router.put("/users/:id", userController.updateReportsTaken);
router.put(
  "/users/reports-taken/:bookingId",
  userController.updateReportsTakenByBookingId
);
router.get("/users/:id/reports-taken", userController.getReportsTaken);
router.get(
  "/users/reports-taken/:bookingId",
  userController.getReportsTakenByBookingId
);
router.post("/user", userController.createUser);
router.post("/user/update", userController.updateUser);
router.post("/users", userController.postUsers);
router.get("/users", userController.getAllUsers);
router.put("/users/timeslot/:id", userController.updateTimeSlot);
router.delete("/users/:id", userController.deleteUser);
router.put("/users/reports/:id", userController.updateUserReports);

module.exports = router;
