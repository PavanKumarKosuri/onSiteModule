const { db } = require("../config/db.config");

const getVendorReports = (req, res) => {
  const { name, phoneNumber } = req.query;
  let sql = "SELECT * FROM vendors WHERE 1=1";
  const params = [];

  if (name) {
    sql += " AND name = ?";
    params.push(name);
  }

  if (phoneNumber) {
    sql += " AND phoneNumber = ?";
    params.push(phoneNumber);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error retrieving vendor reports:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json(results);
  });
};

const addVendorReport = (req, res) => {
  const { id, name, phoneNumber, otherDetails } = req.body;
  const sql = "INSERT INTO vendors (id, name, phoneNumber, otherDetails) VALUES (?, ?, ?, ?)";
  const params = [id, name, phoneNumber, otherDetails];

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error adding vendor:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(201).json({ id: results.insertId });
  });
};

const updateVendorReport = (req, res) => {
  const { id } = req.params;
  const { name, phoneNumber, otherDetails } = req.body;
  const sql = "UPDATE vendors SET name = ?, phoneNumber = ?, otherDetails = ? WHERE id = ?";
  const params = [name, phoneNumber, otherDetails, id];

  db.query(sql, params, (err) => {
    if (err) {
      console.error("Error updating vendor report:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "Vendor report updated successfully" });
  });
};

const deleteVendorReport = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM vendors WHERE id = ?";
  const params = [id];

  db.query(sql, params, (err) => {
    if (err) {
      console.error("Error deleting vendor report:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "Vendor report deleted successfully" });
  });
};

module.exports = {
  getVendorReports,
  addVendorReport,
  updateVendorReport,
  deleteVendorReport,
};
