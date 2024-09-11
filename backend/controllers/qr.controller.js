// backend\controllers\qr.controller.js
const { db } = require("../config/db.config");

const getQrReports = (req, res) => {
  const { city, companyName } = req.query;
  let sql = "SELECT * FROM generateqr WHERE 1=1";
  const params = [];

  if (city) {
    sql += " AND city = ?";
    params.push(city);
  }

  if (companyName) {
    sql += " AND companyName = ?";
    params.push(companyName);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error retrieving QR reports:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json(results);
  });
};

const addQrReport = (req, res) => {
  const { city, companyName, package1, package2, package3, package4 } =
    req.body;
  const sql =
    "INSERT INTO generateqr (city, companyName, package1, package2, package3, package4) VALUES (?, ?, ?, ?, ?, ?)";
  const params = [city, companyName, package1, package2, package3, package4];

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error adding QR report:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(201).json({ id: results.insertId });
  });
};

const updateQrReport = (req, res) => {
  const { id } = req.params;
  const { city, companyName, package1, package2, package3, package4 } =
    req.body;

  const sql = `
    UPDATE generateqr
    SET city = ?, companyName = ?, package1 = ?, package2 = ?, package3 = ?, package4 = ?
    WHERE id = ?
  `;
  const params = [
    city,
    companyName,
    package1,
    package2,
    package3,
    package4,
    id,
  ];

  db.query(sql, params, (err) => {
    if (err) {
      console.error("Error updating QR report:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "QR report updated successfully" });
  });
};

const deleteQrReport = (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM generateqr
    WHERE id = ?
  `;
  const params = [id];

  db.query(sql, params, (err) => {
    if (err) {
      console.error("Error deleting QR report:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "QR report deleted successfully" });
  });
};

const getUserByEmployeeId = (req, res) => {
  const { employeeId } = req.query;
  const sql = "SELECT * FROM users WHERE employeeId = ?";
  db.query(sql, [employeeId], (err, results) => {
    if (err) {
      console.error("Error retrieving user by employee ID:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (results.length === 0) {
      res.json(null); // User not found
    } else {
      res.json(results[0]); // Send the user data
    }
  });
};

const getGenerateQr = (req, res) => {
  const { city, companyName } = req.query;
  let sql = "SELECT * FROM generateqr WHERE 1=1";
  const params = [];

  if (city) {
    sql += " AND city = ?";
    params.push(city);
  }

  if (companyName) {
    sql += " AND companyName = ?";
    params.push(companyName);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error retrieving generateqr data:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json(results);
  });
};

const getAllGenerateQr = (req, res) => {
  const sql = "SELECT * FROM generateqr";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error retrieving generateqr data:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
};

const getPackagesByGenerateQrId = (req, res) => {
  const { generateqrId } = req.params;
  const sql = "SELECT * FROM packages WHERE generateqr_id = ?";
  db.query(sql, [generateqrId], (err, results) => {
    if (err) {
      console.error("Error retrieving packages:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json(results);
  });
};
``;
const getSubpackagesByPackageId = (req, res) => {
  const { packageId } = req.params;
  const sql = "SELECT * FROM subpackages WHERE package_id = ?";
  db.query(sql, [packageId], (err, results) => {
    if (err) {
      console.error("Error retrieving subpackages:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json(results);
  });
};

const findPackageById = (req, res) => {
  const { packageId } = req.params;
  const sql = "SELECT packageName FROM packages WHERE id = ?";
  db.query(sql, [packageId], (err, results) => {
    if (err) {
      console.error("Error retrieving package name:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: "Package not found" });
      return;
    }
    res.json(results[0]);
  });
};

const findSubpackageById = (req, res) => {
  const { subPackageId } = req.params;
  const sql = "SELECT subPackageName FROM subpackages WHERE id = ?";
  db.query(sql, [subPackageId], (err, results) => {
    if (err) {
      console.error("Error retrieving subpackage name:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: "Subpackage not found" });
      return;
    }
    res.json(results[0]);
  });
};

const updateGenerateQr = (req, res) => {
  const { id } = req.params;
  const updatedQR = req.body;
  const sql = "UPDATE generateqr SET city = ?, companyName = ? WHERE id = ?";

  db.query(sql, [updatedQR.city, updatedQR.companyName, id], (err) => {
    if (err) {
      console.error("Error updating QR:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "QR updated successfully" });
  });
};

const updatePackage = (req, res) => {
  const { id } = req.params;
  const updatedPackage = req.body;
  const sql = "UPDATE packages SET packageName = ? WHERE id = ?";

  db.query(sql, [updatedPackage.packageName, id], (err) => {
    if (err) {
      console.error("Error updating package:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "Package updated successfully" });
  });
};

const updateSubpackage = (req, res) => {
  const { id } = req.params;
  const updatedSubPackage = req.body;
  const sql = "UPDATE subpackages SET subPackageName = ? WHERE id = ?";

  db.query(sql, [updatedSubPackage.subPackageName, id], (err) => {
    if (err) {
      console.error("Error updating subpackage:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "Subpackage updated successfully" });
  });
};

const deleteGenerateQr = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM generateqr WHERE id = ?";

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("Error deleting QR:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "QR deleted successfully" });
  });
};

const deletePackage = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM packages WHERE id = ?";

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("Error deleting package:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "Package deleted successfully" });
  });
};

const deleteSubpackage = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM subpackages WHERE id = ?";

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("Error deleting subpackage:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "Subpackage deleted successfully" });
  });
};

module.exports = {
  getQrReports,
  addQrReport,
  updateQrReport,
  deleteQrReport,
  getUserByEmployeeId,
  getGenerateQr,
  getAllGenerateQr,
  getPackagesByGenerateQrId,
  getSubpackagesByPackageId,
  findPackageById,
  findSubpackageById,
  updateGenerateQr,
  updatePackage,
  updateSubpackage,
  deleteGenerateQr,
  deletePackage,
  deleteSubpackage,
};
