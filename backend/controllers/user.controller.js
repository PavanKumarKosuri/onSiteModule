const moment = require("moment-timezone");
const { db } = require("../config/db.config");

const getUserId = (req, res) => {
  const phoneNumber = req.params.phoneNumber;
  const sql = "SELECT id FROM users WHERE phoneNumber = ?";
  db.query(sql, [phoneNumber], (err, result) => {
    if (err) {
      console.error("Error retrieving userId:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const userId = result[0].id;
    res.status(200).json({ userId });
  });
};

const updateReportsTaken = (req, res) => {
  const userId = req.params.id;
  const { ReportsTaken, additionalInfo } = req.body;
  const sql =
    "UPDATE users SET ReportsTaken = ?, additionalInfo = ? WHERE id = ?";
  db.query(sql, [ReportsTaken, additionalInfo, userId], (err, result) => {
    if (err) {
      console.error(
        "Error updating ReportsTaken status and additionalInfo:",
        err
      );
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({
      message: "ReportsTaken status and additionalInfo updated successfully",
    });
  });
};

const updateReportsTakenByBookingId = (req, res) => {
  const bookingId = req.params.bookingId;
  const { ReportsTaken, additionalInfo } = req.body;
  const sql =
    "UPDATE users SET ReportsTaken = ?, additionalInfo = ? WHERE bookingId = ?";
  db.query(sql, [ReportsTaken, additionalInfo, bookingId], (err, result) => {
    if (err) {
      console.error(
        "Error updating ReportsTaken status and additionalInfo:",
        err
      );
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({
      message: "ReportsTaken status and additionalInfo updated successfully",
    });
  });
};

const getReportsTaken = (req, res) => {
  const userId = req.params.id;
  const sql = "SELECT ReportsTaken, additionalInfo FROM users WHERE id = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error(
        "Error retrieving ReportsTaken status and additionalInfo:",
        err
      );
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const { ReportsTaken, additionalInfo } = result[0];
    res.status(200).json({ ReportsTaken, additionalInfo });
  });
};

const getReportsTakenByBookingId = (req, res) => {
  const bookingId = req.params.bookingId;

  const sql =
    "SELECT patientName, phoneNumber, reportsTaken, additionalInfo FROM users WHERE bookingId = ?";
  db.query(sql, [bookingId], (err, result) => {
    if (err) {
      console.error(
        "Error retrieving reportsTaken status and additionalInfo:",
        err
      );
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const { patientName, phoneNumber, reportsTaken, additionalInfo } =
      result[0];
    res
      .status(200)
      .json({ patientName, phoneNumber, reportsTaken, additionalInfo });
  });
};

const createUser = (req, res) => {
  const { phoneNumber } = req.body;

  db.query(
    "SELECT * FROM users WHERE phoneNumber = ?",
    [phoneNumber],
    (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }

      if (results.length > 0) {
        res.send(results[0]);
      } else {
        const newUser = {
          phoneNumber: phoneNumber,
          patientName: "",
          employeeId: "",
          email: "",
          gender: "",
          reportsTaken: 0,
        };
        db.query("INSERT INTO users SET ?", newUser, (err, result) => {
          if (err) {
            return res.status(500).send(err);
          }
          newUser.id = result.insertId;
          res.send(newUser);
        });
      }
    }
  );
};

const updateUser = (req, res) => {
  const {
    phoneNumber,
    patientName,
    employeeId,
    email,
    age,
    gender,
    package: selectedPackage,
    subPackage: selectedSubPackage,
    bookingId,
    city,
    companyName,
  } = req.body;
  const sql = `
    UPDATE users 
    SET 
      patientName = ?, 
      employeeId = ?, 
      email = ?, 
      age = ?, 
      gender = ?, 
      package = ?, 
      subPackage=?,
      bookingId = ?, 
      city = ?, 
      companyName = ? 
    WHERE phoneNumber = ?
  `;
  const values = [
    patientName,
    employeeId,
    email,
    age,
    gender,
    selectedPackage,
    selectedSubPackage,
    bookingId,
    city,
    companyName,
    phoneNumber,
  ];
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating user details:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({ message: "User details updated successfully." });
  });
};

const getAllUsers = (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error retrieving users:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json(results);
  });
};

const deleteUser = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM users WHERE id = ?";
  const params = [id];

  db.query(sql, params, (err) => {
    if (err) {
      console.error("Error deleting user:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "User deleted successfully" });
  });
};

const updateUserReports = (req, res) => {
  const { id } = req.params;
  const {
    phoneNumber,
    patientName,
    employeeId,
    email,
    age,
    gender,
    package,
    subPackage,
    bookingId,
    reportsTaken,
    additionalInfo,
    city,
    companyName,
    timeslot,
  } = req.body;

  const sql = `
    UPDATE users 
    SET phoneNumber = ?, patientName = ?, employeeId = ?, email = ?, 
        age = ?, gender = ?, package = ?, subPackage = ?, bookingId = ?, reportsTaken = ?, 
        additionalInfo = ?, city = ?, companyName = ?, timeslot = ? 
    WHERE id = ?
  `;
  const params = [
    phoneNumber,
    patientName,
    employeeId,
    email,
    age,
    gender,
    package,
    subPackage,
    bookingId,
    reportsTaken,
    additionalInfo,
    city,
    companyName,
    timeslot,
    id,
  ];

  db.query(sql, params, (err) => {
    if (err) {
      console.error("Error updating user:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "User updated successfully" });
  });
};

const updateTimeSlot = (req, res) => {
  const { id } = req.params;

  const sqlGetUsers = "SELECT * FROM users ORDER BY id ASC";
  db.query(sqlGetUsers, (err, results) => {
    if (err) {
      console.error("Error retrieving users:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    const users = results;
    const timeSlots = [
      "10AM - 11AM",
      "11AM - 12PM",
      "12PM - 1PM",
      "2PM - 3PM",
      "3PM - 4PM",
    ];

    const now = moment().tz("Asia/Kolkata");
    const currentHour = now.hour();
    const currentDay = now.date();

    let nextDay = currentHour >= 16 ? 1 : 0;
    let timeSlot;
    for (let i = 0; i < users.length; i++) {
      if (users[i].id == id) {
        const dayOffset = Math.floor(i / 35) + nextDay;
        const slotIndex = (i % 35) % 5;
        const date = now.clone().add(dayOffset, "days");
        const dateString = date.format("YYYY-MM-DD");
        timeSlot = `${timeSlots[slotIndex]} on ${dateString}`;
        break;
      }
    }

    const sqlUpdateUser = "UPDATE users SET timeSlot = ? WHERE id = ?";
    db.query(sqlUpdateUser, [timeSlot, id], (err) => {
      if (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.status(200).json({ timeSlot });
    });
  });
};

const postUsers = (req, res) => {
  const {
    phoneNumber,
    patientName,
    employeeId,
    email,
    age,
    gender,
    package,
    subPackage,
    bookingId,
    reportsTaken,
    additionalInfo,
    city,
    companyName,
  } = req.body;

  const sql =
    "INSERT INTO users (phoneNumber, patientName, employeeId, email, age, gender, package, subPackage, bookingId, reportsTaken, additionalInfo, city, companyName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const params = [
    phoneNumber,
    patientName,
    employeeId,
    email,
    age,
    gender,
    package,
    subPackage,
    bookingId,
    reportsTaken,
    additionalInfo,
    city,
    companyName,
  ];

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error adding user:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    const userId = results.insertId;

    // Assign time slot to the new user
    const sqlGetUsers = "SELECT * FROM users ORDER BY id ASC";
    db.query(sqlGetUsers, (err, results) => {
      if (err) {
        console.error("Error retrieving users:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }

      const users = results;
      const timeSlots = [
        "10AM - 11AM",
        "11AM - 12PM",
        "12PM - 1PM",
        "2PM - 3PM",
        "3PM - 4PM",
      ];

      const now = new Date();
      const currentHour = now.getHours();
      const currentDay = now.getDate();

      let nextDay = currentHour >= 16 ? 1 : 0;
      let timeSlot;
      for (let i = 0; i < users.length; i++) {
        if (users[i].id == userId) {
          const dayOffset = Math.floor(i / 35) + nextDay;
          const slotIndex = (i % 35) % 5;
          const date = new Date();
          date.setDate(currentDay + dayOffset);
          const dateString = date.toISOString().split("T")[0];
          timeSlot = `${timeSlots[slotIndex]} on ${dateString}`;
          break;
        }
      }

      const sqlUpdateUser = "UPDATE users SET timeSlot = ? WHERE id = ?";
      db.query(sqlUpdateUser, [timeSlot, userId], (err) => {
        if (err) {
          console.error("Error updating user:", err);
          res.status(500).json({ error: "Internal Server Error" });
          return;
        }
        res.status(201).json({ id: userId, timeSlot });
      });
    });
  });
};

module.exports = {
  getUserId,
  createUser,
  updateUserReports,
  deleteUser,
  updateTimeSlot,
  updateUser,
  getAllUsers,
  getReportsTakenByBookingId,
  getReportsTaken,
  updateReportsTakenByBookingId,
  updateReportsTaken,
  postUsers,
};
