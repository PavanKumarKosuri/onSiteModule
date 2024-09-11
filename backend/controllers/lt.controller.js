const bcrypt = require('bcrypt');
const { db } = require("../config/db.config");
const saltRounds = 10;
const plainTextPasswordforlt = "lt123";

const createLtUser = () => {
  db.query("SELECT * FROM ltadmin WHERE username = 'lt'", (err, results) => {
    if (err) {
      console.error("Error checking for existing lt user:", err);
      return;
    }

    if (results.length === 0) {
      bcrypt.hash(plainTextPasswordforlt, saltRounds, (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
          return;
        }

        const sql = "INSERT INTO ltadmin (username, password) VALUES (?, ?)";
        db.query(sql, ["lt", hash], (err) => {
          if (err) {
            console.error("Error inserting lt credentials:", err);
            return;
          }
        });
      });
    }
  });
};

const login = (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM ltadmin WHERE username = ?";
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error("Error verifying lt credentials:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    if (results.length === 0) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const hashedPassword = results[0].password;
    bcrypt.compare(password, hashedPassword, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      if (!isMatch) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }
      res.status(200).json({ message: "Login successful" });
    });
  });
};

const changePassword = (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const username = "lt";

  const sql = "SELECT * FROM ltadmin WHERE username = ?";
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error("Error fetching lt details:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: "lt not found" });
      return;
    }

    const hashedPassword = results[0].password;
    bcrypt.compare(oldPassword, hashedPassword, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }

      if (!isMatch) {
        res.status(401).json({ error: "Incorrect old password" });
        return;
      }

      bcrypt.hash(newPassword, saltRounds, (err, newHash) => {
        if (err) {
          console.error("Error hashing new password:", err);
          res.status(500).json({ error: "Internal Server Error" });
          return;
        }

        const updateSql = "UPDATE ltadmin SET password = ? WHERE username = ?";
        db.query(updateSql, [newHash, username], (err) => {
          if (err) {
            console.error("Error updating password:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
          }
          res.status(200).json({ message: "Password updated successfully" });
        });
      });
    });
  });
};

module.exports = {
  createLtUser,
  login,
  changePassword,
};
