const { db } = require("../config/db.config");

const registerFlabo = (req, res) => {
  const {
    name,
    unqId,
    phoneNumber,
    age,
    gender,
    placedCity,
    placedCompany,
    photo,
  } = req.body;
  const checkSql = "SELECT id FROM flabos WHERE unqId = ? AND phoneNumber = ?";
  db.query(checkSql, [unqId, phoneNumber], (checkErr, checkResult) => {
    if (checkErr) {
      console.error(
        "Error checking for duplicates in MySQL database:",
        checkErr
      );
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    if (checkResult.length > 0) {
      const updateSql =
        "UPDATE flabos SET name = ?, age = ?, gender = ?, placedCity = ?, placedCompany = ? WHERE id = ?";
      db.query(
        updateSql,
        [name, age, gender, placedCity, placedCompany, checkResult[0].id],
        (updateErr) => {
          if (updateErr) {
            console.error("Error updating data in MySQL database:", updateErr);
            res.status(500).json({ error: "Internal Server Error" });
            return;
          }
          res.status(200).json({ message: "Record updated successfully" });
        }
      );
    } else {
      const insertSql =
        "INSERT INTO flabos (name, unqId, phoneNumber, age, gender, placedCity, placedCompany, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
      db.query(
        insertSql,
        [
          name,
          unqId,
          phoneNumber,
          age,
          gender,
          placedCity,
          placedCompany,
          photo,
        ],
        (insertErr) => {
          if (insertErr) {
            console.error(
              "Error inserting data into MySQL database:",
              insertErr
            );
            res.status(500).json({ error: "Internal Server Error" });
            return;
          }
          res.status(200).json({ message: "Registration successful" });
        }
      );
    }
  });
};

const getFlaboReports = (req, res) => {
  const { unqId, name, placedCity, placedCompany } = req.query;
  let sql = "SELECT * FROM flabos WHERE 1=1";
  const params = [];

  if (unqId) {
    sql += " AND unqId = ?";
    params.push(unqId);
  }

  if (name) {
    sql += " AND name = ?";
    params.push(name);
  }
  if (placedCity) {
    sql += " AND placedCity = ?";
    params.push(placedCity);
  }
  if (placedCompany) {
    sql += " AND placedCompany = ?";
    params.push(placedCompany);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error retrieving flabo reports:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json(results);
  });
};

const createFlaboReport = (req, res) => {
  const { name, unqId, phoneNumber, age, gender, placedCity, placedCompany } =
    req.body;
  const sql =
    "INSERT INTO flabos (name, unqId, phoneNumber, age, gender, placedCity, placedCompany) VALUES (?, ?, ?, ?, ?, ?, ?)";
  const params = [
    name,
    unqId,
    phoneNumber,
    age,
    gender,
    placedCity,
    placedCompany,
  ];

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error adding Flabo report:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(201).json({ id: results.insertId });
  });
};

const updateFlaboReport = (req, res) => {
  const { id } = req.params;
  const { name, unqId, phoneNumber, age, gender, placedCity, placedCompany } =
    req.body;

  const sql = `
    UPDATE flabos
    SET name = ?, unqId = ?, phoneNumber = ?, age = ?, gender = ?, placedCity = ?, placedCompany = ?
    WHERE id = ?
  `;
  const params = [
    name,
    unqId,
    phoneNumber,
    age,
    gender,
    placedCity,
    placedCompany,
    id,
  ];

  db.query(sql, params, (err) => {
    if (err) {
      console.error("Error updating Flabo report:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "Flabo report updated successfully" });
  });
};

const deleteFlaboReport = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM flabos WHERE id = ?";
  const params = [id];

  db.query(sql, params, (err) => {
    if (err) {
      console.error("Error deleting Flabo report:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "Flabo report deleted successfully" });
  });
};

module.exports = {
  registerFlabo,
  getFlaboReports,
  createFlaboReport,
  updateFlaboReport,
  deleteFlaboReport,
};
